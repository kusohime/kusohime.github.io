const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require("electron");
const { execFile, spawn } = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const net = require("node:net");
const path = require("node:path");
const { promisify } = require("node:util");

const execFileAsync = promisify(execFile);
const desktopSourceRepoRoot = path.resolve(__dirname, "../..");

let logFile;

function isWebsiteRepo(directory) {
  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(directory, "package.json"), "utf8"),
    );
    return (
      packageJson.name === "yixin-cui-portfolio" &&
      fs.existsSync(path.join(directory, "astro.config.mjs")) &&
      fs.existsSync(path.join(directory, "src", "pages", "admin", "index.astro"))
    );
  } catch {
    return false;
  }
}

function findRepoRoot() {
  const candidates = [
    process.env.YIXIN_STUDIO_REPO,
    app.isPackaged
      ? path.resolve(path.dirname(app.getPath("exe")), "../..")
      : desktopSourceRepoRoot,
    process.cwd(),
    path.resolve(process.cwd(), ".."),
    path.resolve(process.cwd(), "../.."),
  ].filter(Boolean);

  const found = candidates.find((candidate) => isWebsiteRepo(candidate));
  if (!found) {
    throw new Error(
      "Could not find the Website repository. Set YIXIN_STUDIO_REPO to the repo folder.",
    );
  }
  return path.resolve(found);
}

let repoRoot;

function resolveRepoFile(...segments) {
  const target = path.join(repoRoot, ...segments);
  if (!fs.existsSync(target)) {
    throw new Error(`Missing project file: ${path.relative(repoRoot, target)}`);
  }
  return target;
}

function electronNodeEnv(extra = {}) {
  return {
    ...process.env,
    ...extra,
    BROWSER: "none",
    ELECTRON_RUN_AS_NODE: "1",
    NO_COLOR: "1",
  };
}

function electronNodeInvocation(scriptPath, args) {
  return {
    command: process.execPath,
    args: [scriptPath, ...args],
  };
}

let mainWindow;
let serverProcess;
let serverPort;
let serverReady = false;
let serverStarting;
const logLines = [];

function addLog(line) {
  const text = String(line ?? "").trimEnd();
  if (!text) return;
  logLines.push(text);
  if (logLines.length > 600) logLines.splice(0, logLines.length - 600);
  if (logFile) {
    try {
      fs.appendFileSync(logFile, `${text}\n`);
    } catch {
      // The in-window log is still available if the file cannot be written.
    }
  }
  mainWindow?.webContents.send("studio:log", text);
}

function findFreePort() {
  return new Promise((resolvePromise, reject) => {
    const server = net.createServer();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 4321;
      server.close(() => resolvePromise(port));
    });
  });
}

function waitForServer(port, timeoutMs = 30000) {
  const started = Date.now();
  return new Promise((resolvePromise, reject) => {
    const check = () => {
      const request = http.get(
        {
          host: "127.0.0.1",
          port,
          path: "/admin/",
          timeout: 1200,
        },
        (response) => {
          response.resume();
          resolvePromise();
        },
      );
      request.on("timeout", () => request.destroy());
      request.on("error", () => {
        if (Date.now() - started > timeoutMs) {
          reject(new Error("The local Studio server did not start in time."));
          return;
        }
        setTimeout(check, 500);
      });
    };
    check();
  });
}

