/* 카메라 항목 그림. 9:16 화면(90x160) 안에 마네킹 장면을 그린다. */
const VZ=(()=>{
/* 사람마다 옷 색이 다르다: p0 주인공(빨간 셔츠), p1 파랑, p2 초록, p3 노랑 */
const FIG=(eyes="",back=false,p=0)=>`<g class="fig p${p}">
<line x1="142" y1="139" x2="141" y2="184" class="pl" stroke-width="9"/><line x1="158" y1="139" x2="159" y2="184" class="pl" stroke-width="9"/>
<ellipse cx="140" cy="189" rx="7" ry="3.5" class="shoe"/><ellipse cx="160" cy="189" rx="7" ry="3.5" class="shoe"/>
<line x1="131" y1="95" x2="126" y2="128" class="sl" stroke-width="7"/><line x1="169" y1="95" x2="174" y2="128" class="sl" stroke-width="7"/>
<circle cx="125" cy="134" r="4" class="body"/><circle cx="175" cy="134" r="4" class="body"/>
<path d="M132 94Q132 90 136 90L164 90Q168 90 168 94L164 128L136 128Z" class="shirt"/><path d="M135 127L165 127L166 140L134 140Z" class="pants"/><rect x="135" y="126" width="30" height="3" class="shoe"/>
<path d="M144 90l6 6 6-6z" class="body"/><rect x="146" y="84" width="8" height="7" class="body"/><circle cx="150" cy="74" r="12" class="body"/>
${back?'<path d="M137.5 74Q137 60 150 60Q163 60 162.5 74Q162 84 150 85Q138 84 137.5 74Z" class="hairc"/>':`<path d="M137.6 72Q137 59.5 150 59.5Q163 59.5 162.4 72Q160 65 154 64.5Q148 68 140 67Q138.5 69 137.6 72Z" class="hairc"/><g class="eyes" ${eyes}><circle cx="145.5" cy="74" r="1.5" class="ink"/><circle cx="154.5" cy="74" r="1.5" class="ink"/><path d="M147 79.5q3 1.6 6 0" class="ink-l"/></g>`}</g>`;
const SIDEFIG=(x,y,s)=>`<g transform="translate(${x} ${y}) scale(${s})" class="fig p0"><line x1="-2" y1="-22" x2="-3" y2="-4" class="pl" stroke-width="9"/><line x1="3" y1="-22" x2="4" y2="-4" class="pl" stroke-width="9"/><ellipse cx="4" cy="0" rx="8" ry="3.5" class="shoe"/><rect x="-4" y="-66" width="8" height="7" class="body"/><path d="M-9-60h18l-2 38h-14z" class="shirt"/><line x1="0" y1="-56" x2="6" y2="-28" class="sl" stroke-width="7"/><circle cx="7" cy="-25" r="3.6" class="body"/><circle cx="0" cy="-76" r="12" class="body"/><path d="M10-79l5 3-5 2z" class="body"/><path d="M-12-74Q-13-89 0-89Q10-89 11-82Q2-84-4-80Q-6-72-12-74Z" class="hairc"/><circle cx="5" cy="-77" r="1.5" class="ink"/></g>`;
const BG=`<rect x="-900" y="-900" width="2100" height="1092" class="sky"/>
<g class="bld"><rect x="-260" y="40" width="70" height="152"/><rect x="-170" y="-20" width="90" height="212"/><rect x="-60" y="60" width="60" height="132"/><rect x="10" y="10" width="80" height="182"/><rect x="210" y="0" width="80" height="192"/><rect x="300" y="50" width="60" height="142"/><rect x="380" y="-40" width="100" height="232"/><rect x="500" y="30" width="70" height="162"/></g>
<g class="win">${[[-160,0],[-160,40],[-160,80],[-130,0],[-130,40],[-130,80],[20,30],[50,30],[20,80],[50,80],[220,20],[250,20],[220,70],[250,70],[390,-20],[430,-20],[390,40],[430,40]].map(([x,y])=>`<rect x="${x}" y="${y}" width="16" height="22"/>`).join("")}</g>
<rect x="-900" y="192" width="2100" height="700" class="ground"/><line x1="-900" y1="192" x2="1200" y2="192" class="hor"/>`;
const EXTRA=`<g class="fig2" transform="translate(150 192) scale(.72) translate(-150 -192) translate(-85 -8)">${FIG("",false,1)}</g><g class="fig2" transform="translate(150 192) scale(.72) translate(-150 -192) translate(90 -8)">${FIG("",false,2)}</g>`;
const CROPS={ELS:[150,-500,720],VLS:[150,-150,360],LS:[150,-10,230],FS:[150,52,150],MFS:[150,56,115],COWBOY:[150,56,100],MS:[150,57,80],MCU:[150,58,56],CU:[150,57,38],BCU:[150,64,24],ECU:[145.5,67,12],DETAIL:[125,121,26]};
const base=([cx,top,h])=>`scale(${160/h}) translate(${-(cx-h*9/32)} ${-top})`;
const wrap=(inner,cls="")=>`<svg class="vz ${cls}" viewBox="0 0 90 160" aria-hidden="true"><rect width="90" height="160" class="frm"/>${inner}<rect width="90" height="160" class="edge"/></svg>`;
const scene=(crop,{fg=FIG(),extra=true,cls="",over=""}={})=>{const t=base(crop);return wrap(`<g class="cam"><g class="bgw"><g transform="${t}">${BG}${extra?EXTRA:""}</g></g><g class="fgw"><g transform="${t}">${fg}</g></g></g>${over}`,cls)};

const BURGER=`<rect width="90" height="160" class="sky"/><rect y="112" width="90" height="48" class="ground"/><ellipse cx="45" cy="112" rx="38" ry="7" class="plate"/>
<path d="M17 104h56q2 6-4 8h-48q-6-2-4-8z" fill="#C98A3A"/><rect x="15" y="94" width="60" height="10" rx="4" fill="#5A3420"/><path d="M13 92q32 8 64 0l-2 4h-60z" fill="#7DBA4E"/><rect x="16" y="86" width="58" height="6" rx="2" fill="#E8C63A"/><rect x="15" y="77" width="60" height="9" rx="4" fill="#5A3420"/><path d="M17 77q0-24 28-24t28 24z" fill="#D9963F"/><g fill="#F3E3B8"><ellipse cx="34" cy="64" rx="2" ry="1"/><ellipse cx="46" cy="60" rx="2" ry="1"/><ellipse cx="56" cy="66" rx="2" ry="1"/></g>`;

/* 샷 크기 */
const EYE=`<rect width="90" height="160" class="body"/><path d="M12 62q30-14 66 0" class="brow"/><path d="M10 84q35-30 70 0q-35 26-70 0z" class="sclera"/><circle cx="45" cy="84" r="13" class="iris"/><circle cx="45" cy="84" r="6" class="ink"/><circle cx="49" cy="80" r="2.4" fill="#fff"/><path d="M10 84q35-30 70 0" class="lid"/><path d="M20 112q25 8 50 0" class="ink-l" opacity=".35"/>`;
const HAND=`<rect width="90" height="160" class="sky"/><rect y="104" width="90" height="56" class="ground"/><g class="body"><rect x="-10" y="96" width="48" height="26" rx="12"/><rect x="30" y="92" width="34" height="34" rx="10"/><rect x="56" y="92" width="22" height="8" rx="4"/><rect x="58" y="101" width="24" height="8" rx="4"/><rect x="58" y="110" width="22" height="8" rx="4"/><rect x="55" y="119" width="18" height="7" rx="3.5"/><rect x="40" y="84" width="20" height="9" rx="4.5" transform="rotate(-25 40 88)"/></g><circle cx="70" cy="132" r="7" fill="#C9A23A"/><rect x="68" y="130" width="4" height="4" class="ground"/>`;
/* 오른쪽 위 몸 지도: 화면에 들어온 몸의 범위를 빨간 띠로 표시 */
const BMAP=(top,h)=>{const y=v=>8+(Math.min(192,Math.max(62,v))-62)*40/130,a=y(top),b=y(top+h);
  return `<g class="bmap"><rect x="69" y="4" width="18" height="48" rx="3" class="bm-bg"/><g transform="translate(78 8) scale(.3077) translate(-150 -62)">${FIG()}</g><rect x="69" y="4" width="18" height="${(a-4).toFixed(1)}" class="bm-dim"/><rect x="69" y="${b.toFixed(1)}" width="18" height="${(52-b).toFixed(1)}" class="bm-dim"/><rect x="69.5" y="${a.toFixed(1)}" width="17" height="${Math.max(1.5,b-a).toFixed(1)}" class="bm-hi"/></g>`};
const BAND={ECU:[67,12],DETAIL:[121,26],INSERT:[118,30]};
function size(code){
  if(code==="INSERT")return wrap(BURGER+`<g class="bmap"><rect x="69" y="4" width="18" height="18" rx="3" class="bm-bg"/><text x="78" y="16" text-anchor="middle" class="bm-t">물건</text></g>`);
  if(code==="ECU")return wrap(EYE+BMAP(...BAND.ECU));
  if(code==="DETAIL")return wrap(HAND+BMAP(...BAND.DETAIL));
  const c=CROPS[code]||CROPS.FS;return scene(c,{over:BMAP(c[1],c[2])})}

/* 앵글: 옆에서 본 배치도 */
const CAMI=(x,y,deg,tilt=0)=>`<g transform="translate(${x} ${y}) rotate(${deg})"><g transform="rotate(${tilt})"><rect x="-9" y="-5" width="12" height="10" rx="1.5" class="camb"/><path d="M3-3l6-3v12l-6-3z" class="camb"/><circle cx="-5" cy="-7" r="2.6" class="camb"/><circle cx="1" cy="-7" r="2.6" class="camb"/></g></g>`;
const ANG={EYE:[14,52,0,30],HIGH:[12,18,35,48],LOW:[12,142,-35,60],XHIGH:[30,10,62,52],XLOW:[24,150,-62,62],BIRD:[56,10,90,60],WORM:[44,154,-80,58],DUTCH:[14,52,0,30,22],SHOULDER:[14,82,0,82],HIP:[14,112,0,112],KNEE:[14,130,0,130],GROUND:[14,148,0,148]};
function angle(code){const a=ANG[code]||ANG.EYE,[x,y,deg,ty,tilt]=a;const r=deg*Math.PI/180,L=90;
  const ex=x+Math.cos(r)*L,ey=y+Math.sin(r)*L,sp=.32,e1=[x+Math.cos(r-sp)*L,y+Math.sin(r-sp)*L],e2=[x+Math.cos(r+sp)*L,y+Math.sin(r+sp)*L];
  return wrap(`<rect width="90" height="160" class="sky"/><rect y="152" width="90" height="8" class="ground"/>
  <path d="M${x} ${y}L${e1[0]} ${e1[1]}L${e2[0]} ${e2[1]}Z" class="beam"/>
  ${SIDEFIG(58,152,1.12)}
  <line x1="${x}" y1="${y}" x2="${ex}" y2="${ey}" class="sight"/>
  ${CAMI(x,y,deg,tilt||0)}`)}

/* 인물 방향: 상반신 */
function face(code){
  const F={FRONT:`<path d="M137.6 72Q137 59.5 150 59.5Q163 59.5 162.4 72Q160 65 154 64.5Q148 68 140 67Q138.5 69 137.6 72Z" class="hairc"/><g class="eyes"><circle cx="145.5" cy="73" r="1.5" class="ink"/><circle cx="154.5" cy="73" r="1.5" class="ink"/><line x1="147" y1="79.5" x2="153" y2="79.5" class="ink-l"/></g>`,
   THREEQ:`<g><path d="M137.6 74Q137 59.5 150 59.5Q163 59.5 162.6 70Q157 64.5 150 65Q142 67 140 75Z" class="hairc"/><circle cx="150" cy="73" r="1.5" class="ink"/><ellipse cx="157.5" cy="73" rx="1" ry="1.4" class="ink"/><path d="M161 74l3 2.5-3 1" class="ink-l"/><line x1="152" y1="79.5" x2="158" y2="79.5" class="ink-l"/><path d="M138 70q-2 6 1 10" class="hair-l"/></g>`,
   PROFILE:`<g><path d="M138 80Q136 60 150 59.5Q161 59.5 162 67Q154 64 147 69Q146 76 138 80Z" class="hairc"/><path d="M161.5 72l4 4-4 1.5" class="body"/><circle cx="158" cy="72.5" r="1.5" class="ink"/><line x1="158" y1="80" x2="161" y2="80" class="ink-l"/><path d="M138 64q-4 8 0 18" class="hair-l"/><circle cx="147" cy="75" r="2.6" class="ear"/></g>`,
   BACK3Q:`<g><path d="M138 72Q138 61 150 61Q162 61 162 72Q160 66 156 66L140 74Z" class="hair"/><path d="M139 74Q148 84 158 78L156 66Q146 64 139 72Z" class="hair" opacity=".6"/><circle cx="160.5" cy="75" r="2.4" class="ear"/></g>`,
   BACK:`<g><path d="M138 72Q138 61 150 61Q162 61 162 72Q162 82 150 84Q138 82 138 72Z" class="hair"/></g>`};
  const fg=`<g class="fig p0"><path d="M126 112Q127 92 136 90L164 90Q173 92 174 112Z" class="shirt"/><path d="M144 90l6 6 6-6z" class="body"/><rect x="146" y="84" width="8" height="7" class="body"/><circle cx="150" cy="74" r="12" class="body"/>${F[code]||F.FRONT}</g>`;
  return scene([150,56,62],{fg,extra:false})}

/* 구성 */
const mini=(x,y,s,o={})=>`<g transform="translate(${x} ${y}) scale(${s}) translate(-150 -192)" ${o.cls?`class="${o.cls}"`:""} ${o.op?`opacity="${o.op}"`:""}>${FIG("",o.back,o.p||0)}</g>`;
const head=(x,y,r,cls="body")=>`<circle cx="${x}" cy="${y}" r="${r}" class="${cls}"/>`;
function comp(code){
  const S=`<rect width="90" height="160" class="sky"/><rect y="128" width="90" height="32" class="ground"/>`;
  const m={
   SINGLE:S+mini(45,150,.82),
   DIRTY:S+mini(52,152,.82)+`<g class="soft"><circle cx="6" cy="96" r="20" class="dark"/><path d="M-20 160q4-46 40-46t30 46z" class="dark"/></g>`,
   TWO:S+mini(64,138,.5,{p:1})+mini(28,150,.6),
   THREE:S+mini(20,132,.42,{p:1})+mini(70,132,.42,{p:2})+mini(45,150,.62),
   GROUP:S+[[16,118],[38,116],[60,118],[80,116],[24,138],[50,136],[74,138],[12,158],[38,158],[64,158],[86,158]].map(([x,y],i)=>mini(x,y,.24+(y-110)/240,{p:i%4})).join(""),
   OTS:S+mini(56,128,.55,{p:1})+`<g><circle cx="16" cy="118" r="17" class="dark"/><path d="M-30 160q6-30 46-30t44 30z" class="dark"/></g>`,
   POV:S+mini(45,118,.42,{p:1})+`<g class="body"><path d="M8 160l8-26q4-6 10-2l6 28z"/><path d="M82 160l-8-26q-4-6-10-2l-6 28z"/></g>`,
   REACTION:scene(CROPS.CU,{extra:false,fg:FIG(`transform="translate(0 0)"`),over:`<g class="pop"><path d="M70 14l4 14h-4z" class="acc"/><circle cx="72" cy="32" r="1.8" class="acc"/></g>`}),
   ESTAB:`<rect width="90" height="160" class="sky"/><rect x="12" y="40" width="66" height="104" class="bldf"/><rect x="12" y="34" width="66" height="14" class="acc"/><text x="45" y="44.5" text-anchor="middle" class="sign">가게</text><rect x="22" y="96" width="46" height="48" class="glass"/><g class="win2"><rect x="20" y="58" width="12" height="14"/><rect x="39" y="58" width="12" height="14"/><rect x="58" y="58" width="12" height="14"/></g><rect y="144" width="90" height="16" class="ground"/>`,
   MIRROR:S+`<rect x="40" y="18" width="40" height="96" rx="2" class="mirror"/>`+`<svg x="40" y="18" width="40" height="96" viewBox="40 18 40 96"><g transform="translate(60 118) scale(.5) translate(-150 -192)" opacity=".75">${FIG()}</g></svg>`+mini(26,156,.62,{back:true}),
   FRAME:`<rect width="90" height="160" class="dark"/><rect x="22" y="22" width="46" height="126" class="sky"/><rect x="22" y="118" width="46" height="30" class="ground"/>`+mini(45,140,.5),
   FG:S+mini(45,146,.6)+`<g class="soft"><rect x="-6" y="0" width="22" height="160" class="dark"/><circle cx="84" cy="150" r="22" class="dark"/></g>`,
   SIL:`<rect width="90" height="160" class="dark"/><rect x="14" y="20" width="62" height="130" class="lightbox"/>`+`<g class="silh">${mini(45,150,.82)}</g>`,
   DEPTH:S+mini(66,118,.36,{p:1})+mini(26,190,1.05),
   SYM:S+`<rect x="4" y="20" width="12" height="130" class="bldf"/><rect x="74" y="20" width="12" height="130" class="bldf"/><line x1="45" y1="0" x2="45" y2="160" class="guide"/>`+mini(45,150,.72),
   THIRDS:S+`<g class="guide"><line x1="30" y1="0" x2="30" y2="160"/><line x1="60" y1="0" x2="60" y2="160"/><line x1="0" y1="53" x2="90" y2="53"/><line x1="0" y1="107" x2="90" y2="107"/></g>`+mini(60,150,.78),
   NEG:S+mini(70,150,.2),
   POWER:S+`<g transform="translate(58 236) scale(1.5) translate(-150 -192)">${FIG("",false,1)}</g>`+mini(15,158,.32),
   SPLIT:`<svg x="0" y="0" width="90" height="79" viewBox="0 0 90 79"><rect width="90" height="79" class="sky"/>${mini(32,232,1.5)}</svg><svg x="0" y="81" width="90" height="79" viewBox="0 0 90 79"><rect width="90" height="79" class="sky2"/>${mini(58,232,1.5,{p:1})}</svg>`};
  const v=m[code]||m.SINGLE;return v.startsWith('<svg class="vz')?v:wrap(v)}

/* 움직임: 애니메이션 */
const MOVE={STATIC:[CROPS.FS,"m-static"],PAN_L:[CROPS.FS,"m-panl"],PAN_R:[CROPS.FS,"m-panr"],TILT_U:[[150,128,60],"m-tiltu"],TILT_D:[[150,52,60],"m-tiltd"],WHIP:[CROPS.FS,"m-whip"],
 PED_U:[[150,128,60],"m-pedu"],PED_D:[[150,52,60],"m-pedd"],CRANE_U:[CROPS.FS,"m-craneu"],CRANE_D:[CROPS.LS,"m-craned"],DOLLY_IN:[CROPS.FS,"m-dollyin"],DOLLY_OUT:[CROPS.FS,"m-dollyout"],
 PUSH:[CROPS.FS,"m-push"],PULL_REVEAL:[CROPS.LS,"m-pull"],TRUCK_L:[CROPS.FS,"m-truckl"],TRUCK_R:[CROPS.FS,"m-truckr"],ZOOM_IN:[CROPS.FS,"m-zoomin"],ZOOM_OUT:[CROPS.FS,"m-zoomout"],
 CRASH:[CROPS.FS,"m-crash"],SNAP:[CROPS.FS,"m-snap"],DOLLYZOOM:[CROPS.MS,"m-vertigo"],ARC:[CROPS.MS,"m-arc"],ORBIT:[CROPS.MS,"m-orbit"],FOLLOW:[CROPS.FS,"m-follow",true],LEAD:[CROPS.FS,"m-lead"],
 SIDE:[CROPS.FS,"m-side"],HANDHELD:[CROPS.MS,"m-hand"],SHAKE:[CROPS.MS,"m-shake"],STEADI:[CROPS.FS,"m-steadi"],DRONE_U:[CROPS.FS,"m-droneu"],DRONE_D:[CROPS.VLS,"m-droned"],
 RACK:[CROPS.FS,"m-rack"],ROLL:[CROPS.MS,"m-roll"],FREEZE:[CROPS.FS,"m-freeze"]};
const ARW={STATIC:"카메라 고정 · 인물만 움직임",PAN_L:"↶ 제자리 회전",PAN_R:"↷ 제자리 회전",TILT_U:"⤒ 고개 들기",TILT_D:"⤓ 고개 숙이기",PED_U:"↑ 카메라 상승",PED_D:"↓ 카메라 하강",TRUCK_L:"← 옆 이동",TRUCK_R:"→ 옆 이동",DOLLY_IN:"앞으로 이동",DOLLY_OUT:"뒤로 이동",ZOOM_IN:"렌즈만 당김",ZOOM_OUT:"렌즈만 밈",DOLLYZOOM:"배경만 늘어남"};
function move(code){
  if(code==="TOPSPIN")return wrap(`<rect width="90" height="160" class="ground"/><g class="m-topspin fig p0"><ellipse cx="45" cy="80" rx="16" ry="34" class="shirt"/><circle cx="45" cy="44" r="11" class="hair"/><rect x="40" y="110" width="4" height="30" rx="2" class="body"/><rect x="47" y="110" width="4" height="30" rx="2" class="body"/></g>`,"mv");
  const [crop,cls,back]=MOVE[code]||MOVE.STATIC;
  let fg=FIG("",!!back);
  if(code==="RACK")fg=`<g class="far">${FIG()}</g><g class="near" transform="translate(96 214) scale(1.9) translate(-150 -192)">${FIG("",true)}</g>`;
  const lab=ARW[code]?`<g class="lab"><rect x="4" y="146" width="82" height="11" rx="2"/><text x="45" y="154" text-anchor="middle">${ARW[code]}</text></g>`:"";
  const over=code==="FREEZE"?`<rect width="90" height="160" class="flash"/>`:"";
  return scene(crop,{fg,cls:"mv "+cls,over:over+lab})}

/* 렌즈·효과 */
function lens(code){
  const L={NORMAL:()=>scene(CROPS.MS),
   WIDE:()=>scene(CROPS.MS,{fg:`<g transform="translate(150 74) scale(1.18) translate(-150 -74)">${FIG()}</g>`,cls:"l-wide"}),
   UWIDE:()=>scene([150,40,120],{fg:`<g transform="translate(150 74) scale(1.35) translate(-150 -74)">${FIG()}</g>`,cls:"l-uwide"}),
   FISH:()=>scene(CROPS.FS,{cls:"l-fish",over:`<path d="M0 0h90v160h-90zM45 8a42 72 0 1 0 .1 0z" class="vig" fill-rule="evenodd"/>`}),
   TELE:()=>scene(CROPS.MCU,{cls:"l-tele"}),
   MACRO:()=>wrap(BURGER,"l-macro"),
   TILTSHIFT:()=>scene(CROPS.VLS,{cls:"l-tilt",over:`<rect width="90" height="52" class="tsb"/><rect y="108" width="90" height="52" class="tsb"/>`}),
   SHALLOW:()=>scene(CROPS.MS,{cls:"l-shallow"}),
   DEEP:()=>scene(CROPS.LS,{cls:"l-deep"}),
   FLARE:()=>scene(CROPS.MS,{over:`<g class="flare"><circle cx="66" cy="22" r="14"/><line x1="0" y1="44" x2="90" y2="2"/><circle cx="30" cy="62" r="5"/><circle cx="18" cy="72" r="3"/></g>`}),
   GLOW:()=>scene(CROPS.MS,{cls:"l-glow",over:`<rect width="90" height="160" class="bloom"/>`}),
   BACKLIT:()=>scene(CROPS.FS,{cls:"l-back"}),
   SLOWMO:()=>scene(CROPS.FS,{cls:"mv m-slow"}),
   RAMP:()=>scene(CROPS.FS,{cls:"mv m-ramp"}),
   MBLUR:()=>scene(CROPS.FS,{cls:"l-mblur"})};
  return (L[code]||L.NORMAL)()}

function sizeMap(code){if(code==="INSERT")return "";const c=BAND[code]||((CROPS[code])?[CROPS[code][1],CROPS[code][2]]:null);return c?`<svg class="ovl" viewBox="0 0 90 160" preserveAspectRatio="none">${BMAP(c[0],c[1])}</svg>`:""}
return {size,angle,face,comp,move,lens,sizeMap};
})();
