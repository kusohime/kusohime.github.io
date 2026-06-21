const studio = window.yixinStudio;

const frame = document.querySelector("[data-studio-frame]");
const loading = document.querySelector("[data-loading]");
const loadingDetail = document.querySelector("[data-loading-detail]");
const loadingRepo = document.querySelector("[data-loading-repo]");
const loadingServer = document.querySelector("[data-loading-server]");
const loadingLog = document.querySelector("[data-loading-log]");
const serverPill = document.querySelector("[data-server-pill]");
const localUrlLabel = document.querySelector("[data-local-url]");
const repoPathLabel = document.querySelector("[data-repo-path]");
const openSiteButton = document.querySelector("[data-open-site]");
const refreshFrameButton = document.querySelector("[data-refresh-frame]");
const checkButton = document.querySelector("[data-run-check]");
const buildButton = document.querySelector("[data-run-build]");
const publishButton = document.querySelector("[data-open-publish]");
const logsButton = document.querySelector("[data-open-logs]");
const restartButton = document.querySelector("[data-restart]");
const openRepoButton = document.querySelector("[data-open-repo]");
const logsDialog = document.querySelector("[data-logs-dialog]");
const publishDialog = document.querySelector("[data-publish-dialog]");
const logOutput = document.querySelector("[data-log-output]");
const showLogFileButton = document.querySelector("[data-show-log-file]");
const publishMeta = document.querySelector("[data-publish-meta]");
const publishCount = document.querySelector("[data-publish-count]");
const changedFiles = document.querySelector("[data-changed-files]");
const commitMessage = document.querySelector("[data-commit-message]");
const refreshPublishButton = document.querySelector("[data-refresh-publish]");
const selectAllButton = document.querySelector("[data-select-all]");
const selectNoneButton = document.querySelector("[data-select-none]");
const submitPublishButton = document.querySelector("[data-submit-publish]");
const publishMessage = document.querySelector("[data-publish-message]");

let currentState = {};
let currentSnapshot;
const logs = [];

function basename(path) {
  return String(path || "").split(/[\\/]/).filter(Boolean).pop() || path || "";
}

function setServerState(state) {
  currentState = { ...currentState, ...state };
  const ready = Boolean(currentState.ready);
  serverPill.textContent = ready ? "Running" : "Starting";
  serverPill.dataset.ready = String(ready);
  serverPill.dataset.stopped = String(!ready && Boolean(currentState.port));

  const repoText = currentState.repoRoot
    ? `${basename(currentState.repoRoot)} · ${currentState.repoRoot}`
    : "Locating website repository";
  repoPathLabel.textContent = repoText;
  repoPathLabel.title = currentState.repoRoot || "";
  loadingRepo.textContent = currentState.repoRoot || "Checking project folder";
  loadingRepo.title = currentState.repoRoot || "";

  localUrlLabel.textContent = ready
    ? `localhost:${currentState.port}`
    : currentState.port
      ? `starting localhost:${currentState.port}`
      : "Preparing localhost";
  loadingServer.textContent = ready
    ? `Ready at ${currentState.siteUrl}`
    : currentState.port
      ? `Starting on port ${currentState.port}`
      : "Waiting for localhost";

  openSiteButton.disabled = !currentState.siteUrl;
  refreshFrameButton.disabled = !currentState.url;

  if (ready && currentState.url) {
    if (frame.src !== currentState.url) frame.src = currentState.url;
    frame.hidden = false;
    loading.hidden = true;
  }
}

function renderLogs() {
  const text = logs.join("\n") || "No server output yet.";
  logOutput.textContent = text;
  logOutput.scrollTop = logOutput.scrollHeight;
  loadingLog.textContent = logs.slice(-12).join("\n") || "No server output yet.";
  loadingLog.scrollTop = loadingLog.scrollHeight;
}

function appendLog(line) {
  logs.push(line);
  if (logs.length > 600) logs.splice(0, logs.length - 600);
  renderLogs();
}

function entryStatusLabel(entry) {
  const status = entry.status.trim() || entry.status;
  if (status === "??") return "new";
  if (status.includes("M")) return "modified";
  if (status.includes("D")) return "deleted";
  if (status.includes("R")) return "renamed";
  if (status.includes("A")) return "added";
  return status || "changed";
}

function selectedFiles() {
  return Array.from(changedFiles.querySelectorAll("input[type='checkbox']:checked")).map(
    (checkbox) => checkbox.value,
  );
}

function syncPublishButton() {
  const selectedCount = selectedFiles().length;
  submitPublishButton.disabled =
    !currentSnapshot ||
    currentSnapshot.clean ||
    selectedCount === 0 ||
    commitMessage.value.trim().length === 0;
  if (currentSnapshot?.entries) {
    publishCount.textContent = currentSnapshot.clean
      ? "No changed files"
      : `${selectedCount} of ${currentSnapshot.entries.length} selected`;
  }
}