async function startServer() {
  if (serverReady && serverProcess && serverPort) {
    return { port: serverPort, url: `http://127.0.0.1:${serverPort}/admin/` };
  }
  if (serverStarting) return serverStarting;

  serverStarting = (async () => {
    serverPort = await findFreePort();
    serverReady = false;
    addLog(`Starting Website Studio on 127.0.0.1:${serverPort}`);

    const astroCli = resolveRepoFile("node_modules", "astro", "bin", "astro.mjs");
    const astroDev = electronNodeInvocation(astroCli, [
      "dev",
      "--host",
      "127.0.0.1",
      "--port",
      String(serverPort),
    ]);
    serverProcess = spawn(
      astroDev.command,
      astroDev.args,
      {
        cwd: repoRoot,
        env: electronNodeEnv(),
        shell: false,
        windowsHide: true,
      },
    );

    serverProcess.stdout?.on("data", (chunk) => addLog(chunk.toString()));
    serverProcess.stderr?.on("data", (chunk) => addLog(chunk.toString()));
    serverProcess.on("error", (error) => {
      addLog(`Website Studio server failed to start: ${error.message}`);
    });
    serverProcess.on("exit", (code, signal) => {
      addLog(`Website Studio server stopped (${signal ?? code ?? "closed"}).`);
      serverReady = false;
      serverProcess = undefined;
      mainWindow?.webContents.send("studio:server-state", {
        ready: false,
        port: serverPort,
      });
    });

    await waitForServer(serverPort);
    serverReady = true;
    const payload = {
      ready: true,
      port: serverPort,
      url: `http://127.0.0.1:${serverPort}/admin/`,
      siteUrl: `http://127.0.0.1:${serverPort}/`,
    };
    mainWindow?.webContents.send("studio:server-state", payload);
    return payload;
  })();

  try {
    return await serverStarting;
  } finally {
    serverStarting = undefined;
  }
}

function stopServer() {
  if (!serverProcess) return;
  addLog("Stopping Website Studio server.");
  if (process.platform === "win32" && serverProcess.pid) {
    spawn("taskkill", ["/pid", String(serverProcess.pid), "/T", "/F"], {
      windowsHide: true,
    });
  } else {
    serverProcess.kill("SIGTERM");
  }
}

async function runNodeCli(scriptPath, args, label) {
  addLog(`Running ${label}...`);
  try {
    const invocation = electronNodeInvocation(scriptPath, args);
    const { stdout, stderr } = await execFileAsync(invocation.command, invocation.args, {
      cwd: repoRoot,
      env: electronNodeEnv(),
      maxBuffer: 1024 * 1024 * 20,
      windowsHide: true,
    });
    if (stdout.trim()) addLog(stdout);
    if (stderr.trim()) addLog(stderr);
    return { ok: true, stdout, stderr };
  } catch (error) {
    const stdout = String(error?.stdout ?? "");
    const stderr = String(error?.stderr ?? "");
    if (stdout.trim()) addLog(stdout);
    if (stderr.trim()) addLog(stderr);
    return {
      ok: false,
      stdout,
      stderr,
      error: stderr.trim() || stdout.trim() || error.message || `${label} failed.`,
    };
  }
}

async function runGit(args, trim = true) {
  const { stdout, stderr } = await execFileAsync("git", args, {
    cwd: repoRoot,
    maxBuffer: 1024 * 1024 * 20,
    windowsHide: true,
  });
  return {
    stdout: trim ? stdout.trim() : stdout,
    stderr: stderr.trim(),
  };
}

function parseGitStatus(raw) {
  const chunks = raw.split("\0").filter(Boolean);
  const entries = [];
  for (let index = 0; index < chunks.length; index += 1) {
    const item = chunks[index];
    const status = item.slice(0, 2);
    const filePath = item.slice(3);
    let oldPath = "";
    if (status.includes("R") || status.includes("C")) {
      oldPath = chunks[index + 1] ?? "";
      index += 1;
    }
    entries.push({
      path: filePath,
      oldPath,
      status,
      staged: status[0] !== " " && status[0] !== "?",
      unstaged: status[1] !== " " || status[0] === "?",
    });
  }
  return entries;
}

