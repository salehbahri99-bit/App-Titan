/* Titan Pack — public site prototype. All visible content lives in CONTENT (mirrors the future CMS models). */
(function(){
"use strict";
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};

/* ---------- hero dieline (reverse tuck end, 60×30×90 mm at 1.6 u/mm) ---------- */
function dieline(t){
 const x=44,y1=110,y2=254,X=v=>x+v;
 const cut=`M${X(24)},${y1} L${X(28)},${y1-34} L${X(68)},${y1-34} L${X(72)},${y1} L${X(72)},${y1-48} L${X(76)},${y1-64} Q${X(78)},${y1-70} ${X(86)},${y1-70} L${X(154)},${y1-70} Q${X(162)},${y1-70} ${X(164)},${y1-64} L${X(168)},${y1-48} L${X(168)},${y1} L${X(172)},${y1-34} L${X(212)},${y1-34} L${X(216)},${y1} L${X(312)},${y1} L${X(312)},${y2} L${X(312)},${y2+48} L${X(308)},${y2+64} Q${X(306)},${y2+70} ${X(298)},${y2+70} L${X(230)},${y2+70} Q${X(222)},${y2+70} ${X(220)},${y2+64} L${X(216)},${y2+48} L${X(216)},${y2} L${X(212)},${y2+34} L${X(172)},${y2+34} L${X(168)},${y2} L${X(72)},${y2} L${X(68)},${y2+34} L${X(28)},${y2+34} L${X(24)},${y2} L${X(0)},${y2-10} L${X(0)},${y1+10} Z`;
 const crs=`M${X(24)},${y1}V${y2} M${X(72)},${y1}V${y2} M${X(168)},${y1}V${y2} M${X(216)},${y1}V${y2} M${X(24)},${y1}H${X(216)} M${X(72)},${y1-48}H${X(168)} M${X(24)},${y2}H${X(72)} M${X(168)},${y2}H${X(312)} M${X(216)},${y2+48}H${X(312)}`;
 const L=(tx,px,py,rot)=>`<text class="panel-lbl" x="${px}" y="${py}" text-anchor="middle"${rot?` transform="rotate(-90 ${px} ${py})"`:""}>${tx}</text>`;
 return `<svg class="dieline" viewBox="0 0 400 380" role="img" aria-label="${esc(t.meta)}">
 <path class="crs" d="${crs}"/><path class="cut" d="${cut}"/>
 ${L("GLUE",X(12),(y1+y2)/2,1)}${L("SIDE",X(48),(y1+y2)/2)}${L("FRONT",X(120),(y1+y2)/2)}${L("SIDE",X(192),(y1+y2)/2)}${L("BACK",X(264),(y1+y2)/2)}${L("TUCK",X(120),y1-56)}${L("DUST",X(48),y1-14)}${L("DUST",X(192),y1-14)}${L("TUCK",X(264),y2+60)}
 <path class="dim" d="M${X(72)},22V32 M${X(168)},22V32 M${X(72)},27H${X(168)} M${X(168)},22V32 M${X(216)},22V32 M${X(168)},27H${X(216)}"/>
 <text x="${X(120)}" y="20" text-anchor="middle">60</text><text x="${X(192)}" y="20" text-anchor="middle">30</text>
 <path class="dim" d="M372,${y1}H382 M372,${y2}H382 M377,${y1}V${y2}"/>
 <text x="390" y="${(y1+y2)/2}" text-anchor="middle" transform="rotate(-90 390 ${(y1+y2)/2})">90 mm</text>
 <path class="dim" d="M${X(0)},352V362 M${X(312)},352V362 M${X(0)},357H${X(312)}"/>
 <text x="${X(156)}" y="374" text-anchor="middle">195 mm</text>
 </svg>`;
}

/* ---------- render ---------- */
let L="ar", C=CONTENT.ar, galleryFilter="all", lbIndex=0, lbList=[], procIdx=0, baIdx=0, vidIdx=0;
const catCount=c=>PROJECTS.filter(p=>p.cat===c).length;
function pdata(p){const t=C.proj[p.id];return{...p,title:t[0],client:t[1],desc:t[2],catName:C.cats[p.cat],meta:PROJ_META[p.id]}}
function secHead(o,extra=""){return `<div class="sec-head"><div><div class="eyebrow mono">${esc(o.eyebrow)}</div><h2>${o.h2}</h2></div><div><p>${esc(o.p)}</p>${extra}</div></div>`}
const sampleTag=()=>`<span class="sample mono">● ${esc(C.sample)}</span>`;

function render(){
 C=CONTENT[L];
 document.documentElement.lang=C.lang; document.documentElement.dir=C.dir;
 $("#nav").innerHTML=C.nav.map(([h,t])=>`<a href="${h}">${esc(t)}</a>`).join("");
 $("#navCta").textContent=C.ctaNav; $("#langBtn").textContent=C.switchTo;
 $$(".brand-name").forEach(e=>e.textContent=C.brand);
 const H=C.hero;
 $("#hero").innerHTML=`<div class="wrap"><div class="reveal"><div class="eyebrow mono">${H.eyebrow}</div><h1>${H.h1}</h1><p class="hero-desc">${esc(H.desc)}</p>
  <div class="hero-cta"><a class="btn btn-accent" href="#contact">${esc(H.c1)} <span class="arr">←</span></a><a class="btn btn-ghost" href="#work">${esc(H.c2)}</a></div>
  <div class="hero-specs">${H.specs.map(([b,s])=>`<div><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join("")}</div></div>
  <div class="stage reveal"><i class="crop tl"></i><i class="crop tr"></i><i class="crop bl"></i><i class="crop br"></i><div class="stage-inner">
   <div class="stage-bar"><div class="seg" role="group"><button type="button" data-v="flat" aria-pressed="true">${esc(H.flat)}</button><button type="button" data-v="solid" aria-pressed="false">${esc(H.solid)}</button></div><span class="mono stage-meta">${esc(H.meta)}</span></div>
   <div class="view draw" id="vFlat">${dieline(H)}</div>
   <div class="view" id="vSolid" data-off><div class="scene"><div class="box3d">${cubeFaces()}</div></div><div class="floor"></div></div>
   <div class="stage-foot"><div class="cmyk" aria-hidden="true"><i style="background:#00AEEF"></i><i style="background:#EC008C"></i><i style="background:#FFF200"></i><i style="background:#1A1A1A"></i><i style="background:#06414F"></i><i style="background:#EF974F"></i></div>
    <div class="legend mono"><span><i></i>${esc(H.cut)}</span><span><i class="d"></i>${esc(H.crease)}</span></div></div>
  </div></div></div>`;
 $$("#hero .seg button").forEach(b=>b.onclick=()=>{const v=b.dataset.v;$$("#hero .seg button").forEach(x=>x.setAttribute("aria-pressed",x===b));$("#vFlat").toggleAttribute("data-off",v!=="flat");$("#vSolid").toggleAttribute("data-off",v!=="solid");if(v==="flat"){const f=$("#vFlat");f.classList.remove("draw");void f.offsetWidth;f.classList.add("draw")}});

 const In=C.intro;
 $("#about").innerHTML=`<div class="wrap"><div class="reveal"><div class="eyebrow mono">${esc(In.eyebrow)}</div><p class="intro-lead">${In.lead}</p></div>
  <div class="pillars reveal">${In.pillars.map(([k,h,p])=>`<div class="pillar"><span class="mono">${k}</span><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`).join("")}</div></div>`;

 const Tm=C.team;
 $("#team").innerHTML=`<div class="wrap">${secHead(Tm)}<div class="team-grid reveal">${Tm.members.map((m,i)=>`<article class="member"><div style="display:flex;justify-content:space-between;align-items:start"><span class="num">0${i+1}</span><span class="ico">${ico(m.ic,24)}</span></div><div><h3>${esc(m.t)}</h3><span class="mono en">${esc(m.en)}</span></div><p>${esc(m.d)}</p><ul>${m.tags.map(t=>`<li>${esc(t)}</li>`).join("")}</ul></article>`).join("")}</div></div>`;

 const S=C.services;
 $("#services").innerHTML=`<div class="wrap">${secHead(S)}<div class="svc-grid reveal">${S.items.map(([ic,t,en,d,f])=>`<article class="svc">${ico(ic,44)}<span class="mono k">${esc(L==="ar"?en:"")}</span><h3>${esc(t)}</h3><p>${esc(d)}</p><ul>${f.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></article>`).join("")}</div></div>`;

 const F=C.featured, feats=PROJECTS.filter(p=>p.featured).map(pdata);
 $("#featured").innerHTML=`<div class="wrap">${secHead(F,sampleTag())}<div class="feat-grid">${feats.map((p,i)=>`<button type="button" class="feat reveal${i===0?" big":""}" data-id="${p.id}"><span class="art">${boxArt(p,i===0?640:480,i===0?400:360,{alt:p.title})}</span><span class="feat-meta"><span class="row mono"><span>${esc(p.catName)}</span><span>0${i+1} / 0${feats.length}</span></span><h3>${esc(p.title)}</h3><p>${esc(p.desc)}</p><span class="chips">${p.meta.fin.map(f=>`<span class="chip">${esc(C.materials.fins[f][0])}</span>`).join("")}<span class="chip">${esc(C.materials.mats[p.meta.mat][0])}</span></span></span></button>`).join("")}</div></div>`;
 $$("#featured .feat").forEach(b=>b.onclick=()=>openLB(b.dataset.id,feats.map(p=>p.id)));

 const G=C.gallery;
 $("#work").innerHTML=`<div class="wrap">${secHead(G,sampleTag())}<div class="filters" role="group">${["all",...CATS].filter(c=>c==="all"||catCount(c)).map(c=>`<button type="button" data-c="${c}" aria-pressed="${c===galleryFilter}">${esc(c==="all"?G.all:C.cats[c])}<sup>${c==="all"?PROJECTS.length:catCount(c)}</sup></button>`).join("")}</div><div class="masonry" id="masonry"></div></div>`;
 $$("#work .filters button").forEach(b=>b.onclick=()=>{galleryFilter=b.dataset.c;$$("#work .filters button").forEach(x=>x.setAttribute("aria-pressed",x===b));renderGallery()});
 renderGallery();

 renderProcess();

 const M=C.materials;
 $("#materials").innerHTML=`<div class="wrap">${secHead(M)}<div class="mat-grid reveal">${MAT_KEYS.map(k=>`<div class="mat"><div class="swatch sw-${k}"></div><h4>${esc(M.mats[k][0])}</h4><span class="mono">${esc(M.mats[k][1])}</span><p>${esc(M.mats[k][2])}</p></div>`).join("")}</div>
  <div class="fin-title"><div><div class="eyebrow mono">FINISHING</div><h3>${esc(M.finTitle)}</h3></div><p style="color:var(--muted);max-width:44ch">${esc(M.finP)}</p></div>
  <div class="fin-grid reveal">${FIN_KEYS.map(k=>`<div class="fin"><div class="fx fx-${k}">${k==="die"?`<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M6 10h28v22H6z"/><circle cx="20" cy="21" r="6" stroke-dasharray="3 2"/></svg>`:"TP"}</div><div><h4>${esc(M.fins[k][0])}</h4><p>${esc(M.fins[k][1])}</p></div></div>`).join("")}</div></div>`;

 renderBA(); renderVideo();

 $("#stats").innerHTML=`<div class="wrap"><div class="stat-row reveal">${C.stats.map(([n,s,u])=>`<div class="stat"><b>${esc(n)}${u?`<small>${u}</small>`:""}</b><span>${esc(s)}</span></div>`).join("")}</div>${sampleTag()}</div>`;

 const Ts=C.tst;
 $("#testimonials").innerHTML=`<div class="wrap"><div class="sec-head"><div><div class="eyebrow mono">${esc(Ts.eyebrow)}</div><h2>${esc(Ts.h2)}</h2></div><div>${sampleTag()}</div></div><div class="tst-grid">${Ts.items.map(([q,r,s])=>`<figure class="tst reveal" style="margin:0"><blockquote>${esc(q)}</blockquote><footer><span class="av">${esc(r.trim()[0])}</span><div><b>${esc(r)}</b><span>${esc(s)}</span></div></footer></figure>`).join("")}</div></div>`;

 const Ct=C.cta;
 $("#cta").innerHTML=`<div class="wrap"><div class="cta-band reveal"><svg class="bg" viewBox="0 0 400 380" aria-hidden="true" fill="none" stroke="#2A1606" stroke-width="2"><path d="M68 110V254M116 110V254M212 110V254M260 110V254" stroke-dasharray="7 6"/><path d="M44 120V244L68 254H356V110H68Z M116 110V62L130 40H198L212 62V110"/></svg><div><h2>${esc(Ct.h2)}</h2><p>${esc(Ct.p)}</p></div><div class="btns"><a class="btn btn-primary" href="#contact">${esc(Ct.c1)} <span class="arr">←</span></a><a class="btn btn-ghost" href="#process">${esc(Ct.c2)}</a></div></div></div>`;

 renderContact(); renderFooter(); renderTC();
 setupBG(); setupReveal(); cmsAfterRender();
}
function cubeFaces(){const src=$("#logoDark").src;return `<div class="face f-front"><img src="${src}" alt=""><span class="tag">TITAN PACK</span></div><div class="face f-back"><span class="tag">60 × 30 × 90 MM · FBB 350</span></div><div class="face f-right"><span class="v">TITAN PACK</span></div><div class="face f-left"></div><div class="face f-top"></div><div class="face f-bottom"></div>`}

function renderGallery(){
 const list=PROJECTS.filter(p=>galleryFilter==="all"||p.cat===galleryFilter).map(pdata);
 const ratios=[1.2,.8,1,1.3,.75,1.1];
 $("#masonry").innerHTML=list.map((p,i)=>{const r=ratios[i%ratios.length];return `<button type="button" class="g-item" data-id="${p.id}" style="animation-delay:${i*40}ms"><span class="art">${boxArt(p,400,Math.round(400*r),{alt:p.title})}</span><span class="g-cap"><b>${esc(p.title)}</b><span class="mono">${esc(p.catName)}</span></span></button>`}).join("");
 $$("#masonry .g-item").forEach(b=>b.onclick=()=>openLB(b.dataset.id,list.map(p=>p.id)));
}

function openLB(id,ids){lbList=ids;lbIndex=ids.indexOf(id);drawLB();$("#lb").hidden=false;document.body.style.overflow="hidden";$("#lb .lb-close").focus()}
function closeLB(){$("#lb").hidden=true;document.body.style.overflow=""}
function drawLB(){
 const p=pdata(PROJECTS.find(x=>x.id===lbList[lbIndex])),T=C.lb,M=C.materials;
 $("#lbBody").innerHTML=`<span class="art">${boxArt(p,640,520,{alt:p.title})}</span><div class="lb-info"><span class="mono" style="color:var(--accent-ink)">${esc(p.catName)} · ${String(lbIndex+1).padStart(2,"0")} / ${String(lbList.length).padStart(2,"0")}</span><h3>${esc(p.title)}</h3><p style="color:var(--muted)">${esc(p.desc)}</p>
 <dl><dt>${T.client}</dt><dd>${esc(p.client)}</dd><dt>${T.cat}</dt><dd>${esc(p.catName)}</dd><dt>${T.dims}</dt><dd class="mono" style="font-size:.85rem">${esc(p.dims)}</dd><dt>${T.mat}</dt><dd>${esc(M.mats[p.meta.mat][0])} · <span class="mono" style="font-size:.7rem">${esc(M.mats[p.meta.mat][1])}</span></dd><dt>${T.fin}</dt><dd>${p.meta.fin.map(f=>esc(M.fins[f][0])).join("، ")}</dd><dt>${T.svc}</dt><dd>${p.meta.svc.map(s=>esc(C.services.items[s][1])).join("، ")}</dd></dl>
 <span class="sample mono">● ${esc(C.sample)}</span>
 <div class="lb-nav"><button class="btn btn-ghost" type="button" data-d="-1">${T.prev}</button><button class="btn btn-primary" type="button" data-d="1">${T.next}</button></div></div>`;
 $$("#lbBody .lb-nav button").forEach(b=>b.onclick=()=>{lbIndex=(lbIndex+ +b.dataset.d+lbList.length)%lbList.length;drawLB()});
}

function renderProcess(){
 const P=C.process;
 $("#process").innerHTML=`<div class="wrap">${secHead(P)}<div class="proc-track" role="tablist"><span class="proc-fill" id="pfill"></span>${P.steps.map((s,i)=>`<button type="button" role="tab" class="step" data-i="${i}"><span class="dot">0${i+1}</span><span class="t">${esc(s[0])}</span></button>`).join("")}</div><div class="proc-panel reveal" id="ppanel" role="tabpanel"></div></div>`;
 $$("#process .step").forEach(b=>b.onclick=()=>{procIdx=+b.dataset.i;drawProc()});
 drawProc();
}
function drawProc(){
 const P=C.process,s=P.steps[procIdx];
 $$("#process .step").forEach((b,i)=>{b.setAttribute("aria-selected",i===procIdx);b.classList.toggle("done",i<procIdx)});
 $("#pfill").style.width=(84*procIdx/5)+"%";
 $("#ppanel").innerHTML=`<i class="crop tl"></i><i class="crop br"></i><div><span class="mono" style="color:var(--accent-ink)">STAGE 0${procIdx+1} / 06 · ${esc(s[1])}</span><h3>${esc(s[0])}</h3><p>${esc(s[2])}</p><span class="dur mono">⏱ ${esc(s[4])}</span></div><div><h4>${esc(P.deliver)}</h4><ul>${s[3].map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>`;
}

function renderBA(){
 const B=C.ba;
 $("#ba").innerHTML=`<div class="wrap"><div class="ba-copy reveal"><div class="eyebrow mono">${esc(B.eyebrow)}</div><h2>${esc(B.h2)}</h2><p>${esc(B.p)}</p><div class="ba-tabs">${B.cases.map((c,i)=>`<button type="button" class="btn btn-ghost" data-i="${i}" aria-pressed="${i===baIdx}" style="${i===baIdx?"border-color:var(--ink)":""}">${esc(c[0])}</button>`).join("")}</div><div class="ba-notes">${B.notes.map(([k,t])=>`<div><span class="mono">${k}</span><span>${esc(t)}</span></div>`).join("")}</div>${sampleTag()}</div>
 <div class="ba-frame reveal" id="baf" style="--pos:50%"><div class="layer before">${baArt(0)}</div><div class="layer after">${baArt(1)}</div><span class="ba-handle"></span><span class="ba-lbl l mono">${B.before}</span><span class="ba-lbl r mono">${B.after}</span><input class="ba-range" id="baRange" type="range" min="0" max="100" value="50" aria-label="${esc(B.before)} / ${esc(B.after)}"></div></div>`;
 const f=$("#baf"),r=$("#baRange");r.oninput=()=>f.style.setProperty("--pos",r.value+"%");
 $$("#ba .ba-tabs button").forEach(b=>b.onclick=()=>{baIdx=+b.dataset.i;renderBA()});
}
function baArt(after){
 const bm=((TPCMS.payload||TPCMS.BASE).baMedia||[])[baIdx],mu=bm&&TPCMS.mediaUrl(bm[after]);
 if(mu)return boxArt({coverUrl:mu,lbl:after?"after":"before"},640,480,{alt:after?"after":"before"});
 const cases=[[{shape:"tall",pat:"plain",bg:"#DAD8D2",c1:"#C9C6BD",c2:"#aaa",c3:"#5d5d5d",lbl:"COFFEE"},{...PROJECTS[0],bg:"#E9DCC6"}],[{shape:"bar",pat:"plain",bg:"#DADDDD",c1:"#F1F1EE",c2:"#aaa",c3:"#8b8b8b",lbl:"TABLETS 20"},{...PROJECTS[3]}]];
 return boxArt(cases[baIdx][after],640,480,{alt:after?"after":"before"});
}

function renderVideo(){
 const V=C.video;
 $("#video").innerHTML=`<div class="wrap">${secHead(V)}<div class="vid-grid"><div class="player reveal" id="player"><div class="vtitle"><span class="mono" style="color:var(--accent)">${esc(V.items[vidIdx][1])}</span><b>${esc(V.items[vidIdx][0])}</b></div><div class="scene"><div class="box3d">${cubeFaces()}</div></div><button class="play" type="button" id="playBtn"><i>▶</i>${esc(V.play)}</button></div>
 <div class="vlist">${V.items.map((v,i)=>`<button type="button" class="vitem" data-i="${i}" aria-current="${i===vidIdx}"><span class="th">${boxArt(PROJECTS[[2,6,8][i]],160,100,{grid:false,alt:v[0]})}</span><span><b>${esc(v[0])}</b><span>${esc(v[2])} · ${v[1]}</span></span></button>`).join("")}</div></div></div>`;
 $$("#video .vitem").forEach(b=>b.onclick=()=>{vidIdx=+b.dataset.i;renderVideo()});
 $("#playBtn").onclick=()=>{const u=((TPCMS.payload||TPCMS.BASE).videos[vidIdx]||{}).url;if(u){const y=u.match(/(?:youtu\.be\/|v=)([\w-]{11})/);const m=document.createElement("div");m.className="note cms-player";m.innerHTML=y?`<iframe src="https://www.youtube-nocookie.com/embed/${y[1]}?autoplay=1" allow="autoplay; encrypted-media; fullscreen" allowfullscreen title="video"></iframe>`:`<video src="${esc(u)}" controls autoplay playsinline></video>`;$("#player").appendChild(m);return}const n=document.createElement("div");n.className="note";n.innerHTML=`<p style="max-width:42ch">${esc(V.note)}</p>`;n.onclick=()=>n.remove();$("#player").appendChild(n)};
}

const ALLOWED=["pdf","ai","psd","zip","jpg","jpeg","png","webp"],MAXB=25*1024*1024;
let files=[];
function renderContact(){
 const K=C.contact,f=K.f;
 const opt=a=>`<option value="">${esc(f.choose)}</option>`+a.map(x=>`<option>${esc(x)}</option>`).join("");
 $("#contact").innerHTML=`<div class="wrap"><div class="c-info reveal"><div class="eyebrow mono">${esc(K.eyebrow)}</div><h2>${esc(K.h2)}</h2><p>${esc(K.p)}</p><div class="c-list">${K.info.map(([a,b])=>`<div><span>${esc(a)}</span><b>${esc(b)}</b></div>`).join("")}</div></div>
 <form class="cf reveal" id="cf" novalidate>
  <div class="fld"><label for="f-name">${f.name} <i>*</i></label><input id="f-name" name="name" autocomplete="name" data-req><span class="err"></span></div>
  <div class="fld"><label for="f-company">${f.company}</label><input id="f-company" name="company" autocomplete="organization"><span class="err"></span></div>
  <div class="fld"><label for="f-email">${f.email} <i>*</i></label><input id="f-email" name="email" type="email" dir="ltr" autocomplete="email" data-req><span class="err"></span></div>
  <div class="fld"><label for="f-phone">${f.phone}</label><input id="f-phone" name="phone" type="tel" dir="ltr" autocomplete="tel"><span class="err"></span></div>
  <div class="fld"><label for="f-type">${f.type} <i>*</i></label><select id="f-type" name="type" data-req>${opt(f.types)}</select><span class="err"></span></div>
  <div class="fld"><label for="f-budget">${f.budget}</label><select id="f-budget" name="budget">${opt(f.budgets)}</select><span class="err"></span></div>
  <div class="fld full"><label for="f-msg">${f.msg} <i>*</i></label><textarea id="f-msg" name="msg" data-req></textarea><span class="err"></span></div>
  <div class="fld full"><label for="f-files">${f.files}</label><div class="drop" id="drop">${ico("die",28)}<div>${esc(f.drop)}</div><small class="mono" style="text-transform:none">${esc(f.dropSmall)}</small><input id="f-files" type="file" multiple accept=".pdf,.ai,.psd,.zip,.jpg,.jpeg,.png,.webp"></div><div class="files" id="fileList"></div><span class="err" id="fileErr"></span></div>
  <div class="submit"><small>${esc(f.privacy)}</small><button class="btn btn-accent" type="submit">${esc(f.send)} <span class="arr">←</span></button></div>
 </form></div>`;
 const drop=$("#drop"),inp=$("#f-files");
 inp.onchange=()=>{addFiles([...inp.files]);inp.value=""};
 ["dragenter","dragover"].forEach(e=>drop.addEventListener(e,ev=>{ev.preventDefault();drop.classList.add("over")}));
 ["dragleave","drop"].forEach(e=>drop.addEventListener(e,ev=>{ev.preventDefault();drop.classList.remove("over")}));
 drop.addEventListener("drop",ev=>addFiles([...ev.dataTransfer.files]));
 drawFiles();
 $("#cf").onsubmit=async e=>{e.preventDefault();if(!validate())return;const btn=$("#cf button[type=submit]");btn.disabled=true;
  const res=await TPCMS.addLead({...Object.fromEntries(new FormData($("#cf"))),lang:L,files:files.filter(x=>!x.err)});btn.disabled=false;
  const ar=L==="ar",t=document.createElement("div");t.className="toast"+(res.ok?"":" err");t.setAttribute("role","status");
  t.textContent=res.ok?(TPCMS.remote?(ar?"وصلنا طلبك، وسنعود إليك خلال يوم عمل.":"We received your request and will reply within one working day."):f.ok)
   :res.error==="rate"?(ar?"أرسلت عدة طلبات من هذا البريد خلال وقت قصير. حاول مرة أخرى بعد ساعة.":"Several requests came from this email recently. Please try again in an hour.")
   :(ar?"تعذّر إرسال الطلب. تحقق من الاتصال وحاول مرة أخرى.":"The request could not be sent. Check your connection and try again.");
  $("#cf .toast")?.remove();$("#cf").appendChild(t);if(res.ok){$("#cf").reset();files=[];drawFiles()}};
 $$("#cf [data-req], #f-email, #f-phone").forEach(el=>el.addEventListener("blur",()=>checkField(el)));
}
function addFiles(list){const f=C.contact.f;$("#fileErr").textContent="";for(const x of list){if(files.length>=5){$("#fileErr").textContent=f.tooMany;break}const ext=x.name.split(".").pop().toLowerCase();files.push({file:x,name:x.name,size:x.size,err:!ALLOWED.includes(ext)?f.badType:x.size>MAXB?f.tooBig:""})}drawFiles()}
function drawFiles(){const el=$("#fileList");if(!el)return;el.innerHTML=files.map((x,i)=>`<div class="file${x.err?" bad":""}"><span dir="ltr">${esc(x.name)} · ${(x.size/1048576).toFixed(1)} MB${x.err?" — "+esc(x.err):""}</span><button type="button" data-i="${i}" aria-label="remove">×</button></div>`).join("");$$("#fileList button").forEach(b=>b.onclick=()=>{files.splice(+b.dataset.i,1);drawFiles()})}
function checkField(el){const f=C.contact.f,v=el.value.trim(),w=el.closest(".fld");let m="";
 if(el.hasAttribute("data-req")&&!v)m=f.req;else if(el.type==="email"&&v&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v))m=f.badEmail;else if(el.type==="tel"&&v&&!/^\+?[\d\s\-()]{7,20}$/.test(v))m=f.badPhone;
 w.classList.toggle("bad",!!m);w.querySelector(".err").textContent=m;return!m}
function validate(){let ok=true,first=null;$$("#cf input:not([type=file]),#cf select,#cf textarea").forEach(el=>{if(!checkField(el)){ok=false;first=first||el}});if(files.some(x=>x.err))ok=false;if(first)first.focus();return ok}

function renderFooter(){
 const Fo=C.footer;
 $("#ftrCols").innerHTML=`<div><a class="brand" href="#top"><img class="logo-d" src="${$("#logoDark").src}" alt="" width="40" height="40"><span><b class="brand-name">${esc(C.brand)}</b><small>TITAN PACK</small></span></a><p>${esc(Fo.about)}</p></div>`+Fo.cols.map(([h,ls])=>`<div><h4>${esc(h)}</h4><ul>${ls.map(([a,t])=>`<li><a href="${a}">${esc(t)}</a></li>`).join("")}</ul></div>`).join("");
 $("#ftrBot").innerHTML=`<span>${esc(Fo.rights)}</span><span class="mono">${esc(Fo.made)}</span>`;
}

/* ---------- theme customizer (demo of the Theme Engine) ---------- */
const DEF={primary:"#06414F",accent:"#EF974F",font:"Alexandria",radius:14,motion:true,mode:"auto"};
let TH={...DEF};try{Object.assign(TH,JSON.parse(store.get("tp-theme")||"{}"))}catch(e){}
if(TPCMS.payload)Object.assign(TH,TPCMS.payload.theme);
const FONTS=["Alexandria","Reem Kufi","Cairo","IBM Plex Sans Arabic"];
function applyTheme(){
 const r=document.documentElement.style;
 const custom=TH.primary!==DEF.primary; custom?r.setProperty("--primary",TH.primary):r.removeProperty("--primary");
 custom?r.setProperty("--primary-ink",TH.primary):r.removeProperty("--primary-ink");
 TH.accent!==DEF.accent?r.setProperty("--accent",TH.accent):r.removeProperty("--accent");
 TH.accent!==DEF.accent?r.setProperty("--accent-ink",TH.accent):r.removeProperty("--accent-ink");
 r.setProperty("--f-display",`"${TH.font}","IBM Plex Sans Arabic",system-ui,sans-serif`);
 r.setProperty("--radius",TH.radius+"px");
 document.documentElement.classList.toggle("nomotion",!TH.motion);
 if(TH.mode==="auto")document.documentElement.removeAttribute("data-theme");else document.documentElement.setAttribute("data-theme",TH.mode);
 TPCMS.injectTheme(TH);
 if(!TPCMS.preview)store.set("tp-theme",JSON.stringify(TH));
}
function renderTC(){
 const T=C.tc,P=["#06414F","#1B1B1B","#23395B","#3E5641","#6B2D3C"],A=["#EF974F","#C9A45C","#E05D44","#6FB3A8","#F4ECD5"];
 $("#tcFab").innerHTML=`<i></i><span>${esc(T.fab)}</span>`;
 $("#tc").innerHTML=`<div class="tc-head"><div><h3>${esc(T.title)}</h3><p>${esc(T.sub)}</p></div><button class="icon-btn" type="button" id="tcClose" aria-label="close">✕</button></div>${bgPanel().replace("<hr>","")}<hr>
 <div class="tc-grp"><b>${T.theme}</b><div class="seg" role="group">${["auto","light","dark"].map(m=>`<button type="button" data-m="${m}" aria-pressed="${TH.mode===m}">${esc(T[m])}</button>`).join("")}</div></div>
 <div class="tc-grp"><b>${T.primary}</b><div class="sw-row">${P.map(c=>`<button type="button" data-p="${c}" style="background:${c}" aria-label="${c}" aria-pressed="${TH.primary===c}"></button>`).join("")}<input type="color" id="tcP" value="${TH.primary}" aria-label="${esc(T.primary)}"></div></div>
 <div class="tc-grp"><b>${T.accent}</b><div class="sw-row">${A.map(c=>`<button type="button" data-a="${c}" style="background:${c}" aria-label="${c}" aria-pressed="${TH.accent===c}"></button>`).join("")}<input type="color" id="tcA" value="${TH.accent}" aria-label="${esc(T.accent)}"></div></div>
 <div class="tc-grp"><b>${T.font}</b><select id="tcF">${FONTS.map(f=>`<option ${f===TH.font?"selected":""} style="font-family:'${f}'">${f}</option>`).join("")}</select></div>
 <div class="tc-grp"><b>${T.radius} · <span class="mono" id="tcRv">${TH.radius}px</span></b><input type="range" id="tcR" min="0" max="28" value="${TH.radius}"></div>
 <label class="tgl"><span>${T.motion}</span><input type="checkbox" id="tcM" ${TH.motion?"checked":""}></label>
 <button type="button" class="btn btn-ghost" id="tcReset">${esc(T.reset)}</button>
 <p class="note">${esc(T.note)}</p>`;
 const up=()=>{applyTheme();renderTC();$("#tc").hidden=false};
 $$("#tc [data-m]").forEach(b=>b.onclick=()=>{TH.mode=b.dataset.m;up()});
 $$("#tc [data-p]").forEach(b=>b.onclick=()=>{TH.primary=b.dataset.p;up()});
 $$("#tc [data-a]").forEach(b=>b.onclick=()=>{TH.accent=b.dataset.a;up()});
 $("#tcP").oninput=e=>{TH.primary=e.target.value;applyTheme()};
 $("#tcA").oninput=e=>{TH.accent=e.target.value;applyTheme()};
 $("#tcF").onchange=e=>{TH.font=e.target.value;applyTheme()};
 $("#tcR").oninput=e=>{TH.radius=+e.target.value;$("#tcRv").textContent=TH.radius+"px";applyTheme()};
 $("#tcM").onchange=e=>{TH.motion=e.target.checked;applyTheme();for(const k in bgNodes)applyBG(k)};
 $("#tcReset").onclick=()=>{TH={...DEF};up()};
 $("#tcClose").onclick=closeTC;
 bindBgPanel(()=>{renderTC();$("#tc").hidden=false});
}
function openTC(){$("#tc").hidden=false;$("#scrim").hidden=false}
function closeTC(){$("#tc").hidden=true;$("#scrim").hidden=true}

/* ---------- section background videos: scroll position drives video time (forward on scroll down, backward on scroll up) ---------- */
const CLIPS={dieline:{ar:"رسم الفرد",en:"Dieline"},box:{ar:"علبة تدور",en:"Rotating box"},halftone:{ar:"شبكة CMYK",en:"CMYK halftone"},flute:{ar:"الكرتون المموج",en:"Flutes"},sheet:{ar:"فرخ المطبعة",en:"Press sheet"}};
const SEC_LBL={hero:["الواجهة","Hero"],about:["من نحن","About"],team:["الفريق","Team"],services:["الخدمات","Services"],featured:["مشاريع مختارة","Featured"],work:["المعرض","Gallery"],process:["المراحل","Process"],materials:["الخامات","Materials"],ba:["قبل / بعد","Before/After"],video:["الفيديو","Video"],stats:["الأرقام","Stats"],testimonials:["الآراء","Testimonials"],cta:["دعوة للعمل","CTA"],contact:["تواصل","Contact"]};
/* default CMS values — each section: clip (or uploaded URL), mode scroll|loop|off, overlay strength, overlay color */
const BG_DEF={
 hero:{clip:"dieline",mode:"scroll",ov:.55,oc:"var(--bg)"},
 about:{clip:"flute",mode:"scroll",ov:.72,oc:"var(--bg)"},
 team:{clip:"sheet",mode:"scroll",ov:.8,oc:"var(--primary)"},
 services:{clip:"halftone",mode:"scroll",ov:.86,oc:"var(--bg)"},
 featured:{clip:"dieline",mode:"scroll",ov:.8,oc:"var(--bg)"},
 work:{clip:"flute",mode:"scroll",ov:.85,oc:"var(--bg)"},
 process:{clip:"box",mode:"scroll",ov:.84,oc:"var(--surface-2)"},
 materials:{clip:"halftone",mode:"scroll",ov:.88,oc:"var(--bg)"},
 ba:{clip:"dieline",mode:"scroll",ov:.8,oc:"var(--surface-2)"},
 video:{clip:"sheet",mode:"scroll",ov:.6,oc:"#03252D"},
 stats:{clip:"flute",mode:"scroll",ov:.78,oc:"var(--bg)"},
 testimonials:{clip:"halftone",mode:"scroll",ov:.88,oc:"var(--bg)"},
 cta:{clip:"box",mode:"scroll",ov:.72,oc:"var(--accent)"},
 contact:{clip:"sheet",mode:"scroll",ov:.9,oc:"var(--bg)"}
};
let BG=JSON.parse(JSON.stringify(BG_DEF)),BG_ON=true,bgSel="hero";
const cmsBG=()=>{const b=TPCMS.payload&&TPCMS.payload.bg;if(!b)return;for(const k in b)if(BG[k]){const c=b[k];Object.assign(BG[k],{clip:c.kind==="url"?"url":c.kind==="clip"?c.clip:"",ov:c.ov,url:c.url});if(c.kind==="none"||c.kind==="image")BG[k].mode="off";else if(BG[k].mode==="off")BG[k].mode="scroll"}};
try{const s=JSON.parse(store.get("tp-bg")||"null");if(s){for(const k in s.cfg)if(BG[k])Object.assign(BG[k],s.cfg[k]);BG_ON=s.on!==false}}catch(e){}
const uploads={}; // section -> objectURL (session only; the real dashboard uploads to the media library)
const saveBG=()=>{const cfg={};for(const k in BG){const{clip,mode,ov}=BG[k];cfg[k]={clip:clip==="upload"?BG_DEF[k].clip:clip,mode,ov}}store.set("tp-bg",JSON.stringify({on:BG_ON,cfg}))};
const bgNodes={}; // section -> {wrap,video,ov,prog,cur}
const reduceMotion=matchMedia("(prefers-reduced-motion: reduce)");
const VEXT=(()=>{const v=document.createElement("video");return v.canPlayType('video/mp4; codecs="avc1.42E01E"')?"mp4":"webm"})();
function srcFor(k){const c=BG[k];return c.clip==="url"?c.url||"":c.clip==="upload"?uploads[k]:c.clip&&CLIPS[c.clip]?`media/${c.clip}.${VEXT}`:""}
function posterFor(k){const c=BG[k];return c.clip&&CLIPS[c.clip]?`media/${c.clip}.jpg`:""}
let bgIO;
function setupBG(){
 document.documentElement.classList.toggle("nobg",!BG_ON);
 bgIO=bgIO||new IntersectionObserver(es=>es.forEach(e=>{const n=bgNodes[e.target.dataset.bg];if(!n)return;n.near=e.isIntersecting;if(e.isIntersecting)loadBG(e.target.dataset.bg);else if(!n.video.paused)n.video.pause()}),{rootMargin:"60% 0px"});
 for(const k in BG){
  const host=k==="cta"?$("#cta .cta-band"):document.getElementById(k); if(!host)continue;
  let n=bgNodes[k];
  if(!n){const wrap=document.createElement("div");wrap.className="sec-bg";wrap.setAttribute("aria-hidden","true");
   const v=document.createElement("video");v.muted=true;v.defaultMuted=true;v.playsInline=true;v.setAttribute("playsinline","");v.setAttribute("muted","");v.preload="auto";v.disablePictureInPicture=true;
   v.addEventListener("loadeddata",()=>v.classList.add("ready"));
   const ov=document.createElement("div");ov.className="ov";const prog=document.createElement("div");prog.className="prog";
   wrap.append(v,ov,prog);n=bgNodes[k]={wrap,video:v,ov,prog,cur:0,src:""}}
  host.dataset.bg=k; host.prepend(n.wrap); bgIO.observe(host);
  applyBG(k);
 }
}
function applyBG(k){
 const n=bgNodes[k],c=BG[k];if(!n)return;
 n.wrap.hidden=c.mode==="off"||!srcFor(k);
 n.ov.style.setProperty("--ov",c.ov);n.ov.style.setProperty("--ov-c",c.oc);
 n.video.loop=c.mode==="loop";
 if(n.src!==srcFor(k)){n.video.classList.remove("ready");n.src="";n.cur=0;n.video.removeAttribute("src");n.video.poster=posterFor(k);if(n.near)loadBG(k)}
 if(c.mode==="loop"&&n.near&&!reduceMotion.matches&&TH.motion)n.video.play().catch(()=>{});else if(c.mode!=="loop")n.video.pause();
}
function loadBG(k){const n=bgNodes[k],s=srcFor(k);if(!n||!s||n.src===s||BG[k].mode==="off")return;n.src=s;n.video.src=s;n.video.load();if(BG[k].mode==="loop"&&TH.motion&&!reduceMotion.matches)n.video.play().catch(()=>{})}
function bgTick(){
 if(BG_ON&&TH.motion&&!reduceMotion.matches){
  const vh=innerHeight;
  for(const k in bgNodes){const n=bgNodes[k];if(!n.near||BG[k].mode!=="scroll")continue;const v=n.video,d=v.duration;if(!d||!isFinite(d))continue;
   const r=n.wrap.parentElement.getBoundingClientRect(),top=r.top+scrollY;
   const start=Math.max(0,top-vh),end=top+r.height;               // from the moment the section enters (or page top) until it leaves at the top
   const p=Math.min(1,Math.max(0,(scrollY-start)/(end-start)));
   const target=p*(d-.05); n.cur+=(target-n.cur)*.2;           // eased so fast scrolls stay smooth
   n.prog.style.width=(p*100).toFixed(1)+"%";
   if(!v.seeking&&Math.abs(v.currentTime-n.cur)>1/48)v.currentTime=n.cur;}
 }
 requestAnimationFrame(bgTick);
}
requestAnimationFrame(bgTick);
/* iOS/Safari only allows seeking a video after one user gesture */
addEventListener("touchstart",function unlock(){for(const k in bgNodes){const v=bgNodes[k].video;if(v.src&&BG[k].mode==="scroll")v.play().then(()=>v.pause()).catch(()=>{})}removeEventListener("touchstart",unlock)},{passive:true});

function bgPanel(){
 const T=L==="ar",c=BG[bgSel];
 const t=T?{h:"خلفيات الفيديو",all:"تفعيل خلفيات الفيديو",sec:"القسم",clip:"الفيديو",none:"بدون",up:"رفع فيديو من جهازك (MP4 / WEBM / MOV)",mode:"طريقة التشغيل",scroll:"يتبع التمرير",loop:"تكرار تلقائي",off:"إيقاف",ov:"قوة الطبقة فوق الفيديو",tip:"اسحب الصفحة للأعلى والأسفل: الفيديو يتقدم ويرجع مع التمرير. الفيديو المرفوع هنا للمعاينة فقط؛ في لوحة التحكم يُحفظ في مكتبة الوسائط."}
 :{h:"Background videos",all:"Enable background videos",sec:"Section",clip:"Video",none:"None",up:"Upload a video (MP4 / WEBM / MOV)",mode:"Playback",scroll:"Follows scroll",loop:"Auto loop",off:"Off",ov:"Overlay strength",tip:"Scroll up and down: the video moves forward and back with the page. Uploads here are preview-only; the dashboard saves them to the media library."};
 return `<hr><div class="tc-grp"><b>${t.h}</b><label class="tgl"><span>${t.all}</span><input type="checkbox" id="bgOn" ${BG_ON?"checked":""}></label></div>
 <div class="tc-grp"><b>${t.sec}</b><select id="bgSec">${Object.keys(BG).map(k=>`<option value="${k}" ${k===bgSel?"selected":""}>${SEC_LBL[k][T?0:1]}</option>`).join("")}</select></div>
 <div class="tc-grp"><b>${t.clip}</b><div class="clip-row">${Object.keys(CLIPS).map(k=>`<button type="button" data-clip="${k}" title="${CLIPS[k][L]}" aria-label="${CLIPS[k][L]}" aria-pressed="${c.clip===k}" style="background-image:url(media/${k}.jpg)"></button>`).join("")}<button type="button" data-clip="none" aria-pressed="${c.clip==="none"}">${t.none}</button></div>
 <label class="up">${uploads[bgSel]&&c.clip==="upload"?"✓ ":""}${t.up}<input type="file" id="bgUp" accept="video/mp4,video/webm,video/quicktime"></label></div>
 <div class="tc-grp"><b>${t.mode}</b><div class="seg" role="group">${["scroll","loop","off"].map(m=>`<button type="button" data-bm="${m}" aria-pressed="${c.mode===m}">${t[m]}</button>`).join("")}</div></div>
 <div class="tc-grp"><b>${t.ov} · <span class="mono" id="bgOvV">${Math.round(c.ov*100)}%</span></b><input type="range" id="bgOv" min="0" max="95" value="${Math.round(c.ov*100)}"></div>
 <p class="note">${t.tip}</p>`;
}
function bindBgPanel(rerender){
 const go=()=>{applyBG(bgSel);saveBG();rerender()};
 $("#bgOn").onchange=e=>{BG_ON=e.target.checked;document.documentElement.classList.toggle("nobg",!BG_ON);saveBG()};
 $("#bgSec").onchange=e=>{bgSel=e.target.value;rerender();const h=bgSel==="cta"?$("#cta"):document.getElementById(bgSel);h&&h.scrollIntoView({behavior:"smooth",block:"start"})};
 $$("#tc [data-clip]").forEach(b=>b.onclick=()=>{BG[bgSel].clip=b.dataset.clip;if(BG[bgSel].mode==="off"&&b.dataset.clip!=="none")BG[bgSel].mode="scroll";go()});
 $$("#tc [data-bm]").forEach(b=>b.onclick=()=>{BG[bgSel].mode=b.dataset.bm;go()});
 $("#bgOv").oninput=e=>{BG[bgSel].ov=e.target.value/100;$("#bgOvV").textContent=e.target.value+"%";applyBG(bgSel);saveBG()};
 $("#bgUp").onchange=e=>{const f=e.target.files[0];if(!f)return;if(uploads[bgSel])URL.revokeObjectURL(uploads[bgSel]);uploads[bgSel]=URL.createObjectURL(f);BG[bgSel].clip="upload";if(BG[bgSel].mode==="off")BG[bgSel].mode="scroll";go()};
}

/* reveal: content is visible at rest; only elements below the fold get a gentle entrance */
function setupReveal(){
 if(!("IntersectionObserver" in window))return;
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.remove("pre");io.unobserve(e.target)}}),{rootMargin:"0px 0px -8% 0px"});
 $$(".reveal").forEach(el=>{const r=el.getBoundingClientRect();if(r.top>innerHeight){el.classList.add("pre");io.observe(el)}});
}

