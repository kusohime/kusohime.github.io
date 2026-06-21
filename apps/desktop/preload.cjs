const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("yixinStudio", {
  start: () => ipcRenderer.invoke("studio:start"),
  restart: () => ipcRenderer.invoke("studio:restart"),
  state: () => ipcRenderer.invoke("studio:state"),
  openExternal: (url) => ipcRenderer.invoke("studio:open-external", url),
  showRepo: () => ipcRenderer.invoke("studio:show-repo"),
  showLogFile: () => ipcRenderer.invoke("studio:show-log"),
  check: () => ipcRenderer.invoke("studio:check"),
  build: () => ipcRenderer.invoke("studio:build"),
  gitStatus: () => ipcRenderer.invoke("studio:git-status"),
  publish: (payload) => ipcRenderer.invoke("studio:publish", payload),
  onLog: (callback) => {
    const listener = (_event, line) => callback(line);
    ipcRenderer.on("studio:log", listener);
    return () => ipcRenderer.removeListener("studio:log", listener);
  },
  onServerState: (callback) => {
    const listener = (_event, state) => callback(state);
    ipcRenderer.on("studio:server-state", listener);
    return () => ipcRenderer.removeListener("studio:server-state", listener);
  },
});