async function gitStatus() {
  const [{ stdout: branch }, { stdout: rawStatus }] = await Promise.all([
    runGit(["branch", "--show-current"]),
    runGit(["status", "--porcelain=v1", "-z", "--untracked-files=all"], false),
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
}

function validatePublishFiles(files, snapshot) {
  const changedPaths = new Set(snapshot.entries.map((entry) => entry.path));
  return files.map((file) => String(file ?? "").replaceAll("\\", "/").trim()).filter((file) => {
    return file && !file.startsWith(".git/") && file !== ".git" && changedPaths.has(file);
  });
}

async function publishChanges({ files, message }) {
  const commitMessage = String(message ?? "").trim();
  if (!commitMessage) throw new Error("Write a commit message.");

  const snapshot = await gitStatus();
  if (!snapshot.branch) throw new Error("Git is not on a branch.");
  const selectedFiles = validatePublishFiles(Array.isArray(files) ? files : [], snapshot);
  if (selectedFiles.length === 0) throw new Error("Choose at least one changed file.");

  addLog(`Publishing ${selectedFiles.length} file(s) to ${snapshot.branch}.`);
  await runGit(["add", "--", ...selectedFiles]);
  await runGit(["commit", "-m", commitMessage, "--only", "--", ...selectedFiles]);
  await runGit(["pull", "--rebase", "--autostash", "origin", snapshot.branch]);
  await runGit(["push", "origin", snapshot.branch]);
  const { stdout: commit } = await runGit(["rev-parse", "--short", "HEAD"]);
  addLog(`Pushed ${commit} to ${snapshot.branch}.`);
  return {
    branch: snapshot.branch,
    commit,
    status: await gitStatus(),
  };
}

function createWindow() {
  Menu.setApplicationMenu(null);
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 980,
    minHeight: 640,
    title: "Yixin Studio",
    backgroundColor: "#efeee9",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.cjs"),
      webviewTag: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "renderer.html"));
  mainWindow.setMenuBarVisibility(false);
  mainWindow.on("closed", () => {
    mainWindow = undefined;
  });
}

ipcMain.handle("studio:start", startServer);
ipcMain.handle("studio:restart", async () => {
  stopServer();
  await new Promise((resolvePromise) => setTimeout(resolvePromise, 800));
  return startServer();
});
ipcMain.handle("studio:state", async () => ({
  ready: serverReady,
  port: serverPort,
  url: serverPort ? `http://127.0.0.1:${serverPort}/admin/` : "",
  siteUrl: serverPort ? `http://127.0.0.1:${serverPort}/` : "",
  logFile,
  repoRoot,
  logs: logLines,
}));
ipcMain.handle("studio:open-external", async (_event, url) => {
  await shell.openExternal(String(url));
});
ipcMain.handle("studio:show-repo", async () => {
  await shell.openPath(repoRoot);
});
ipcMain.handle("studio:show-log", async () => {
  if (logFile) shell.showItemInFolder(logFile);
});
ipcMain.handle("studio:check", () =>
  runNodeCli(
    resolveRepoFile("node_modules", "@astrojs", "check", "bin", "astro-check.js"),
    [],
    "site check",
  ),
);
ipcMain.handle("studio:build", () =>
  runNodeCli(
    resolveRepoFile("node_modules", "astro", "bin", "astro.mjs"),
    ["build"],
    "site build",
  ),
);
ipcMain.handle("studio:git-status", gitStatus);
ipcMain.handle("studio:publish", (_event, payload) => publishChanges(payload));

app.whenReady().then(() => {
  try {
    repoRoot = findRepoRoot();
    logFile = path.join(app.getPath("userData"), "studio.log");
    fs.mkdirSync(path.dirname(logFile), { recursive: true });
    fs.writeFileSync(logFile, "");
  } catch (error) {
    dialog.showErrorBox(
      "Yixin Studio could not find the website",
      error.message || String(error),
    );
    app.quit();
    return;
  }

  createWindow();
  addLog(`Using website repository: ${repoRoot}`);
  startServer().catch((error) => {
    addLog(error.message);
    dialog.showErrorBox("Yixin Studio could not start", error.message);
  });
});

app.on("window-all-closed", () => {
  stopServer();
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", stopServer);

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