/* ---------- CMS hooks: sections, custom blocks, hero media, SEO, live preview ---------- */
function cmsAfterRender(){
 const P=TPCMS.payload; if(!P)return;
 const main=$("main"),hr=$("main > hr.crease");
 for(const s of P.sections){
  let el=document.getElementById(s.id);
  if(s.custom){
   if(!el){el=document.createElement("section");el.id=s.id;el.className="cms-custom"}
   const t=s.custom[L]||s.custom.ar,img=TPCMS.mediaUrl(s.custom.image);
   el.innerHTML=`<div class="wrap"><div class="sec-head"><div><div class="eyebrow mono">${esc(t.eyebrow||"")}</div><h2>${esc(t.h2||"")}</h2></div><div><p>${esc(t.p||"")}</p>${t.btn?`<a class="btn btn-accent" href="${esc(t.href||"#contact")}" style="margin-top:20px">${esc(t.btn)} <span class="arr">←</span></a>`:""}</div></div>${img?`<img class="cms-img" src="${img}" alt="" loading="lazy">`:""}</div>`;
  }
  if(!el)continue;
  el.hidden=s.visible===false; main.appendChild(el);
  if(s.id==="services"&&hr)main.appendChild(hr);
 }
 $$("main > section.cms-custom").forEach(el=>{if(!P.sections.some(s=>s.id===el.id))el.remove()});
 const hb=P.bg&&P.bg.hero,hi=hb&&hb.kind==="image"&&TPCMS.mediaUrl(hb.image),h=$("#hero");
 h.classList.toggle("cms-hero-img",!!hi);
 h.style.backgroundImage=hi?`linear-gradient(color-mix(in srgb,var(--bg) ${Math.round(hb.ov*100)}%,transparent),color-mix(in srgb,var(--bg) ${Math.round(hb.ov*100)}%,transparent)),url("${hi}")`:"";
 const seo=P.seo&&P.seo[L]; if(seo){document.title=seo.title;let m=$('meta[name="description"]');if(!m){m=document.createElement("meta");m.name="description";document.head.appendChild(m)}m.content=seo.desc}
}
function cmsReload(p){
 if(!p)return; TPCMS.payload=p; TPCMS.apply(p);
 Object.assign(TH,p.theme); cmsBG(); applyTheme(); render(); for(const k in bgNodes)applyBG(k);
}
if(TPCMS.preview){
 addEventListener("storage",e=>{if(e.key===(TPCMS.mode==="work"?TPCMS.K.work:TPCMS.K.draft)||e.key===TPCMS.K.media)cmsReload(TPCMS.read())});
 addEventListener("message",e=>{if(e.origin!==location.origin||!e.data||!e.data.tpScroll)return;const el=document.getElementById(e.data.tpScroll);if(el&&!el.hidden){scrollTo({top:el.getBoundingClientRect().top+scrollY-($(".hdr")?$(".hdr").offsetHeight:0),behavior:"smooth"});/* window-local: scrollIntoView would also scroll the embedding dashboard */el.classList.remove("cms-flash");void el.offsetWidth;el.classList.add("cms-flash")}});
 if(TPCMS.mode!=="work"){const b=document.createElement("div");b.className="cms-bar";b.innerHTML=`<b>${TPCMS.mode==="draft"?"معاينة المسودة":"معاينة الإصدار "+esc(TPCMS.mode.slice(1))}</b><span>غير منشورة · PREVIEW</span><a href="index.html">الموقع المنشور</a><a href="admin.html">لوحة التحكم</a>`;document.body.appendChild(b)}
 else document.documentElement.classList.add("cms-embed");
}
if(!TPCMS.preview)addEventListener("storage",e=>{if(e.key===TPCMS.K.live)cmsReload(TPCMS.read("live"))});

