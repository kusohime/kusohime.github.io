/**
 * 中文：配置 Astro、Markdown 数学公式，以及本地 Website Studio 文件 API。
 * English: Configures Astro, Markdown math, and the local Website Studio file API.
 *
 * Caveat / 注意：Studio 中间件只存在于 npm run dev，不会进入静态生产网站。
 * Caveat: The Studio middleware exists only in npm run dev, never in the static production site.
 */
import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import { execFile } from "node:child_process";
import { mkdir, readdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import { dirname, extname, isAbsolute, relative, resolve, sep } from "node:path";
import { promisify } from "node:util";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import remarkInlineFootnotes from "./src/lib/remarkInlineFootnotes.mjs";

// 管理页面只在本地开发服务器中工作；文件读写接口仍只接受本地请求。
// The Studio runs only in local development; its file API still accepts local requests only.
const ADMIN_PASSCODE = "0592";
const MAX_SEARCH_RESULTS = 250;
const execFileAsync = promisify(execFile);

const ignoredDirectories = new Set([
  ".astro",
  ".git",
  ".npm-cache",
  "dist",
  "node_modules",
]);

const editableExtensions = new Set([
  ".astro",
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".svg",
  ".ts",
  ".txt",
  ".yaml",
  ".yml",
]);

const imageExtensions = new Set([
  ".avif",
  ".gif",
  ".jpeg",
  ".jpg",
  ".png",
  ".svg",
  ".webp",
]);

const imageContentTypes = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function localStudioPlugin() {
  const projectRoot = resolve(".");

  // 所有文件请求都必须留在项目根目录内，避免通过 ../ 读取其他位置。
  // Every file request must remain inside the project root; reject ../ traversal.
  const resolveProjectFile = (requestedPath) => {
    const normalizedPath = requestedPath.replaceAll("\\", "/");
    const absolutePath = resolve(projectRoot, normalizedPath);
    const relativePath = relative(projectRoot, absolutePath);

    if (
      !relativePath ||
      relativePath.startsWith(`..${sep}`) ||
      relativePath === ".." ||
      isAbsolute(relativePath)
    ) {
      throw new Error("Invalid project path.");
    }

    return absolutePath;
  };

  const scanProject = async (directory = projectRoot, parentPath = "") => {
    const files = [];
    const images = [];

    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = parentPath ? `${parentPath}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        if (!ignoredDirectories.has(entry.name)) {
          const nested = await scanProject(resolve(directory, entry.name), path);
          files.push(...nested.files);
          images.push(...nested.images);
        }
        continue;
      }

      const extension = extname(entry.name).toLowerCase();
      if (editableExtensions.has(extension)) files.push(path);
      if (imageExtensions.has(extension)) images.push(path);
    }

    return { files, images };
  };

  // 全局搜索在服务器端完成，浏览器不需要先下载全部文件。
  // Global search runs server-side so the browser need not download every file first.
  const searchProject = async (query) => {
    const normalizedQuery = query.toLocaleLowerCase();
    const { files } = await scanProject();
    const results = [];

    for (const path of files.sort((a, b) => a.localeCompare(b))) {
      const filePath = resolveProjectFile(path);
      const lines = (await readFile(filePath, "utf8")).split(/\r?\n/);

      for (let index = 0; index < lines.length; index += 1) {
        const column = lines[index].toLocaleLowerCase().indexOf(normalizedQuery);
        if (column < 0) continue;

        results.push({
          path,
          line: index + 1,
          column: column + 1,
          excerpt: lines[index].trim().slice(0, 180),
        });

        if (results.length >= MAX_SEARCH_RESULTS) return results;
      }
    }

    return results;
  };

  const isLocalRequest = (request) => {
    const address = request.socket.remoteAddress ?? "";
    return (
      address === "127.0.0.1" ||
      address === "::1" ||
      address === "::ffff:127.0.0.1"
    );
  };

  const sendJson = (response, statusCode, value) => {
    response.statusCode = statusCode;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.setHeader("Cache-Control", "no-store");
    response.end(JSON.stringify(value));
  };

  const readBody = async (request) => {
    const chunks = [];
    let size = 0;

    for await (const chunk of request) {
      size += chunk.length;
      if (size > 10 * 1024 * 1024) {
        throw new Error("The file is too large for the Studio editor.");
      }
      chunks.push(chunk);
    }

    return Buffer.concat(chunks).toString("utf8");
  };

  // 二进制读取（图片上传用）；与 readBody 同样有 10MB 上限。
  // Binary read for image uploads; same 10 MB cap as readBody.
  const readBodyBuffer = async (request) => {
    const chunks = [];
    let size = 0;

    for await (const chunk of request) {
      size += chunk.length;
      if (size > 10 * 1024 * 1024) {
        throw new Error("The image is too large (10 MB limit).");
      }
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  };

  const runGit = async (args, options = {}) => {
    try {
      const { stdout, stderr } = await execFileAsync("git", args, {
        cwd: projectRoot,
        maxBuffer: 1024 * 1024 * 10,
        windowsHide: true,
      });
      return {
        stdout: options.trim === false ? stdout : stdout.trim(),
        stderr: stderr.trim(),
      };
    } catch (error) {
      const stderr = String(error?.stderr ?? "").trim();
      const stdout = String(error?.stdout ?? "").trim();
      const message = stderr || stdout || error.message || "Git command failed.";
      throw new Error(message);
    }
  };

  const parseGitStatus = (raw) => {
    const chunks = raw.split("\0").filter(Boolean);
    const entries = [];

    for (let index = 0; index < chunks.length; index += 1) {
      const item = chunks[index];
      const status = item.slice(0, 2);
      const path = item.slice(3);
      let oldPath = "";

      if (status.includes("R") || status.includes("C")) {
        oldPath = chunks[index + 1] ?? "";
        index += 1;
      }

      entries.push({
        path,
        oldPath,
        status,
        staged: status[0] !== " " && status[0] !== "?",
        unstaged: status[1] !== " " || status[0] === "?",
      });
    }

    return entries;
  };

  const gitSnapshot = async () => {
    const [{ stdout: branch }, { stdout: rawStatus }] = await Promise.all([
      runGit(["branch", "--show-current"]),
      runGit(["status", "--porcelain=v1", "-z", "--untracked-files=all"], { trim: false }),
    ]);

    let upstream = "";
    let ahead = 0;
    let behind = 0;
    try {
      upstream = (await runGit(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"])).stdout;
      const counts = (await runGit(["rev-list", "--left-right", "--count", "HEAD...@{u}"])).stdout
        .split(/\s+/)
        .map((value) => Number(value));
      ahead = counts[0] || 0;
      behind = counts[1] || 0;
    } catch {
      upstream = "";
    }

    const entries = parseGitStatus(rawStatus);
    return {
      branch,
      upstream,
      ahead,
      behind,
      clean: entries.length === 0,
      entries,
    };
  };

  const validateGitPath = (path) => {
    const normalizedPath = String(path ?? "").replaceAll("\\", "/").trim();
    if (
      !normalizedPath ||
      normalizedPath === ".git" ||
      normalizedPath.startsWith(".git/")
    ) {
      throw new Error("Invalid Git path.");
    }
    resolveProjectFile(normalizedPath);
    return normalizedPath;
  };

  return {
    name: "local-website-studio",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        if (!request.url?.startsWith("/__admin/api/")) {
          next();
          return;
        }

        if (!isLocalRequest(request)) {
          sendJson(response, 403, { error: "Website Studio is local only." });
          return;
        }

        if (request.headers["x-studio-passcode"] !== ADMIN_PASSCODE) {
          sendJson(response, 401, { error: "Incorrect Studio passcode." });
          return;
        }

        try {
          const url = new URL(request.url, "http://localhost");

          if (url.pathname === "/__admin/api/files" && request.method === "GET") {
            const project = await scanProject();
            project.files.sort((a, b) => a.localeCompare(b));
            project.images.sort((a, b) => a.localeCompare(b));
            sendJson(response, 200, project);
            return;
          }

          if (url.pathname === "/__admin/api/git/status" && request.method === "GET") {
            sendJson(response, 200, await gitSnapshot());
            return;
          }

          if (url.pathname === "/__admin/api/git/publish" && request.method === "POST") {
            const payload = JSON.parse(await readBody(request));
            const message = String(payload.message ?? "").trim();
            const files = Array.isArray(payload.files)
              ? payload.files.map(validateGitPath)
              : [];

            if (!message) {
              sendJson(response, 400, { error: "A commit message is required." });
              return;
            }
            if (files.length === 0) {
              sendJson(response, 400, { error: "Choose at least one changed file." });
              return;
            }

            const snapshot = await gitSnapshot();
            if (!snapshot.branch) {
              sendJson(response, 400, { error: "Git is not on a branch." });
              return;
            }

            const changedPaths = new Set(snapshot.entries.map((entry) => entry.path));
            const unknown = files.find((file) => !changedPaths.has(file));
            if (unknown) {
              sendJson(response, 400, { error: `${unknown} is not currently changed.` });
              return;
            }

            await runGit(["add", "--", ...files]);
            await runGit(["commit", "-m", message, "--only", "--", ...files]);
            await runGit(["pull", "--rebase", "--autostash", "origin", snapshot.branch]);
            await runGit(["push", "origin", snapshot.branch]);
            const { stdout: commit } = await runGit(["rev-parse", "--short", "HEAD"]);
            sendJson(response, 200, {
              branch: snapshot.branch,
              commit,
              status: await gitSnapshot(),
            });
            return;
          }

          if (
            url.pathname === "/__admin/api/search" &&
            request.method === "GET"
          ) {
            const query = url.searchParams.get("q")?.trim() ?? "";
            if (query.length < 2) {
              sendJson(response, 400, {
                error: "Enter at least two characters to search.",
              });
              return;
            }

            sendJson(response, 200, {
              query,
              results: await searchProject(query),
            });
            return;
          }

          if (url.pathname === "/__admin/api/move" && request.method === "POST") {
            const payload = JSON.parse(await readBody(request));
            const from = String(payload.from ?? "");
            const to = String(payload.to ?? "");
            if (!from || !to) {
              sendJson(response, 400, { error: "Source and destination paths are required." });
              return;
            }

            const fromPath = resolveProjectFile(from);
            const toPath = resolveProjectFile(to);
            await stat(fromPath);
            try {
              await stat(toPath);
              sendJson(response, 409, { error: "Destination already exists." });
              return;
            } catch (error) {
              if (
                !(error instanceof Error) ||
                !("code" in error) ||
                error.code !== "ENOENT"
              ) {
                throw error;
              }
            }

            await mkdir(dirname(toPath), { recursive: true });
            await rename(fromPath, toPath);
            sendJson(response, 200, { moved: from, to });
            return;
          }

          const requestedPath = url.searchParams.get("path");
          if (!requestedPath) {
            sendJson(response, 400, { error: "A file path is required." });
            return;
          }

          const filePath = resolveProjectFile(requestedPath);

          // PUT 可以创建尚不存在的文件（用于 Studio 的 Add page）。
          // PUT may create files that do not exist yet (Studio's Add page).
          if (
            url.pathname === "/__admin/api/file" &&
            request.method === "PUT"
          ) {
            if (!editableExtensions.has(extname(filePath).toLowerCase())) {
              sendJson(response, 415, { error: "This file type is not editable." });
              return;
            }
            await mkdir(dirname(filePath), { recursive: true });
            await writeFile(filePath, await readBody(request), "utf8");
            sendJson(response, 200, { saved: requestedPath });
            return;
          }

          // 上传/替换站点图片：二进制写入，仅允许 public/images/ 内的图片扩展名。
          // Upload/replace a site image: binary write, restricted to image types under public/images/.
          if (
            url.pathname === "/__admin/api/image" &&
            request.method === "PUT"
          ) {
            const normalized = requestedPath.replaceAll("\\", "/");
            if (
              normalized !== "public/images" &&
              !normalized.startsWith("public/images/")
            ) {
              sendJson(response, 400, {
                error: "Images must be saved under public/images/.",
              });
              return;
            }
            if (!imageExtensions.has(extname(filePath).toLowerCase())) {
              sendJson(response, 415, { error: "Unsupported image type." });
              return;
            }
            await mkdir(dirname(filePath), { recursive: true });
            await writeFile(filePath, await readBodyBuffer(request));
            sendJson(response, 200, { saved: requestedPath });
            return;
          }

          const fileStats = await stat(filePath);
          if (!fileStats.isFile()) {
            sendJson(response, 404, { error: "File not found." });
            return;
          }

          if (url.pathname === "/__admin/api/file") {
            if (!editableExtensions.has(extname(filePath).toLowerCase())) {
              sendJson(response, 415, { error: "This file type is not editable." });
              return;
            }

            if (request.method === "GET") {
              response.statusCode = 200;
              response.setHeader("Content-Type", "text/plain; charset=utf-8");
              response.setHeader("Cache-Control", "no-store");
              response.end(await readFile(filePath, "utf8"));
              return;
            }
          }

          if (
            url.pathname === "/__admin/api/image" &&
            request.method === "GET"
          ) {
            const extension = extname(filePath).toLowerCase();
            if (!imageExtensions.has(extension)) {
              sendJson(response, 415, { error: "This file is not an image." });
              return;
            }

            response.statusCode = 200;
            response.setHeader(
              "Content-Type",
              imageContentTypes[extension] ?? "application/octet-stream",
            );
            response.setHeader("Cache-Control", "no-store");
            response.end(await readFile(filePath));
            return;
          }

          sendJson(response, 405, { error: "Unsupported Studio request." });
        } catch (error) {
          sendJson(response, 500, {
            error: error instanceof Error ? error.message : "Studio request failed.",
          });
        }
      });
    },
  };
}

export default defineConfig({
  site: "https://yixincui.com",
  output: "static",
  devToolbar: {
    enabled: false,
  },
  vite: {
    plugins: [localStudioPlugin()],
  },
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath, remarkInlineFootnotes],
      rehypePlugins: [rehypeKatex],
    }),
  },
});
