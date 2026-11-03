// 자동 점검: CONTI_SMOKE=<폴더> 로 앱을 띄우면 화면에서 주요 기능을 차례로 실행하고 결과를 smoke-result.json 에 쓴 뒤 종료한다.
// <폴더>/docs 가 문서/스토리보드 대신 쓰인다. 거기에 점검용 예시 프로젝트를 만들어 두고 시작한다.
const fs = require("fs"), path = require("path");
const SAMPLE = "점검 예시";
// 점검용 예시 프로젝트: 2개 화, 화마다 컷 5개 (카메라 설정을 조금씩 다르게)
function sampleProject() {
  const sizes = ["MS", "MCU", "CU", "FS", "LS"], comps = ["SINGLE", "OTS", "TWO", "DEPTH", "SINGLE"];
  const ep = no => ({ id: "e" + no, no, title: no + "화", cuts: sizes.map((size, i) => ({ id: `c${no}_${i}`, place: "거실", body: i % 2 ? "인물A가 창밖을 본다." : "", dialog: i % 2 ? "" : "인물A: 점검 대사 " + (i + 1), note: "점검 메모", size, angle: "EYE", face: "FRONT", comp: comps[i], move: "STATIC", lens: "NORMAL", chars: ["인물A"], refs: [] })) });
  return { ratio: "9:16", chars: [{ name: "인물A", color: "#3F7FD6" }, { name: "인물B", color: "#E2574C" }], eps: [ep(1), ep(2)] };
}
module.exports = function smoke(win, app) {
  const dir = process.env.CONTI_SMOKE;
  const docs = path.join(dir, "docs"), sample = path.join(docs, SAMPLE + ".json");
  fs.mkdirSync(docs, { recursive: true });
  if (!fs.existsSync(sample)) fs.writeFileSync(sample, JSON.stringify({ format: "conti-board", version: 2, project: sampleProject() }, null, 1));
  const js = String.raw`(async()=>{
    const R=window.__R={},wait=ms=>new Promise(r=>setTimeout(r,ms)),cards=()=>[...document.querySelectorAll('.card')];
    const until=async f=>{for(let i=0;i<100&&!f();i++)await wait(100)};
    await until(()=>PROJ&&cards().length);await wait(500);
    R.opened=NAME+' '+cards().length+'컷 eps='+PROJ.eps.map(e=>e.title+':'+e.cuts.length).join(',');
    R.firstRefLoaded=await new Promise(res=>{const im=document.querySelector('.card .frame img');if(!im)return res('no img');const ok=()=>res(im.naturalWidth+'x'+im.naturalHeight+' '+im.src.split('/').slice(-2).join('/'));im.complete?(im.naturalWidth?ok():res('error '+im.src)):(im.onload=ok,im.onerror=()=>res('error '+im.src))});
    // 테마
    $('#tbTheme').click();R.theme1=document.documentElement.dataset.theme;$('#tbTheme').click();R.theme2=document.documentElement.dataset.theme;
    // 비율: 프로젝트 16:9 → 첫 컷만 9:16
    const pr=$('#projRatio');pr.value='16:9';pr.dispatchEvent(new Event('change',{bubbles:true}));await wait(200);
    R.wideCards=cards().filter(c=>c.classList.contains('wide')).length;
    const rs=cards()[0].querySelector('.rsel');rs.value='9:16';rs.dispatchEvent(new Event('change',{bubbles:true}));await wait(200);
    R.cut1Ratio=getComputedStyle(cards()[0]).getPropertyValue('--ar')+' wide='+cards()[0].classList.contains('wide');
    // 컷 추가 + 글 입력 + 되돌리기/앞으로가기
    document.querySelector('.gap .add[data-at="2"]').click();await wait(400);
    R.afterAdd=cards().length+' '+cards()[2].querySelector('.cid').textContent+' place='+cards()[2].querySelector('.place').value;
    const ta=cards()[2].querySelector('textarea[data-f=dialog]');ta.value='인물A: 점검 대사';ta.dispatchEvent(new Event('input',{bubbles:true}));await wait(900);
    undo();await wait(200);R.undoText=JSON.stringify(cards()[2].querySelector('textarea[data-f=dialog]').value);
    undo();await wait(200);R.undoAdd=cards().length;
    redo();await wait(200);redo();await wait(200);R.redo=cards().length+' '+cards()[2].querySelector('textarea[data-f=dialog]').value;
    // 컷 이동·복제·삭제
    const id3=cards()[2].dataset.id;moveCut(id3,-1);await wait(100);R.moved=cards()[1].dataset.id===id3;
    dupCut(id3);await wait(100);R.dup=cards().length;
    cards()[2].querySelector('[data-act=del]').click();await wait(200);R.del=cards().length;
    // 레퍼런스: 추천에서 추가, 대표 바꾸기, 내 사진 추가
    const c0=cards()[0],cid=c0.dataset.id;c0.querySelector('.strip [data-act=addref]').click();await wait(200);
    R.refsAfterAdd=findCut(cid).cut.refs.length;
    const cv=document.createElement('canvas');cv.width=320;cv.height=200;const g=cv.getContext('2d');g.fillStyle='#3a6';g.fillRect(0,0,320,200);g.fillStyle='#fff';g.font='40px sans-serif';g.fillText('MY REF',60,115);
    await addOwn(cid,[{name:'점검사진.png',dataUrl:cv.toDataURL('image/png')}]);await wait(400);
    R.ownRef=findCut(cid).cut.refs.join(',')+' ulib='+ULIB.length;
    mainRef(cid,findCut(cid).cut.refs.at(-1));await wait(200);
    R.ownShown=await new Promise(res=>{const im=cards()[0].querySelector('.frame img');const ok=()=>res(im.naturalWidth+'x'+im.naturalHeight);im.complete?(im.naturalWidth?ok():res('error')):(im.onload=ok,im.onerror=()=>res('error'))});
    openPick(cid);await wait(300);R.pickRec=document.querySelectorAll('#pkGrid .cell').length;
    document.querySelector('#pkTabs [data-t=mine]').click();await wait(200);R.pickMine=document.querySelectorAll('#pkGrid .cell').length+' on='+document.querySelectorAll('#pkGrid .cell.on').length;
    document.querySelector('#pkTabs [data-t=all]').click();await wait(300);R.pickAll=document.querySelectorAll('#pkGrid .cell').length;$('#pick').close();
    // 화 추가·이름·삭제, 인물
    await addEp();await wait(200);R.epAdded=PROJ.eps.map(e=>e.title).join(',')+' sel='+curEp().title;
    curEp().title='특별편';commit();render();moveEp(curEp(),-1);await wait(100);R.epMoved=PROJ.eps.map(e=>e.title).join(',');
    PROJ.eps=PROJ.eps.filter(e=>e.title!=='특별편');EPID=PROJ.eps[0].id;commit();render();
    PROJ.chars.push({name:'점검인물',color:'#123456'});commit();render();R.chars=PROJ.chars.length;
    // 저장 후 파일 다시 읽기
    await save(false);await wait(200);R.saveLabel=$('#save').textContent;
    // 내보내기
    for(const k of ['json','ai','pdf','xlsx','png']){const r=await runExport(k);R['export_'+k]=r?String(r.path).split(/[\\/]/).pop():'none'}
    // 새 프로젝트 → 목록·고정·순서·이름 → 다시 예시로
    const lot=FILE;await leave();loadProject(await window.conti.create('점검 프로젝트','16:9'));await wait(300);
    R.newProj=NAME+' ratio='+PROJ.ratio+' cards='+cards().length+' empty='+!!document.querySelector('.emptyep');
    document.querySelector('.emptyep [data-act=add]').click();await wait(300);R.newProjCut=cards().length+' wide='+cards()[0].classList.contains('wide');
    await autosave();
    PL=await window.conti.list();R.list=PL.map(p=>p.name+(p.current?'*':'')).join(' | ');
    togglePin(PL.find(p=>p.name==='점검 프로젝트'));await wait(300);PL=await window.conti.list();R.pinned=PL.map(p=>p.name+(p.pinned?'📌':'')).join(' | ');
    const rn=await window.conti.rename(FILE,'점검 이름바꿈');FILE=rn.path;NAME=rn.name;PL=await window.conti.list();R.renamed=PL.map(p=>p.name).join(' | ');
    await switchTo(lot);await wait(400);R.back=NAME+' '+cards().length+'컷 ratio='+PROJ.ratio;
    const tr=await window.conti.trash(PL.find(p=>p.name==='점검 이름바꿈').path);PL=tr.list;R.afterTrash=PL.map(p=>p.name).join(' | ')+' where='+tr.where;R.newExt=FILE.split('.').pop();
    return R;
  })()`;
  win.webContents.once("did-finish-load", async () => {
    let out;
    // 멈추면 그때까지의 결과라도 남긴다
    const t = new Promise(r => setTimeout(() => win.webContents.executeJavaScript("Object.assign({timeout:true},window.__R)").then(r), 200000));
    try { out = await Promise.race([win.webContents.executeJavaScript(js), t]); }
    catch (e) { out = Object.assign({ error: String(e) }, await win.webContents.executeJavaScript("window.__R||{}").catch(() => ({}))); }
    try { const p = JSON.parse(fs.readFileSync(sample, "utf8")).project; out.savedFile = { ratio: p.ratio, eps: p.eps.map(e => e.title + ":" + e.cuts.length), chars: p.chars.length, cut1: p.eps[0].cuts[0] }; } catch (e) { out.savedFile = String(e); }
    out.files = fs.readdirSync(dir, { recursive: true }).filter(f => !String(f).startsWith("ud")).map(String);
    fs.writeFileSync(path.join(dir, "smoke-result.json"), JSON.stringify(out, null, 1));
    app.exit(0);
  });
};