/* ---------- boot (after the CMS has loaded the content: instant locally, one request with Supabase) ---------- */
TPCMS.ready.then(()=>{
if(TPCMS.remote&&TPCMS.payload)Object.assign(TH,TPCMS.payload.theme);
cmsBG();
L=(TPCMS.preview&&new URLSearchParams(location.search).get("lang"))||store.get("tp-lang")||"ar";
applyTheme(); render();
$("#langBtn").onclick=()=>{L=L==="ar"?"en":"ar";store.set("tp-lang",L);render()};
$("#menuBtn").onclick=()=>{const n=$("#nav");n.classList.toggle("open");$("#menuBtn").setAttribute("aria-expanded",n.classList.contains("open"))};
$("#nav").addEventListener("click",e=>{if(e.target.tagName==="A")$("#nav").classList.remove("open")});
$("#tcFab").onclick=openTC; $("#scrim").onclick=closeTC;
$("#lb").addEventListener("click",e=>{if(e.target.id==="lb")closeLB()});
$("#lb .lb-close").onclick=closeLB;
document.addEventListener("keydown",e=>{if($("#lb").hidden)return;if(e.key==="Escape")closeLB();if(e.key==="ArrowLeft"||e.key==="ArrowRight"){const d=(e.key==="ArrowLeft")===(C.dir==="rtl")?1:-1;lbIndex=(lbIndex+d+lbList.length)%lbList.length;drawLB()}});
});
})();
