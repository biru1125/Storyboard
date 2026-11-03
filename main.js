// 스토리보드 데스크톱 앱 (Electron). 화면은 app/index.html, 프로젝트 파일·목록·내 레퍼런스·내보내기는 여기서 처리한다.
const { app, BrowserWindow, Menu, dialog, ipcMain, protocol, net, shell } = require("electron");
const path = require("path"), fs = require("fs"), url = require("url"), crypto = require("crypto");

const SMOKE = process.env.CONTI_SMOKE;
if (SMOKE) app.setPath("userData", path.join(SMOKE, "ud"));
const APP_DIR = path.join(__dirname, "app");
// 새 프로젝트와 내 레퍼런스가 놓이는 폴더 (문서/스토리보드)
const ROOT = () => SMOKE ? path.join(SMOKE, "docs") : path.join(app.getPath("documents"), "스토리보드");
const LIB_DIR = () => path.join(ROOT(), "내 레퍼런스");
const LIB_INDEX = () => path.join(LIB_DIR(), "index.json");
const RECENT = () => path.join(app.getPath("userData"), "projects.json");
// 윈도우 휴지통을 쓸 수 없는 드라이브(휴지통 설정이 '바로 제거')일 때 지운 파일을 옮겨 두는 폴더
const APP_TRASH = () => path.join(ROOT(), "휴지통");
// 예전 이름(콘티보드)일 때 쓰던 폴더. 처음 실행할 때 거기 있던 프로젝트도 목록에 넣는다
const LEGACY_ROOT = () => SMOKE ? null : path.join(app.getPath("documents"), "콘티보드");
let win, current = null; // 지금 열린 프로젝트 파일 경로

protocol.registerSchemesAsPrivileged([{ scheme: "app", privileges: { standard: true, secure: true, supportFetchAPI: true } }]);

