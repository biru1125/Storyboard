// 화면(app/index.html)에서 쓸 수 있는 파일 기능만 골라서 열어 준다
const { contextBridge, ipcRenderer } = require("electron");
const call = (ch, arg) => ipcRenderer.invoke(ch, arg);
contextBridge.exposeInMainWorld("conti", {
  list: () => call("proj:list"),
  startup: () => call("proj:startup"),
  create: (name, ratio) => call("proj:new", { name, ratio }),
  open: file => call("proj:open", { file }),
  save: (project, saveAs) => call("proj:save", { project, saveAs }),
  autosave: project => call("proj:autosave", { project }),
  rename: (file, name) => call("proj:rename", { file, name }),
  remove: file => call("proj:remove", { file }),
  trash: file => call("proj:trash", { file }),
  order: (paths, pinned) => call("proj:order", { paths, pinned }),
  reveal: file => call("proj:reveal", { file }),
  libList: () => call("lib:list"),
  libAdd: items => call("lib:add", { items }),
  libUpdate: (id, t) => call("lib:update", { id, t }),
  libRemove: id => call("lib:remove", { id }),
  libPick: () => call("lib:pick"),
  setDirty: d => ipcRenderer.send("title:dirty", d),
  closeReady: () => ipcRenderer.send("close:ready"),
  exportJson: (name, json) => call("export:json", { name, json }),
  exportAi: (name, md, json, images) => call("export:ai", { name, md, json, images }),
  exportPdf: (name, html) => call("export:pdf", { name, html }),
  exportPng: (name, html, ids) => call("export:png", { name, html, ids }),
  exportXlsx: (name, eps, images) => call("export:xlsx", { name, eps, images }),
  onMenu: fn => ipcRenderer.on("menu", (e, ch) => fn(ch)),
  onBeforeClose: fn => ipcRenderer.on("before-close", () => fn())
});