function renderGitStatus(snapshot) {
  currentSnapshot = snapshot;
  changedFiles.replaceChildren();

  const branch = snapshot.branch || "(no branch)";
  const upstream = snapshot.upstream ? `tracking ${snapshot.upstream}` : "no upstream";
  const sync = snapshot.upstream
    ? `${snapshot.ahead} ahead, ${snapshot.behind} behind`
    : "push will use the current branch";
  publishMeta.textContent = snapshot.clean
    ? `Branch ${branch} is clean.`
    : `Branch ${branch}, ${upstream}, ${sync}.`;

  snapshot.entries.forEach((entry) => {
    const item = document.createElement("li");
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    const filePath = document.createElement("span");
    const state = document.createElement("span");

    checkbox.type = "checkbox";
    checkbox.value = entry.path;
    checkbox.checked = true;
    checkbox.addEventListener("change", syncPublishButton);

    filePath.className = "file-path";
    filePath.textContent = entry.oldPath ? `${entry.oldPath} -> ${entry.path}` : entry.path;
    filePath.title = filePath.textContent;

    state.className = "file-status";
    state.textContent = entryStatusLabel(entry);

    label.append(checkbox, filePath, state);
    item.append(label);
    changedFiles.append(item);
  });

  syncPublishButton();
}

async function refreshPublish() {
  publishMessage.textContent = "";
  publishMeta.textContent = "Reading Git status...";
  publishCount.textContent = "Reading Git status";
  changedFiles.replaceChildren();
  submitPublishButton.disabled = true;
  try {
    renderGitStatus(await studio.gitStatus());
  } catch (error) {
    publishMeta.textContent = "Git status is unavailable.";
    publishCount.textContent = "Git unavailable";
    publishMessage.textContent = error.message || "Could not read Git status.";
  }
}

async function runTask(button, task, label) {
  button.disabled = true;
  loadingDetail.textContent = `${label} is running.`;
  try {
    const result = await task();
    if (!result.ok) throw new Error(result.error || `${label} failed.`);
    appendLog(`${label} finished.`);
  } catch (error) {
    appendLog(error.message || `${label} failed.`);
    logsDialog.showModal();
  } finally {
    button.disabled = false;
    loadingDetail.textContent = currentState.ready
      ? "Website Studio is running."
      : "Opening Astro on localhost and connecting the desktop controls.";
  }
}

openSiteButton.addEventListener("click", () => {
  if (currentState.siteUrl) studio.openExternal(currentState.siteUrl);
});

refreshFrameButton.addEventListener("click", () => {
  if (currentState.url) frame.src = currentState.url;
});

openRepoButton.addEventListener("click", () => studio.showRepo());
showLogFileButton.addEventListener("click", () => studio.showLogFile());
checkButton.addEventListener("click", () => runTask(checkButton, studio.check, "Check"));
buildButton.addEventListener("click", () => runTask(buildButton, studio.build, "Build"));

publishButton.addEventListener("click", async () => {
  publishDialog.showModal();
  await refreshPublish();
});

logsButton.addEventListener("click", () => logsDialog.showModal());

restartButton.addEventListener("click", async () => {
  restartButton.disabled = true;
  frame.hidden = true;
  loading.hidden = false;
  loadingDetail.textContent = "Restarting the local server.";
  try {
    setServerState(await studio.restart());
  } catch (error) {
    appendLog(error.message || "Restart failed.");
  } finally {
    restartButton.disabled = false;
  }
});

refreshPublishButton.addEventListener("click", refreshPublish);
commitMessage.addEventListener("input", syncPublishButton);

selectAllButton.addEventListener("click", () => {
  changedFiles.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
    checkbox.checked = true;
  });
  syncPublishButton();
});

selectNoneButton.addEventListener("click", () => {
  changedFiles.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
    checkbox.checked = false;
  });
  syncPublishButton();
});

submitPublishButton.addEventListener("click", async () => {
  const files = selectedFiles();
  const message = commitMessage.value.trim();
  submitPublishButton.disabled = true;
  publishMessage.textContent = "Publishing selected files...";
  try {
    const result = await studio.publish({ files, message });
    commitMessage.value = "";
    publishMessage.textContent = `Pushed ${result.commit} to ${result.branch}.`;
    renderGitStatus(result.status);
  } catch (error) {
    publishMessage.textContent = error.message || "Publish failed.";
  } finally {
    syncPublishButton();
  }
});

document.querySelectorAll("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.closeDialog;
    if (target === "logs") logsDialog.close();
    if (target === "publish") publishDialog.close();
  });
});

studio.onLog(appendLog);
studio.onServerState(setServerState);

studio.state().then((state) => {
  logs.push(...(state.logs || []));
  renderLogs();
  setServerState(state);
});
studio.start().then(setServerState).catch((error) => {
  serverPill.textContent = "Stopped";
  serverPill.dataset.ready = "false";
  serverPill.dataset.stopped = "true";
  loadingDetail.textContent = error.message || "The local server could not start.";
  appendLog(loadingDetail.textContent);
});