const readJSON = (p, d) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return d; } };
const writeAtomic = (p, s) => { const t = p + ".tmp"; fs.writeFileSync(t, s); fs.renameSync(t, p); };
const EXT = ".json";
const isProjFile = f => /\.(json|conti)$/i.test(f);
const nameOf = p => path.basename(p).replace(/\.(json|conti)$/i, "");
const same = (a, b) => path.resolve(a).toLowerCase() === path.resolve(b).toLowerCase();
const safeName = s => String(s || "").replace(/[\\/:*?"<>|]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);

function setTitle(dirty) {
  win && win.setTitle(`${dirty ? "● " : ""}${current ? nameOf(current) + " — " : ""}스토리보드`);
}

function createWindow() {
  win = new BrowserWindow({
    width: 1440, height: 960, minWidth: 960, minHeight: 600, title: "스토리보드",
    backgroundColor: "#16181B",
    webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true, sandbox: false }
  });
  if (SMOKE) require("./scripts/smoke-run")(win, app);
  win.loadURL("app://local/index.html");
  win.webContents.setWindowOpenHandler(({ url: u }) => { if (/^https?:/.test(u)) shell.openExternal(u); return { action: "deny" }; });
  win.on("close", e => {
    // 닫기 전에 화면에 남은 변경을 저장하게 한 번 기다린다
    if (win.__closing) return;
    e.preventDefault(); win.__closing = true;
    win.webContents.send("before-close");
    setTimeout(() => win && win.destroy(), 1500);
  });
}

function buildMenu() {
  const send = ch => () => win && win.webContents.send("menu", ch);
  const tpl = [
    ...(process.platform === "darwin" ? [{ role: "appMenu" }] : []),
    { label: "파일", submenu: [
      { label: "새 프로젝트…", accelerator: "CmdOrCtrl+N", click: send("new") },
      { label: "불러오기…", accelerator: "CmdOrCtrl+O", click: send("open") },
      { label: "프로젝트 목록", accelerator: "CmdOrCtrl+L", click: send("drawer") },
      { type: "separator" },
      { label: "저장", accelerator: "CmdOrCtrl+S", click: send("save") },
      { label: "다른 이름으로 저장…", accelerator: "CmdOrCtrl+Shift+S", click: send("saveAs") },
      { type: "separator" },
      { label: "내보내기", submenu: [
        { label: "AI용 폴더 (콘티.md + 콘티.json + 이미지)…", click: send("export:ai") },
        { label: "PDF 콘티북…", click: send("export:pdf") },
        { label: "엑셀 (.xlsx)…", click: send("export:xlsx") },
        { label: "컷 카드 이미지 (PNG)…", click: send("export:png") },
        { label: "프로젝트 파일 (.json)…", click: send("export:json") }
      ] },
      { type: "separator" },
      process.platform === "darwin" ? { role: "close", label: "닫기" } : { role: "quit", label: "끝내기" }
    ] },
    { label: "편집", submenu: [
      { label: "되돌리기", accelerator: "CmdOrCtrl+Z", click: send("undo") },
      { label: "앞으로가기", accelerator: process.platform === "darwin" ? "Cmd+Shift+Z" : "Ctrl+Y", click: send("redo") },
      ...(process.platform === "darwin" ? [] : [{ label: "앞으로가기", accelerator: "Ctrl+Shift+Z", click: send("redo"), visible: false }]),
      { type: "separator" },
      { role: "cut", label: "잘라내기" }, { role: "copy", label: "복사" }, { role: "paste", label: "붙여넣기" }, { role: "selectAll", label: "모두 선택" }
    ] },
    { label: "보기", submenu: [
      { label: "밝은 화면 / 어두운 화면", accelerator: "CmdOrCtrl+Shift+L", click: send("theme") },
      { type: "separator" },
      { role: "resetZoom", label: "기본 크기" }, { role: "zoomIn", label: "확대" }, { role: "zoomOut", label: "축소" },
      { type: "separator" }, { role: "togglefullscreen", label: "전체 화면" }, { role: "toggleDevTools", label: "개발자 도구" }
    ] }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(tpl));
}

/* 프로젝트 목록: 사용자가 정한 순서 그대로. 고정한 것은 화면에서 위에 모아 보여 준다 */
function recent() {
  let r = readJSON(RECENT(), null);
  if (!r) {
    // 처음 실행이면 문서/스토리보드(와 예전 문서/콘티보드) 폴더에 있는 프로젝트를 목록에 넣어 둔다
    r = { items: [] };
    for (const dir of [ROOT(), LEGACY_ROOT()].filter(Boolean)) {
      try { fs.readdirSync(dir).filter(isProjFile).map(f => path.join(dir, f)).filter(isProject).forEach(p => r.items.push({ path: p, pinned: false })); } catch {}
    }
    saveRecent(r);
  }
  return r;
}
function saveRecent(r) { fs.mkdirSync(path.dirname(RECENT()), { recursive: true }); fs.writeFileSync(RECENT(), JSON.stringify(r, null, 1)); }
function addRecent(p) {
  const r = recent();
  if (!r.items.some(x => same(x.path, p))) {
    // 새로 들어온 프로젝트는 고정한 것들 바로 아래(일반 목록의 맨 위)에 넣는다
    const k = r.items.filter(x => x.pinned).length;
    r.items.splice(k, 0, { path: p, pinned: false });
  }
  r.current = p; saveRecent(r);
}
function dropRecent(file) {
  const r = recent(); r.items = r.items.filter(x => !same(x.path, file)); saveRecent(r);
  if (current && same(current, file)) { current = null; setTitle(false); }
}
function listProjects() {
  const r = recent();
  return r.items.map(x => ({ path: x.path, name: nameOf(x.path), pinned: !!x.pinned, exists: fs.existsSync(x.path), current: !!current && same(x.path, current) }));
}

/* 프로젝트 파일: 기본은 .json (예전 .conti도 연다) */
const PROJ_FILTER = [{ name: "스토리보드 프로젝트 (.json)", extensions: ["json"] }];
const packProject = project => JSON.stringify({ format: "conti-board", version: 2, savedAt: new Date().toISOString(), project }, null, 1);
const emptyProject = ratio => ({ ratio: ratio || "9:16", chars: [], eps: [{ id: "e" + Date.now().toString(36), no: 1, title: "1화", cuts: [] }] });
function isProject(p) { const d = readJSON(p, null); return !!(d && d.format === "conti-board" && d.project); }
function readProject(p) {
  const d = readJSON(p, null);
  if (d && (d.format === "conti-board" || d.format === "conti-board-export") && d.project) return d.project;
  throw new Error("스토리보드 프로젝트 파일이 아니에요");
}
function openProject(p) {
  const project = readProject(p);
  current = p; addRecent(p); setTitle(false);
  return { path: p, name: nameOf(p), project };
}
function freePath(dir, name) {
  let p = path.join(dir, name + EXT), n = 2;
  while (fs.existsSync(p)) p = path.join(dir, `${name} (${n++})${EXT}`);
  return p;
}
// 저장 위치 고르기. 확장자를 빼먹으면 .json을 붙인다
async function pickProjectPath(title, defName) {
  fs.mkdirSync(ROOT(), { recursive: true });
  if (SMOKE) return freePath(ROOT(), defName);
  const r = await dialog.showSaveDialog(win, { title, defaultPath: path.join(ROOT(), defName + EXT), filters: PROJ_FILTER });
  if (r.canceled || !r.filePath) return null;
  return isProjFile(r.filePath) ? r.filePath : r.filePath + EXT;
}

ipcMain.handle("proj:list", () => listProjects());
ipcMain.handle("proj:startup", () => {
  const argFile = process.argv.slice(1).find(a => isProjFile(a) && fs.existsSync(a) && isProject(a));
  const r = recent();
  const cands = [argFile, r.current, ...r.items.map(x => x.path)].filter(Boolean);
  for (const p of cands) { try { if (fs.existsSync(p)) return openProject(p); } catch {} }
  current = null; setTitle(false);
  return null;
});
ipcMain.handle("proj:new", async (e, { name, ratio }) => {
  const p = await pickProjectPath("새 프로젝트 저장 위치", safeName(name) || "새 스토리보드");
  if (!p) return null;
  writeAtomic(p, packProject(emptyProject(ratio)));
  return openProject(p);
});
ipcMain.handle("proj:open", async (e, { file } = {}) => {
  let p = file;
  if (!p) {
    if (SMOKE) return null;
    const r = await dialog.showOpenDialog(win, { title: "스토리보드 불러오기", filters: [{ name: "스토리보드 프로젝트", extensions: ["json", "conti"] }], properties: ["openFile"] });
    if (r.canceled) return null;
    p = r.filePaths[0];
  }
  const d = readJSON(p, null);
  if (d && d.format === "conti-board-export" && d.project) {
    // 내보낸 콘티.json은 그대로 덮어쓰지 않고, 고른 위치에 프로젝트 파일로 새로 만들어 연다
    const np = await pickProjectPath("불러온 내보내기를 프로젝트로 저장할 위치", safeName(d.title) || nameOf(p));
    if (!np) return null;
    writeAtomic(np, packProject(d.project));
    return openProject(np);
  }
  return openProject(p);
});
ipcMain.handle("proj:save", async (e, { project, saveAs }) => {
  let p = current;
  if (!p || saveAs) {
    p = await pickProjectPath("다른 이름으로 저장", p ? nameOf(p) : "스토리보드");
    if (!p) return null;
  }
  writeAtomic(p, packProject(project));
  if (!current || !same(p, current)) { current = p; addRecent(p); }
  setTitle(false);
  return { path: p, name: nameOf(p) };
});
ipcMain.handle("proj:autosave", (e, { project }) => {
  if (!current) return null;
  writeAtomic(current, packProject(project)); setTitle(false);
  return { path: current };
});
ipcMain.handle("proj:rename", (e, { file, name }) => {
  const n = safeName(name); if (!n) throw new Error("이름을 입력해 주세요");
  const np = path.join(path.dirname(file), n + path.extname(file));
  if (same(np, file)) return { path: file, name: n };
  if (fs.existsSync(np)) throw new Error("같은 이름의 프로젝트가 이미 있어요");
  fs.renameSync(file, np);
  const r = recent();
  r.items.forEach(x => { if (same(x.path, file)) x.path = np; });
  if (r.current && same(r.current, file)) r.current = np;
  saveRecent(r);
  if (current && same(current, file)) { current = np; setTitle(false); }
  return { path: np, name: n };
});
ipcMain.handle("proj:remove", (e, { file }) => { dropRecent(file); return listProjects(); });
// 삭제는 윈도우(맥) 휴지통으로 보낸다. 그 드라이브가 휴지통을 쓰지 않게 설정돼 있으면
// 스토리보드 폴더의 '휴지통' 폴더로 옮긴다. 어느 쪽이든 되살릴 수 있고, 완전히 지우지는 않는다
async function toTrash(file) {
  try { await shell.trashItem(file); return { where: "system" }; }
  catch {
    fs.mkdirSync(APP_TRASH(), { recursive: true });
    const ext = path.extname(file), base = path.basename(file, ext);
    let dst = path.join(APP_TRASH(), base + ext), n = 2;
    while (fs.existsSync(dst)) dst = path.join(APP_TRASH(), `${base} (${n++})${ext}`);
    try { fs.renameSync(file, dst); } catch { fs.copyFileSync(file, dst); fs.unlinkSync(file); }
    return { where: "app", dir: APP_TRASH() };
  }
}
ipcMain.handle("proj:trash", async (e, { file }) => {
  const r = fs.existsSync(file) ? await toTrash(file) : { where: "none" };
  dropRecent(file); return { list: listProjects(), where: r.where, dir: r.dir };
});
ipcMain.handle("proj:order", (e, { paths, pinned }) => {
  const r = recent(), by = p => r.items.find(x => same(x.path, p));
  r.items = paths.map(by).filter(Boolean).map(x => Object.assign(x, { pinned: pinned.some(q => same(q, x.path)) }));
  saveRecent(r); return listProjects();
});
ipcMain.handle("proj:reveal", (e, { file }) => { shell.showItemInFolder(file || ROOT()); });
ipcMain.on("title:dirty", (e, dirty) => setTitle(dirty));
ipcMain.on("close:ready", () => win && win.destroy());

/* 내 레퍼런스: 문서/스토리보드/내 레퍼런스 폴더에 이미지와 index.json. 모든 프로젝트에서 같이 쓴다 */
const libRead = () => readJSON(LIB_INDEX(), []);
const libWrite = l => { fs.mkdirSync(LIB_DIR(), { recursive: true }); writeAtomic(LIB_INDEX(), JSON.stringify(l, null, 1)); };
const b64 = dataUrl => Buffer.from(dataUrl.split(",")[1], "base64");
ipcMain.handle("lib:list", () => libRead());
ipcMain.handle("lib:add", (e, { items }) => {
  const l = libRead(), out = [];
  fs.mkdirSync(LIB_DIR(), { recursive: true });
  for (const it of items) {
    const id = crypto.randomBytes(5).toString("hex"), file = id + ".jpg";
    fs.writeFileSync(path.join(LIB_DIR(), file), b64(it.dataUrl));
    const ent = { id, file, name: String(it.name || "").slice(0, 120), t: it.t || {}, added: new Date().toISOString() };
    l.push(ent); out.push(ent);
  }
  libWrite(l); return out;
});
ipcMain.handle("lib:update", (e, { id, t }) => { const l = libRead(); const x = l.find(y => y.id === id); if (x) x.t = t; libWrite(l); return x; });
ipcMain.handle("lib:remove", async (e, { id }) => {
  const l = libRead(), x = l.find(y => y.id === id);
  if (x) { const f = path.join(LIB_DIR(), x.file); if (fs.existsSync(f)) await toTrash(f); }
  libWrite(l.filter(y => y.id !== id)); return true;
});
ipcMain.handle("lib:pick", async () => {
  if (SMOKE) return [];
  const r = await dialog.showOpenDialog(win, { title: "레퍼런스 사진 고르기", filters: [{ name: "이미지", extensions: ["jpg", "jpeg", "png", "webp", "gif", "bmp"] }], properties: ["openFile", "multiSelections"] });
  if (r.canceled) return [];
  const mime = { ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif", ".bmp": "image/bmp" };
  return r.filePaths.map(p => ({ name: path.basename(p), dataUrl: `data:${mime[path.extname(p).toLowerCase()] || "image/jpeg"};base64,` + fs.readFileSync(p).toString("base64") }));
});

/* 내보내기 */
async function pickSave(defName, ext, label) {
  if (SMOKE) return path.join(SMOKE, defName);
  const r = await dialog.showSaveDialog(win, { defaultPath: defName, filters: [{ name: label, extensions: [ext] }] });
  return r.canceled ? null : r.filePath;
}
async function pickFolder(title) {
  if (SMOKE) return SMOKE;
  const r = await dialog.showOpenDialog(win, { title, properties: ["openDirectory", "createDirectory"] });
  return r.canceled ? null : r.filePaths[0];
}

ipcMain.handle("export:json", async (e, { name, json }) => {
  const p = await pickSave(`${safeName(name)}.json`, "json", "JSON"); if (!p) return null;
  fs.writeFileSync(p, json); return { path: p };
});
ipcMain.handle("export:ai", async (e, { name, md, json, images }) => {
  const base = await pickFolder("AI용 내보내기 폴더를 만들 위치"); if (!base) return null;
  const dir = path.join(base, `${safeName(name)}_내보내기`); fs.mkdirSync(path.join(dir, "refs"), { recursive: true });
  fs.writeFileSync(path.join(dir, "콘티.md"), md); fs.writeFileSync(path.join(dir, "콘티.json"), json);
  for (const [n, d] of Object.entries(images)) fs.writeFileSync(path.join(dir, "refs", n), b64(d));
  if (!SMOKE) shell.openPath(dir); return { path: dir };
});
// 화면에 안 보이는 창에 인쇄용 HTML을 띄워 PDF·PNG로 만든다
async function offscreen(html, width, height) {
  const w = new BrowserWindow({ show: false, width, height, paintWhenInitiallyHidden: true, webPreferences: { offscreen: false, backgroundThrottling: false } });
  const tmp = path.join(app.getPath("temp"), `conti-export-${Date.now()}.html`);
  fs.writeFileSync(tmp, html);
  await w.loadURL(url.pathToFileURL(tmp).href);
  await w.webContents.executeJavaScript("document.fonts.ready.then(()=>Promise.all([...document.images].map(i=>i.complete?1:new Promise(r=>{i.onload=i.onerror=r}))))");
  return { w, tmp };
}
ipcMain.handle("export:pdf", async (e, { name, html }) => {
  const p = await pickSave(`${safeName(name)}_콘티북.pdf`, "pdf", "PDF"); if (!p) return null;
  const { w, tmp } = await offscreen(html, 1123, 794);
  const pdf = await w.webContents.printToPDF({ pageSize: "A4", landscape: true, printBackground: true, margins: { marginType: "custom", top: 0.3, bottom: 0.3, left: 0.3, right: 0.3 } });
  fs.writeFileSync(p, pdf); w.destroy(); fs.unlinkSync(tmp); if (!SMOKE) shell.openPath(p); return { path: p };
});
ipcMain.handle("export:png", async (e, { name, html, ids }) => {
  const base = await pickFolder("카드 이미지를 저장할 위치"); if (!base) return null;
  const dir = path.join(base, `${safeName(name)}_컷카드`); fs.mkdirSync(dir, { recursive: true });
  const { w, tmp } = await offscreen(html, 1400, 900);
  for (const id of ids) {
    // 찍을 카드 하나만 남기고 나머지는 숨겨서, 늘 화면 맨 위에 있는 카드를 찍는다
    // 화면이 다시 그려진 뒤(requestAnimationFrame 두 번) 찍는다. 안 그러면 이전 장면이 찍힌다
    const r = await w.webContents.executeJavaScript(`(async()=>{const el=document.getElementById(${JSON.stringify("x" + id)});document.querySelectorAll(".cut,h2").forEach(x=>x.style.display=x===el?"":"none");scrollTo(0,0);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const b=el.getBoundingClientRect();return {x:Math.floor(b.left),y:Math.floor(b.top),width:Math.ceil(b.width),height:Math.ceil(b.height)}})()`);
    await new Promise(res => setTimeout(res, 120));
    const img = await w.webContents.capturePage(r);
    fs.writeFileSync(path.join(dir, id + ".png"), img.toPNG());
  }
  w.destroy(); fs.unlinkSync(tmp); if (!SMOKE) shell.openPath(dir); return { path: dir, count: ids.length };
});
ipcMain.handle("export:xlsx", async (e, { name, eps, images }) => {
  const p = await pickSave(`${safeName(name)}.xlsx`, "xlsx", "Excel"); if (!p) return null;
  const ExcelJS = require("exceljs");
  const wb = new ExcelJS.Workbook(); wb.creator = "스토리보드";
  const used = new Set();
  for (const ep of eps) {
    // 엑셀 시트 이름: 31자 이하, 특수문자 불가, 중복 불가
    let sn = safeName(ep.title).replace(/[\[\]]/g, " ").slice(0, 28) || `${ep.no}화`, k = 2;
    while (used.has(sn)) sn = `${sn.slice(0, 26)} ${k++}`;
    used.add(sn);
    const ws = wb.addWorksheet(sn, { views: [{ state: "frozen", ySplit: 1 }] });
    ws.columns = [
      { header: "컷", key: "no", width: 8 }, { header: "레퍼런스", key: "img", width: 24 }, { header: "비율", key: "ratio", width: 7 }, { header: "장소", key: "place", width: 12 },
      { header: "등장인물", key: "chars", width: 14 }, { header: "샷 크기", key: "size", width: 12 }, { header: "앵글", key: "angle", width: 12 },
      { header: "인물 방향", key: "face", width: 10 }, { header: "구성", key: "comp", width: 12 }, { header: "카메라 움직임", key: "move", width: 14 },
      { header: "렌즈·효과", key: "lens", width: 12 }, { header: "대본 본문", key: "body", width: 40 }, { header: "대사", key: "dialog", width: 40 },
      { header: "연출 메모", key: "note", width: 40 }, { header: "레퍼런스 수", key: "refn", width: 10 }, { header: "레퍼런스 파일", key: "ref", width: 30 }
    ];
    ws.getRow(1).font = { bold: true };
    ep.rows.forEach((r, i) => {
      const row = ws.addRow(r); row.height = 120; row.alignment = { vertical: "top", wrapText: true };
      if (images[r.no]) {
        const id = wb.addImage({ buffer: b64(images[r.no]), extension: "jpeg" });
        // 컷 비율대로: 세로는 84x150 안에, 가로는 160x90 안에
        const [aw, ah] = String(r.ratio || "9:16").split(":").map(Number), a = aw / ah;
        const ext = a < 1 ? { width: Math.round(150 * a), height: 150 } : { width: 160, height: Math.round(160 / a) };
        ws.addImage(id, { tl: { col: 1.1, row: i + 1.05 }, ext });
      }
    });
  }
  await wb.xlsx.writeFile(p); if (!SMOKE) shell.openPath(p); return { path: p };
});

app.whenReady().then(() => {
  protocol.handle("app", req => {
    const u = new URL(req.url), rel = decodeURIComponent(u.pathname);
    // 내 레퍼런스 이미지는 app://local/userlib/파일명
    const [base, sub] = rel.startsWith("/userlib/") ? [LIB_DIR(), rel.slice(9)] : [APP_DIR, rel];
    const f = path.normalize(path.join(base, sub));
    if (!f.startsWith(base)) return new Response("forbidden", { status: 403 });
    return net.fetch(url.pathToFileURL(f).href);
  });
  buildMenu(); createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on("window-all-closed", () => app.quit());
