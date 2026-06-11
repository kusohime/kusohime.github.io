/**
 * 中文：配置 Astro、Markdown 数学公式，以及本地 Website Studio 文件 API。
 * English: Configures Astro, Markdown math, and the local Website Studio file API.
 *
 * Caveat / 注意：Studio 中间件只存在于 npm run dev，不会进入静态生产网站。
 * Caveat: The Studio middleware exists only in npm run dev, never in the static production site.
 */
import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { extname, isAbsolute, relative, resolve, sep } from "node:path";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

// 管理页面只在本地开发服务器中工作；口令同时保护下面的文件读写接口。
// The Studio runs only in local development; the passcode also protects its file API.
const ADMIN_PASSCODE = "0592";
const MAX_SEARCH_RESULTS = 250;

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

          const requestedPath = url.searchParams.get("path");
          if (!requestedPath) {
            sendJson(response, 400, { error: "A file path is required." });
            return;
          }

          const filePath = resolveProjectFile(requestedPath);
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

            if (request.method === "PUT") {
              await writeFile(filePath, await readBody(request), "utf8");
              sendJson(response, 200, { saved: requestedPath });
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
  vite: {
    plugins: [localStudioPlugin()],
  },
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
  },
});
