/* Titan Pack dashboard — pages. Each page renders into #view and binds its fields to S.work through data-k paths. */
const NAV=[
 ["MAIN",[["overview","لوحة التحكم","grid"]]],
 ["CONTENT",[["pages","الصفحات","page"],["sections","الأقسام","layers"],["projects","المشاريع","folder"],["services","الخدمات","pack"],["team","الفريق","users"],["testimonials","آراء العملاء","quote"],["media","الوسائط","image"]]],
 ["DESIGN",[["theme","الهوية والثيم","palette"],["navigation","القائمة والتذييل","menu"],["seo","SEO","search"]]],
 ["SYSTEM",[["forms","النماذج","inbox"],["users","المستخدمون","shield"],["settings","الإعدادات","gear"],["versions","الإصدارات","history"]]]
];
const PAGES={};
const secLabel=id=>{const s=S.work.sections.find(x=>x.id===id);if(s&&s.custom)return s.custom.ar.h2||"قسم مخصص";return(TPCMS.SECTIONS.find(x=>x[0]===id)||[,id])[1]};
const C=()=>S.work.content[S.lang];
const leads=()=>TPCMS.get(K.leads)||[];
const newLeads=()=>leads().filter(l=>l.status==="new").length;
const ph=(eyebrow,title,sub,acts="")=>`<div class="ph"><div><div class="eyebrow mono">${eyebrow}</div><h2>${title}</h2>${sub?`<p>${sub}</p>`:""}</div>${acts?`<div class="acts">${acts}</div>`:""}</div>`;
const crops='<i class="crop tl"></i><i class="crop tr"></i><i class="crop bl"></i><i class="crop br"></i>';
const roBar=()=>ro()?`<div class="readonly-bar">${ic("lock",16)} أنت تتصفح بصلاحية «مشاهد» — كل الحقول للقراءة فقط.</div>`:"";

/* ====================================================== OVERVIEW */
const ACCEPT=[["login","تسجيل الدخول للوحة","overview"],["primary","تغيير اللون الأساسي","theme"],["font","تغيير الخط","theme"],["heroImage","تغيير صورة الواجهة","sections/hero"],["heroVideo","تغيير فيديو الواجهة","sections/hero"],["heroText","تعديل نص الواجهة","sections/hero"],["projectAdd","إضافة مشروع","projects/new"],["gallery","رفع معرض صور لمشروع","projects"],["reorder","إعادة ترتيب المشاريع","projects"],["teamAdd","إضافة عضو للفريق","team"],["serviceAdd","إضافة خدمة","services"],["tstAdd","إضافة رأي عميل","testimonials"],["nav","تعديل القائمة","navigation"],["footer","تعديل التذييل","navigation"],["draft","حفظ مسودة",""],["preview","فتح المعاينة",""],["publish","النشر",""],["verify","التحقق من الموقع المنشور",""],["restore","استعادة إصدار قديم","versions"],["functional","الموقع يعمل بعد الاستعادة",""]];
function pubCardHTML(){
 const st=status(),m=META(),ch=diff(liveP(),S.work);
 const steps=[["تعديل",st!=="live"],["حفظ مسودة",st==="draft"],["معاينة",st==="draft"&&(m.previewAt||0)>=(m.draftAt||0)],["نشر",st==="live"]];
 return`${crops}<div class="pub"><div><div class="eyebrow mono">PUBLISHING</div><h3><span class="dot ${st}"></span>${STATUS[st][0]}</h3><p class="muted" style="margin-top:4px">${STATUS[st][1]}</p>
  <div class="flow">${steps.map(([t,on],i)=>`<span class="${on?"done":""}">${i+1}. ${t}</span>`).join("")}</div>
  ${ch.length?`<ul class="changes">${ch.slice(0,8).map(c=>`<li><span class="mono">${esc(c.k)}</span>${esc(c.t)}</li>`).join("")}${ch.length>8?`<li class="muted">+ ${ch.length-8} تغييرات أخرى</li>`:""}</ul>`:""}
  <p class="muted" style="font-size:.78rem;margin-top:12px">آخر نشر: <b>v${m.liveV||"—"}</b> · ${m.liveAt?rel(m.liveAt):"—"} · ${esc(m.liveBy||"")}${m.draftAt?` — آخر مسودة ${rel(m.draftAt)} (${esc(m.draftBy||"")})`:""}</p></div>
  <div class="acts"><button class="btn btn-ghost" type="button" data-act="draft" ${st!=="unsaved"||!can("edit")?"disabled":""}>حفظ مسودة</button><button class="btn btn-ghost" type="button" data-act="preview">${ic("eye",16)} معاينة</button><button class="btn btn-accent" type="button" data-act="publish" ${st==="live"||!can("publish")?"disabled":""}>نشر</button></div></div>`;
}
PAGES.overview={title:"لوحة التحكم",render(v){
 const P=S.work,pubd=P.projects.filter(p=>p.status==="published").length,vis=P.sections.filter(s=>s.visible!==false).length,M=Object.values(media()),mb=M.reduce((a,r)=>a+(r.optSize||(r.data?r.data.length*.75:r.size)),0);
 const L=LOG(),done=ACCEPT.filter(a=>L.flags[a[0]]).length,pct=Math.round(done/ACCEPT.length*100);
 const wk=[...Array(8)].map((_,i)=>{const end=Date.now()-(7-i)*6048e5,start=end-6048e5;return{n:leads().filter(l=>{const t=+new Date(l.at);return t>start&&t<=end}).length,lbl:i===7?"هذا الأسبوع":`-${7-i}`}}),mx=Math.max(1,...wk.map(w=>w.n));
 const feed=[...L.events.map(e=>({at:e.at,by:e.by,text:e.text})),...(TPCMS.get(K.versions)||[]).map(x=>({at:x.at,by:x.by,text:`نشر الإصدار v${x.v} — ${x.note}`}))].sort((a,b)=>b.at-a.at).slice(0,6);
 v.innerHTML=`${ph("DASHBOARD",`أهلاً ${esc(S.user.name.split(" ")[0])}`,"نظرة سريعة على حالة موقع تيتان باك: ما الذي تغيّر، ما الذي ينتظر النشر، وما الذي وصل من العملاء.",`<a class="btn btn-ghost" href="index.html" target="_blank" rel="noopener" data-verify>${ic("ext",16)} الموقع المنشور</a><a class="btn btn-primary" href="#/projects/new">${ic("plus",16)} مشروع جديد</a>`)}
 ${roBar()}
 <section class="card" id="pubCard">${pubCardHTML()}</section>
 <div class="kpis">
  <a class="kpi" href="#/projects"><span class="k">المشاريع المنشورة ${ic("folder")}</span><b>${pubd}<small> / ${P.projects.length}</small></b><div class="bar"><span style="width:${pubd/Math.max(1,P.projects.length)*100}%"></span></div><div class="d">${P.projects.filter(p=>p.featured&&p.status==="published").length} مميزة في الصفحة الرئيسية</div></a>
  <a class="kpi" href="#/sections"><span class="k">الأقسام الظاهرة ${ic("layers")}</span><b>${vis}<small> / ${P.sections.length}</small></b><div class="bar"><span style="width:${vis/P.sections.length*100}%"></span></div><div class="d">${P.sections.filter(s=>s.custom).length} أقسام مخصصة</div></a>
  <a class="kpi" href="#/forms"><span class="k">طلبات جديدة ${ic("inbox")}</span><b>${newLeads()}<small> / ${leads().length}</small></b><div class="d">من نموذج «لنبدأ مشروعك»</div></a>
  <a class="kpi" href="#/media"><span class="k">مكتبة الوسائط ${ic("image")}</span><b>${M.length}<small> ملف</small></b><div class="d">${fmtBytes(mb)} · الصور تُحوَّل إلى WebP تلقائياً</div></a>
 </div>
 <div class="split">
  <section class="card"><div class="card-h"><h3>طلبات عروض الأسعار</h3><span class="sub">آخر 8 أسابيع</span><div class="r"><a class="btn btn-quiet btn-sm" href="#/forms">الوارد ${ic("arrow",14)}</a></div></div>
   <div class="chart" role="img" aria-label="عدد الطلبات أسبوعياً">${wk.map(w=>`<div class="c"><i style="height:${w.n/mx*100}%" data-v="${w.n} طلب"></i><span>${w.lbl}</span></div>`).join("")}</div>
   <hr class="crease" style="margin:16px 0 8px">
   <ul class="feed">${leads().slice(0,3).map(l=>`<li><span class="av">${esc((l.name||"?").trim()[0])}</span><div><b>${esc(l.name)}</b>${l.demo?` <span class="badge">تجريبي</span>`:""}<p>${esc(l.type||"")} · ${esc(l.company||"")}</p></div><time>${rel(l.at)}</time></li>`).join("")}</ul></section>
  <section class="card"><div class="card-h"><div class="ring" style="--p:${pct}"><b>${done}/${ACCEPT.length}</b></div><div><h3>اختبار القبول</h3><span class="sub">شروط اعتبار المنصة مكتملة (من ملف المشروع)</span></div></div>
   <ol class="checklist">${ACCEPT.map(([f,t,r])=>`<li class="${L.flags[f]?"done":""}"><i>${L.flags[f]?"✓":""}</i>${t}${!L.flags[f]&&r?`<a href="#/${r}">ابدأ</a>`:""}</li>`).join("")}</ol></section>
 </div>
 <div class="g2">
  <section class="card"><div class="card-h"><h3>آخر النشاط</h3></div><ul class="feed">${feed.map(e=>`<li><span class="av">${esc((e.by||"؟").trim()[0])}</span><div><b>${esc(e.text)}</b><p>${esc(e.by||"")}</p></div><time>${rel(e.at)}</time></li>`).join("")||`<li class="muted">لا يوجد نشاط بعد</li>`}</ul></section>
  <section class="card"><div class="card-h"><h3>اختصارات</h3></div><div class="rows">
   ${[["sections/hero","layers","تعديل الواجهة","العنوان، الوصف، الصورة أو الفيديو"],["theme","palette","تخصيص الهوية","الألوان والخطوط والحركة مع معاينة مباشرة"],["media","upload","رفع وسائط","صور تُحسَّن تلقائياً، فيديو، PDF وملفات التصميم"],["versions","history","سجل الإصدارات","مقارنة واستعادة أي نسخة منشورة"]].map(([r,i,t,d])=>`<a class="row" href="#/${r}" style="text-decoration:none"><span class="ic">${ic(i)}</span><span class="t"><b>${t}</b><span>${d}</span></span>${ic("arrow",16)}</a>`).join("")}
  </div></section>
 </div>`;
 bindPub(v);
}};
function bindPub(root){
 $$("[data-act]",root).forEach(b=>b.onclick=()=>({draft:()=>{saveDraft();render()},preview:openPreview,publish})[b.dataset.act]());
 $$("[data-verify]",root).forEach(a=>a.addEventListener("click",()=>{if(LOG().flags.publish){mark("verify","فتح الموقع المنشور للتحقق");if(LOG().flags.restore)mark("functional");if(S.route==="overview")setTimeout(render,150)}}));
}

/* ====================================================== PAGES */
PAGES.pages={title:"الصفحات",render(v){
 const n=S.work.projects.filter(p=>p.status==="published").length;
 const rows=[["الرئيسية","/","ok","منشورة",`${S.work.sections.filter(s=>s.visible!==false).length} قسماً ظاهراً`,"sections"],["دراسة حالة مشروع","/work/:slug","pri","قالب",`${n} صفحة مشروع منشورة`,"projects"],["نموذج التواصل","/#contact","ok","منشورة",`${leads().length} طلباً في الوارد`,"forms"],["سياسة الخصوصية","/privacy","warn","مسودة","تُكتب في المرحلة 4 (CMS)",""],["الصفحة غير موجودة","/404","","نظام","تستخدم ألوان الثيم تلقائياً",""]];
 v.innerHTML=`${ph("PAGES","الصفحات","كل صفحات الموقع ولغاتها. الصفحة الرئيسية تُبنى من الأقسام، وصفحات المشاريع تُولَّد من بيانات كل مشروع.")}
 <section class="card flush"><div class="tscroll"><table class="tbl"><thead><tr><th>الصفحة</th><th>الرابط</th><th>الحالة</th><th>اللغات</th><th>المحتوى</th><th></th></tr></thead><tbody>
 ${rows.map(([t,u,c,s,d,r])=>`<tr class="${r?"click":""}" ${r?`data-go="${r}"`:""}><td><b>${t}</b></td><td class="mono" style="text-transform:none">${u}</td><td><span class="badge ${c}"><i></i>${s}</span></td><td><span class="badge">AR</span> ${S.work.settings.en?`<span class="badge">EN</span>`:""}</td><td class="muted">${d}</td><td>${r?ic("arrow",16):""}</td></tr>`).join("")}
 </tbody></table></div></section>
 <p class="note">في هذا النموذج الصفحة الرئيسية وقالب المشروع مكتملان. إنشاء صفحات حرة بمحرر الأقسام نفسه جزء من مرحلة CMS في خطة التنفيذ.</p>`;
 $$("[data-go]",v).forEach(r=>r.onclick=()=>location.hash="#/"+r.dataset.go);
}};

/* ====================================================== SECTIONS (visual builder) */
const TYPE_IC={hero:"star",text:"text",image:"image",gallery:"grid",video:"video",services:"pack",team:"users",projects:"folder",testimonials:"quote",stats:"chart",cta:"mega",contact:"mail",timeline:"timeline",beforeafter:"split",logos:"cloud",custom:"layers"};
const TYPES=[["hero","الواجهة","Hero"],["text","نص","Text"],["image","صورة","Image"],["gallery","معرض","Gallery"],["video","فيديو","Video"],["services","خدمات","Services"],["team","فريق","Team"],["projects","مشاريع","Projects"],["testimonials","آراء","Testimonials"],["stats","أرقام","Statistics"],["cta","دعوة للعمل","CTA"],["contact","تواصل","Contact"],["timeline","خط زمني","Timeline"],["beforeafter","قبل / بعد","Before/After"],["logos","شعارات العملاء","Logo Cloud"],["custom","قسم مخصص","Custom"]];
const secType=s=>s.custom?s.custom.type:(TPCMS.SECTIONS.find(x=>x[0]===s.id)||[])[3]||"custom";
PAGES.sections={title:"الأقسام",lang:true,render(v,args){
 v.innerHTML=`${ph("BUILDER","الأقسام","رتّب أقسام الصفحة الرئيسية بالسحب، أظهر أو أخفِ أي قسم، وعدّل محتواه مع معاينة مباشرة.",`<button class="btn btn-primary" type="button" id="addSec">${ic("plus",16)} إضافة قسم</button>`)}
 ${roBar()}<div class="split"><div style="display:grid;gap:10px;align-content:start"><div class="rows" id="secList"></div><p class="note">اسحب المقبض ${ic("grip",14)} لإعادة الترتيب. الأقسام الأساسية تُخفى ولا تُحذف حتى لا يضيع محتواها؛ الأقسام المضافة يمكن حذفها.</p></div>${previewHTML()}</div>`;
 const draw=()=>{
  $("#secList").innerHTML=S.work.sections.map((s,i)=>{const t=secType(s);return`<div class="row${s.visible===false?" off":""}${S.sel.sec===s.id?" sel":""}" data-idx="${i}" data-id="${s.id}">
   <span class="grip" title="اسحب لإعادة الترتيب">${ic("grip",16)}</span><span class="num">${String(i+1).padStart(2,"0")}</span><span class="ic">${ic(TYPE_IC[t]||"layers")}</span>
   <span class="t"><b>${esc(secLabel(s.id))}</b><span class="sec-type">${t}${s.custom?" · custom":""}${s.visible===false?" · hidden":""}</span></span>
   <span class="acts"><button class="icon-btn sm" type="button" data-a="up" aria-label="أعلى" ${i===0?"disabled":""}>↑</button><button class="icon-btn sm" type="button" data-a="vis" aria-label="${s.visible===false?"إظهار":"إخفاء"}" title="${s.visible===false?"إظهار":"إخفاء"}">${ic(s.visible===false?"eyeOff":"eye",15)}</button><button class="icon-btn sm" type="button" data-a="edit" aria-label="تعديل" title="تعديل">${ic("edit",15)}</button><button class="icon-btn sm" type="button" data-a="dup" aria-label="تكرار" title="تكرار">${ic("copy",15)}</button><button class="icon-btn sm" type="button" data-a="del" aria-label="حذف" title="${s.custom?"حذف":"القسم الأساسي يُخفى فقط"}" ${s.custom?"":"disabled"}>${ic("trash",15)}</button></span></div>`}).join("");
  sortable($("#secList"),".row",(f,t)=>{if(edit(w=>move(w.sections,f,t))){draw();toast("تم تغيير ترتيب الأقسام")}});
  $$("#secList .row").forEach(r=>{const id=r.dataset.id,i=+r.dataset.idx;
   r.querySelector(".t").onclick=()=>{S.sel.sec=id;$$("#secList .row").forEach(x=>x.classList.toggle("sel",x===r));pvScroll(id)};
   $$("[data-a]",r).forEach(b=>b.onclick=async()=>{const a=b.dataset.a;
    if(a==="up"){if(edit(w=>move(w.sections,i,i-1)))draw()}
    if(a==="vis"){if(edit(w=>{const s=w.sections[i];s.visible=s.visible===false})){draw();toast(S.work.sections[i].visible===false?"أُخفي القسم من الموقع":"أصبح القسم ظاهراً")}}
    if(a==="edit")openSection(id);
    if(a==="dup"){const nid=uid("cs-");if(edit(w=>w.sections.splice(i+1,0,dupSection(w,w.sections[i],nid)))){draw();toast("تم تكرار القسم كقسم مخصص");openSection(nid)}}
    if(a==="del"){if(!guard("delete"))return;if(await confirmBox("حذف القسم؟",`سيُحذف «${secLabel(id)}» من الصفحة. يمكن استعادته من سجل الإصدارات بعد النشر.`,"حذف",true)&&edit(w=>w.sections.splice(i,1),"delete")){draw();toast("حُذف القسم")}}
   });
  });
 };
 draw(); mountPreview(v,args[0]);
 $("#addSec").onclick=async()=>{
  if(!guard("edit"))return;
  const t=await modal({title:"إضافة قسم",wide:true,body:`<p class="muted">اختر نوع القسم. الأقسام الأساسية المخفية تُعاد للظهور، والأنواع الأخرى تُضاف كقسم مرن (عنوان، نص، زر، صورة).</p><div class="types">${TYPES.map(([k,a,e])=>`<button type="button" data-t="${k}">${ic(TYPE_IC[k],22)}<span>${a}</span><small class="ltr">${e}</small></button>`).join("")}</div>`,actions:[],onMount:(m,close)=>$$(".types button",m).forEach(b=>b.onclick=()=>close(b.dataset.t))});
  if(!t)return;
  const hidden=S.work.sections.find(s=>!s.custom&&secType(s)===t&&s.visible===false);
  if(hidden){edit(w=>w.sections.find(s=>s.id===hidden.id).visible=true);draw();toast(`أُعيد إظهار «${secLabel(hidden.id)}»`);pvScroll(hidden.id);return}
  const nid=uid("cs-"),name=TYPES.find(x=>x[0]===t);
  edit(w=>{const at=w.sections.findIndex(s=>s.id==="cta");w.sections.splice(at<0?w.sections.length:at,0,{id:nid,visible:true,custom:{type:t,image:null,ar:{eyebrow:name[1],h2:`قسم ${name[1]} جديد`,p:"اكتب هنا وصفاً قصيراً لهذا القسم.",btn:"",href:"#contact"},en:{eyebrow:name[2],h2:`New ${name[2]} section`,p:"Write a short description for this section.",btn:"",href:"#contact"}}})});
  mark("sectionAdd",`إضافة قسم: ${name[1]}`); draw(); openSection(nid);
 };
 if(args[0])setTimeout(()=>openSection(args[0]),60);
}};
function dupSection(w,s,nid){
 if(s.custom)return{...clone(s),id:nid,custom:{...clone(s.custom),ar:{...s.custom.ar,h2:s.custom.ar.h2+" (نسخة)"},en:{...s.custom.en,h2:s.custom.en.h2+" (copy)"}}};
 const key={about:"intro",testimonials:"tst"}[s.id]||s.id,pick=l=>{const c=w.content[l][key]||{};return{eyebrow:typeof c.eyebrow==="string"?c.eyebrow:"",h2:(c.h2||secLabel(s.id)).replace(/<[^>]+>/g,"")+(l==="ar"?" (نسخة)":" (copy)"),p:c.p||c.desc||"",btn:"",href:"#contact"}};
 return{id:nid,visible:true,custom:{type:secType(s),image:null,ar:pick("ar"),en:pick("en")}};
}
const head3=k=>fld("السطر الصغير (Eyebrow)",inp(`content.{L}.${k}.eyebrow`))+fld("العنوان",inp(`content.{L}.${k}.h2`,{max:80}),{count:1})+fld("الوصف",area(`content.{L}.${k}.p`,{max:240}),{count:1});
const manage=(r,t)=>`<a class="btn btn-ghost" href="#/${r}" data-close>${ic("arrow",16)} ${t}</a>`;
function openSection(id){
 const s=S.work.sections.find(x=>x.id===id);if(!s)return;
 S.sel.sec=id;$$("#secList .row").forEach(x=>x.classList.toggle("sel",x.dataset.id===id));pvScroll(id);
 const i=S.work.sections.indexOf(s),C_=C();let body=langNote();
 const E={
  hero:()=>{const hb=S.work.bg.hero,clips=Object.values(media()).filter(r=>r.kind==="video");
   return fld("السطر الصغير",inp("content.{L}.hero.eyebrow",{mark:"heroText"}))+fld("العنوان الرئيسي",area("content.{L}.hero.h1",{t:"em",max:90,rows:2,mark:"heroText"}),{count:1,hint:"ضع الكلمة المميزة بين [ ] لتظهر بلون مختلف."})+fld("الوصف",area("content.{L}.hero.desc",{max:240,mark:"heroText"}),{count:1})
   +`<div class="f2">${fld("الزر الأساسي",inp("content.{L}.hero.c1",{mark:"heroText"}))}${fld("الزر الثانوي",inp("content.{L}.hero.c2",{mark:"heroText"}))}</div>`
   +`<div class="fld"><span class="lbl">أرقام الواجهة</span>${C_.hero.specs.map((_,j)=>`<div class="f2">${inp(`content.{L}.hero.specs.${j}.0`)}${inp(`content.{L}.hero.specs.${j}.1`)}</div>`).join("")}</div>
   <hr class="crease"><div class="fld"><span class="lbl">خلفية الواجهة</span><div class="seg" role="group" id="hbKind">${[["clip","فيديو من المكتبة"],["url","رابط فيديو"],["image","صورة"],["none","بدون"]].map(([k,t])=>`<button type="button" data-k2="${k}" aria-pressed="${hb.kind===k}">${t}</button>`).join("")}</div></div>
   <div id="hbPane"></div>${fld("قوة الطبقة فوق الخلفية",`<input type="range" min="0" max="0.95" step="0.05" data-k="bg.hero.ov" data-t="num">`,{hint:"كلما زادت، صار النص أوضح والخلفية أهدأ."})}`},
  about:()=>fld("السطر الصغير",inp("content.{L}.intro.eyebrow"))+fld("الفقرة الرئيسية",area("content.{L}.intro.lead",{t:"mark",rows:4}),{hint:"ضع العبارات المميزة بين [ ]."})+C_.intro.pillars.map((_,j)=>`<div class="card" style="padding:12px;display:grid;gap:8px"><span class="mono muted">PILLAR 0${j+1}</span>${inp(`content.{L}.intro.pillars.${j}.0`,{ltr:1})}${inp(`content.{L}.intro.pillars.${j}.1`)}${area(`content.{L}.intro.pillars.${j}.2`,{rows:2})}</div>`).join(""),
  team:()=>head3("team")+manage("team","إدارة أعضاء الفريق"),
  services:()=>head3("services")+manage("services","إدارة الخدمات"),
  featured:()=>head3("featured")+fld("نص زر دراسة الحالة",inp("content.{L}.featured.view"))+manage("projects","اختيار المشاريع المميزة"),
  work:()=>head3("gallery")+fld("تسمية «الكل»",inp("content.{L}.gallery.all"))+manage("projects","إدارة المعرض"),
  process:()=>head3("process")+C_.process.steps.map((_,j)=>`<details class="card" style="padding:12px"><summary><b>${j+1}. ${esc(C_.process.steps[j][0])}</b> <span class="muted">· ${esc(C_.process.steps[j][4])}</span></summary><div class="form" style="margin-top:10px"><div class="f2">${inp(`content.{L}.process.steps.${j}.0`)}${inp(`content.{L}.process.steps.${j}.4`)}</div>${area(`content.{L}.process.steps.${j}.2`,{rows:2})}${fld("ما يستلمه العميل",`<div class="tags" data-tags="content.{L}.process.steps.${j}.3"></div>`)}</div></details>`).join(""),
  materials:()=>head3("materials")+`<details class="card" style="padding:12px"><summary><b>الخامات (${MAT_KEYS.length})</b></summary><div class="form" style="margin-top:10px">${MAT_KEYS.map(k=>`<div class="f3">${inp(`content.{L}.materials.mats.${k}.0`)}${inp(`content.{L}.materials.mats.${k}.1`,{ltr:1})}${inp(`content.{L}.materials.mats.${k}.2`)}</div>`).join("")}</div></details><details class="card" style="padding:12px"><summary><b>التشطيبات (${FIN_KEYS.length})</b></summary><div class="form" style="margin-top:10px">${fld("عنوان التشطيب",inp("content.{L}.materials.finTitle"))}${FIN_KEYS.map(k=>`<div class="f2">${inp(`content.{L}.materials.fins.${k}.0`)}${inp(`content.{L}.materials.fins.${k}.1`)}</div>`).join("")}</div></details>`,
  ba:()=>head3("ba")+C_.ba.cases.map((_,j)=>`<div class="card" style="padding:12px;display:grid;gap:10px"><div class="f2">${inp(`content.{L}.ba.cases.${j}.0`)}${inp(`content.{L}.ba.cases.${j}.1`)}</div><div class="f2">${fld("قبل",pickHTML(`baMedia.${j}.0`))}${fld("بعد",pickHTML(`baMedia.${j}.1`))}</div></div>`).join("")+`<p class="note">بدون صور تُعرض مجسمات مولّدة تلقائياً من بيانات المشروع.</p>`,
  video:()=>head3("video")+C_.video.items.map((_,j)=>`<div class="card" style="padding:12px;display:grid;gap:8px"><span class="mono muted">VIDEO 0${j+1}</span><div class="f2">${inp(`content.{L}.video.items.${j}.0`)}${inp(`content.{L}.video.items.${j}.1`,{ltr:1,ph:"1:24"})}</div>${inp(`content.{L}.video.items.${j}.2`)}${inp(`videos.${j}.url`,{ltr:1,ph:"https://youtu.be/… أو رابط MP4"})}</div>`).join(""),
  stats:()=>C_.stats.map((_,j)=>`<div class="f3">${inp(`content.{L}.stats.${j}.0`,{ltr:1})}${inp(`content.{L}.stats.${j}.1`)}${inp(`content.{L}.stats.${j}.2`,{ph:"وحدة (اختياري)"})}</div>`).join(""),
  testimonials:()=>fld("السطر الصغير",inp("content.{L}.tst.eyebrow"))+fld("العنوان",inp("content.{L}.tst.h2"))+manage("testimonials","إدارة الآراء"),
  cta:()=>fld("العنوان",inp("content.{L}.cta.h2"))+fld("الوصف",area("content.{L}.cta.p"))+`<div class="f2">${fld("الزر الأساسي",inp("content.{L}.cta.c1"))}${fld("الزر الثانوي",inp("content.{L}.cta.c2"))}</div>`,
  contact:()=>head3("contact")+`<p class="note">بيانات التواصل (البريد، واتساب، الموقع، الساعات) تُدار من <a href="#/settings" data-close>الإعدادات</a>، والطلبات الواردة من <a href="#/forms" data-close>النماذج</a>.</p>`,
  custom:()=>`<span class="badge pri">${ic(TYPE_IC[s.custom.type]||"layers",12)} ${esc((TYPES.find(x=>x[0]===s.custom.type)||[,"مخصص"])[1])}</span>`+fld("السطر الصغير",inp(`sections.${i}.custom.{L}.eyebrow`))+fld("العنوان",inp(`sections.${i}.custom.{L}.h2`,{max:80}),{count:1})+fld("النص",area(`sections.${i}.custom.{L}.p`,{max:400}),{count:1})+`<div class="f2">${fld("نص الزر (اختياري)",inp(`sections.${i}.custom.{L}.btn`))}${fld("رابط الزر",inp(`sections.${i}.custom.{L}.href`,{ltr:1}))}</div>`+fld("صورة",pickHTML(`sections.${i}.custom.image`))
 };
 body+=(s.custom?E.custom:E[id])();
 drawer(`تعديل: ${secLabel(id)}`,body,d=>{
  bindPicks(d,(k)=>{if(k.startsWith("bg."))mark("heroImage")});
  const hk=$("#hbKind",d);
  if(hk){const pane=$("#hbPane",d),clips=Object.values(media()).filter(r=>r.kind==="video");
   const paint=()=>{const hb=S.work.bg.hero;pane.innerHTML=hb.kind==="clip"?fld("الفيديو",`<select id="hbClip">${clips.map(r=>`<option value="${r.clip||""}" ${r.clip===hb.clip?"selected":""} ${r.clip?"":"disabled"}>${esc(r.title||r.name)}${r.clip?"":" — يُرفع للخادم في النسخة النهائية"}</option>`).join("")}</select>`,{hint:"الفيديو يتقدم ويرجع مع التمرير كما في النموذج."}):hb.kind==="url"?fld("رابط الفيديو (MP4 / WEBM)",inp("bg.hero.url",{ltr:1,ph:"https://…/hero.mp4",mark:"heroVideo"})):hb.kind==="image"?fld("الصورة",pickHTML("bg.hero.image")):`<p class="note">الواجهة بدون خلفية — يظهر الفرد والمجسم فقط.</p>`;
    bind(pane);bindPicks(pane,()=>mark("heroImage"));const sel=$("#hbClip",pane);if(sel)sel.onchange=()=>{if(edit(w=>w.bg.hero.clip=sel.value))mark("heroVideo","تغيير فيديو الواجهة")}};
   paint();$$("button",hk).forEach(b=>b.onclick=()=>{if(edit(w=>w.bg.hero.kind=b.dataset.k2)){$$("button",hk).forEach(x=>x.setAttribute("aria-pressed",x===b));if(b.dataset.k2==="clip")mark("heroVideo");paint()}});
  }
  d.addEventListener("bound",()=>{const r=$(`#secList .row[data-id="${id}"] .t b`);if(r)r.textContent=secLabel(id)});
  $$("[data-close]",d).forEach(a=>a.addEventListener("click",closeDrawer));
 });
}

/* ====================================================== PROJECTS */
const catName=k=>(S.work.content[S.lang].cats||{})[k]||k;
const ptxt=(p,l=S.lang)=>S.work.content[l].proj[p.id]||[p.lbl,"",""];
function artHTML(p,W=400,H=320){const u=p.cover&&TPCMS.mediaUrl(p.cover);return boxArt(u?{...p,coverUrl:u}:p,W,H,{alt:ptxt(p)[0]})}
const pf={q:"",status:"all",cat:"all"};
PAGES.projects={title:"المشاريع",lang:true,render(v,args){
 if(args[0]==="new"){PAGES.projects.render(v,[]);newProject();return}
 if(args[0])return projectEditor(v,args[0]);
 v.innerHTML=`${ph("PORTFOLIO","المشاريع","المعرض ودراسات الحالة. اسحب البطاقات لتغيير ترتيب العرض، والنجمة تضع المشروع في «مشاريع مختارة».",`<button class="btn btn-ghost" type="button" id="catBtn">${ic("folder",16)} التصنيفات</button><a class="btn btn-primary" href="#/projects/new">${ic("plus",16)} مشروع جديد</a>`)}${roBar()}
 <div class="toolbar"><label class="search">${ic("search",16)}<input type="search" id="pq" placeholder="ابحث بالاسم أو العميل…" value="${esc(pf.q)}" aria-label="بحث"></label><div class="chips" id="pst"></div><select class="inp" id="pcat" style="width:auto" aria-label="التصنيف"><option value="all">كل التصنيفات</option>${S.work.cats.map(c=>`<option value="${c}" ${pf.cat===c?"selected":""}>${esc(catName(c))}</option>`).join("")}</select></div>
 <div class="pgrid" id="pgrid"></div><p class="note" id="pnote"></p>`;
 const draw=()=>{
  const P=S.work.projects,q=pf.q.trim().toLowerCase();
  $("#pst").innerHTML=[["all","الكل"],["published","منشور"],["draft","مسودة"],["archived","مؤرشف"]].map(([k,t])=>`<button class="chipb" type="button" data-s="${k}" aria-pressed="${pf.status===k}">${t}<sup>${k==="all"?P.length:P.filter(p=>p.status===k).length}</sup></button>`).join("");
  $$("#pst button").forEach(b=>b.onclick=()=>{pf.status=b.dataset.s;draw()});
  const filtered=pf.status!=="all"||pf.cat!=="all"||q;
  const list=P.map((p,i)=>({p,i})).filter(({p})=>(pf.status==="all"||p.status===pf.status)&&(pf.cat==="all"||p.cat===pf.cat)&&(!q||(ptxt(p,"ar").join(" ")+ptxt(p,"en").join(" ")+p.lbl).toLowerCase().includes(q)));
  $("#pgrid").innerHTML=list.map(({p,i})=>`<div class="pcard" data-idx="${i}" data-id="${p.id}" role="link" tabindex="0"><div class="thumb">${artHTML(p)}</div><span class="tl"><span class="badge ${PSTAT[p.status][1]}" style="background:var(--surface)"><i></i>${PSTAT[p.status][0]}</span></span><span class="tr"><button class="star" type="button" data-star aria-pressed="${!!p.featured}" title="مشروع مميز" aria-label="مشروع مميز">${ic("star",16)}</button></span><div class="meta"><b>${esc(ptxt(p)[0])}</b><span>${esc(ptxt(p)[1])} · ${esc(catName(p.cat))}</span><span class="mono" style="text-transform:none">#${String(i+1).padStart(2,"0")} · ${esc(p.dims||"")}${p.gallery.length?` · ${p.gallery.length} صور`:""}</span></div></div>`).join("")||`<div class="empty" style="grid-column:1/-1">لا توجد مشاريع تطابق البحث</div>`;
  $("#pnote").innerHTML=filtered?"الترتيب بالسحب متاح عند عرض «الكل» بدون بحث أو تصنيف.":`اسحب أي بطاقة إلى موضع جديد لتغيير ترتيبها في المعرض. ${P.filter(p=>p.featured&&p.status==="published").length} مشاريع مميزة تظهر في «مشاريع مختارة».`;
  $$("#pgrid .pcard").forEach(c=>{const open=()=>location.hash="#/projects/"+c.dataset.id;c.onclick=e=>{if(!e.target.closest("[data-star]"))open()};c.onkeydown=e=>{if(e.key==="Enter")open()};
   $("[data-star]",c).onclick=()=>{const i=+c.dataset.idx;if(edit(w=>w.projects[i].featured=!w.projects[i].featured,"projects")){draw();toast(S.work.projects[i].featured?"أُضيف إلى المشاريع المختارة":"أُزيل من المشاريع المختارة")}}});
  if(!filtered)sortable($("#pgrid"),".pcard",(f,t)=>{if(edit(w=>move(w.projects,f,t),"projects")){mark("reorder","إعادة ترتيب المشاريع");draw();toast("تم تغيير ترتيب المشاريع")}});
 };
 draw();
 $("#pq").oninput=e=>{pf.q=e.target.value;draw()};
 $("#pcat").onchange=e=>{pf.cat=e.target.value;draw()};
 $("#catBtn").onclick=manageCats;
}};
async function newProject(){
 if(!guard("projects")){location.hash="#/projects";return}
 const v=await modal({title:"مشروع جديد",body:`<div class="form">${fld("اسم المشروع (عربي)",`<input id="np1" required placeholder="مثال: عسل الجبل">`)}${fld("Project name (English)",`<input id="np2" dir="ltr" placeholder="e.g. Mountain Honey">`)}${fld("العميل",`<input id="np3" placeholder="اسم العلامة أو الشركة">`)}${fld("التصنيف",`<select id="np4">${S.work.cats.map(c=>`<option value="${c}">${esc(catName(c))}</option>`).join("")}</select>`)}</div>`,
  actions:[{label:"إلغاء",value:null,cls:"btn-quiet"},{label:"إنشاء كمسودة",value:"ok",cls:"btn-accent",validate:()=>$("#np1").value.trim()||(toast("اكتب اسم المشروع","err"),false)}],
  read:()=>({ar:$("#np1").value.trim(),en:$("#np2").value.trim(),client:$("#np3").value.trim(),cat:$("#np4").value})});
 if(!v){location.hash="#/projects";return}
 const r=v.read,id=(r.en||"project").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,24)||"project",uidd=S.work.projects.some(p=>p.id===id)?id+"-"+Date.now().toString(36).slice(-3):id;
 const pals=[["#EFE6D0","#06414F","#EF974F","#F4ECD5"],["#E8E1D6","#3D3D3D","#C9A45C","#F4ECD5"],["#E3ECEE","#FFFFFF","#1E8AA0","#0B4250"],["#F3E4CF","#6B3E1F","#E3B04B","#F7EBD0"]],pl=pals[S.work.projects.length%pals.length];
 edit(w=>{w.projects.unshift({id:uidd,cat:r.cat,shape:"tall",pat:"band",bg:pl[0],c1:pl[1],c2:pl[2],c3:pl[3],lbl:(r.en||r.ar).toUpperCase().slice(0,10),dims:"80×80×180",featured:false,status:"draft",slug:uidd,meta:{mat:"fbb",fin:["matte"],svc:[0]},industry:"",cover:null,gallery:[],videos:[],before:null,after:null,dieline:null,seo:{title:"",desc:""}});
  w.content.ar.proj[uidd]=[r.ar,r.client,""];w.content.en.proj[uidd]=[r.en||r.ar,r.client,""]},"projects");
 mark("projectAdd",`إضافة مشروع: ${r.ar}`); toast("أُنشئ المشروع كمسودة — أكمل بياناته ثم غيّر حالته إلى «منشور»","ok");
 location.hash="#/projects/"+uidd;
}
async function manageCats(){
 const draw=()=>S.work.cats.map((c,i)=>`<div class="row" data-i="${i}"><span class="t"><div class="f2"><input class="inp" data-k="content.ar.cats.${c}" aria-label="عربي"><input class="inp" data-k="content.en.cats.${c}" aria-label="English"></div></span><span class="badge">${S.work.projects.filter(p=>p.cat===c).length}</span><button class="icon-btn sm" type="button" data-del="${c}" aria-label="حذف">${ic("trash",14)}</button></div>`).join("");
 await modal({title:"تصنيفات المشاريع",body:`<p class="muted">التصنيفات تظهر كفلاتر في معرض الأعمال. الاسم بالعربية والإنجليزية.</p><div class="rows" id="catRows">${draw()}</div><button class="btn btn-ghost" type="button" id="catAdd">${ic("plus",16)} تصنيف جديد</button>`,actions:[{label:"تم",value:null,cls:"btn-accent"}],
  onMount:m=>{const wire=()=>{bind($("#catRows",m));$$("[data-del]",m).forEach(b=>b.onclick=()=>{const c=b.dataset.del;if(S.work.projects.some(p=>p.cat===c))return toast("لا يمكن حذف تصنيف مستخدم في مشاريع","err");if(edit(w=>{w.cats=w.cats.filter(x=>x!==c);delete w.content.ar.cats[c];delete w.content.en.cats[c]},"delete")){$("#catRows",m).innerHTML=draw();wire()}})};wire();
   $("#catAdd",m).onclick=()=>{const k=uid("cat");if(edit(w=>{w.cats.push(k);w.content.ar.cats[k]="تصنيف جديد";w.content.en.cats[k]="New category"},"projects")){$("#catRows",m).innerHTML=draw();wire();$$("#catRows input",m).slice(-2)[0].select()}}}});
 render();
}
let ptab="content";
function projectEditor(v,id){
 const i=S.work.projects.findIndex(p=>p.id===id);if(i<0){v.innerHTML=`<div class="empty">المشروع غير موجود. <a href="#/projects">العودة للمشاريع</a></div>`;return}
 const p=S.work.projects[i],b=`projects.${i}`,M=S.work.content[S.lang];
 S.title=ptxt(p,"ar")[0];
 v.innerHTML=`${ph(`<a href="#/projects" style="text-decoration:none">PROJECTS ←</a>`,esc(ptxt(p)[0]),`${esc(catName(p.cat))} · <span class="ltr">/work/${esc(p.slug)}</span>`,`<a class="btn btn-ghost" href="index.html?preview=work#work" target="_blank" rel="noopener">${ic("eye",16)} معاينة</a><button class="btn btn-danger" type="button" id="pDel">${ic("trash",16)} حذف</button>`)}${roBar()}
 <fieldset class="pg" ${ro()}><div class="split"><section class="card"><div class="tabs" role="tablist">${[["content","المحتوى"],["media","الوسائط"],["prod","الإنتاج والمجسم"],["seo","SEO"]].map(([k,t])=>`<button type="button" role="tab" data-tab="${k}" aria-selected="${ptab===k}">${t}</button>`).join("")}</div><div class="form" id="ptab" style="margin-top:16px"></div></section>
 <div style="display:grid;gap:20px;align-content:start"><section class="card"><div class="card-h"><h3>النشر</h3></div><div class="form">
  ${fld("الحالة",`<select data-k="${b}.status" data-cap="projects"><option value="published">منشور — يظهر على الموقع</option><option value="draft">مسودة — مخفي</option><option value="archived">مؤرشف</option></select>`)}
  ${tgl("مشروع مميز (مشاريع مختارة)",`${b}.featured`,{cap:"projects"})}
  ${fld("الرابط (Slug)",inp(`${b}.slug`,{ltr:1}),{hint:"يُستخدم في رابط صفحة دراسة الحالة."})}
  ${fld("ترتيب العرض",`<select id="pOrder">${S.work.projects.map((_,j)=>`<option value="${j}" ${j===i?"selected":""}>${j+1}</option>`).join("")}</select>`)}
 </div></section><section class="card"><div class="card-h"><h3>المعاينة</h3><span class="sub">كما تظهر في المعرض</span></div><div class="art-prev" id="pArt">${artHTML(p,480,360)}</div></section></div></div></fieldset>`;
 const tabs={
  content:()=>langNote()+fld("اسم المشروع",inp(`content.{L}.proj.${id}.0`,{max:60}),{count:1})+`<div class="f2">${fld("العميل",inp(`content.{L}.proj.${id}.1`))}${fld("القطاع / الصناعة",inp(`${b}.industry`,{ph:"مثال: أغذية عضوية"}))}</div>`+fld("التصنيف",`<select data-k="${b}.cat" data-cap="projects">${S.work.cats.map(c=>`<option value="${c}">${esc(catName(c))}</option>`).join("")}</select>`)+fld("وصف دراسة الحالة",area(`content.{L}.proj.${id}.2`,{max:400,rows:5}),{count:1,hint:"يمكن للمساعد الذكي كتابة وصف احترافي: «اكتب وصفاً احترافياً لهذا المشروع»."}),
  media:()=>fld("صورة الغلاف",pickHTML(`${b}.cover`),{hint:"بدون صورة يُعرض مجسم مولّد من ألوان المشروع."})+`<div class="fld"><span class="lbl">معرض الصور <span class="cnt">${p.gallery.length}</span></span><div class="mgrid" id="pGal"></div><button class="btn btn-ghost btn-sm" type="button" id="galAdd" style="justify-self:start">${ic("upload",14)} إضافة صور</button></div>`+`<div class="f2">${fld("قبل (إعادة التصميم)",pickHTML(`${b}.before`))}${fld("بعد",pickHTML(`${b}.after`))}</div>`+fld("ملف الفرد (Dieline)",pickHTML(`${b}.dieline`,{kind:"any",label:"اختيار ملف"}),{hint:"PDF أو AI — يظهر كملف قابل للتنزيل في دراسة الحالة."})+fld("روابط فيديو",`<div class="tags" data-tags="${b}.videos"></div>`,{hint:"روابط YouTube أو Vimeo أو MP4."}),
  prod:()=>`<div class="f2">${fld("المقاس (مم)",inp(`${b}.dims`,{ltr:1,ph:"80×80×180"}))}${fld("الخامة",`<select data-k="${b}.meta.mat" data-cap="projects">${MAT_KEYS.map(k=>`<option value="${k}">${esc(M.materials.mats[k][0])}</option>`).join("")}</select>`)}</div>`
   +`<div class="fld"><span class="lbl">التشطيب</span><div class="checks" data-arr="${b}.meta.fin">${FIN_KEYS.map(k=>`<label><input type="checkbox" value="${k}" ${p.meta.fin.includes(k)?"checked":""}>${esc(M.materials.fins[k][0])}</label>`).join("")}</div></div>`
   +`<div class="fld"><span class="lbl">الخدمات المقدمة</span><div class="checks" data-arr="${b}.meta.svc" data-num>${M.services.items.map((s,k)=>`<label><input type="checkbox" value="${k}" ${p.meta.svc.includes(k)?"checked":""}>${esc(s[1])}</label>`).join("")}</div></div>`
   +`<hr class="crease"><div class="eyebrow mono">RENDER</div><div class="f3">${fld("الشكل",`<select data-k="${b}.shape" data-cap="projects">${Object.keys(SHAPES).map(k=>`<option>${k}</option>`).join("")}</select>`)}${fld("النمط",`<select data-k="${b}.pat" data-cap="projects">${["band","arc","frame","split","dots","stripes","kraft","plain"].map(k=>`<option>${k}</option>`).join("")}</select>`)}${fld("النص على العلبة",inp(`${b}.lbl`,{ltr:1,attrs:' maxlength="12"'}))}</div><div class="f2">${colorField("الخلفية",`${b}.bg`)}${colorField("لون العلبة",`${b}.c1`)}${colorField("اللون الثاني",`${b}.c2`)}${colorField("لون النص",`${b}.c3`)}</div>`,
  seo:()=>langNote()+fld("عنوان الصفحة (Meta Title)",inp(`${b}.seo.title`,{max:60,ph:ptxt(p)[0]+" — Titan Pack"}),{count:1})+fld("الوصف (Meta Description)",area(`${b}.seo.desc`,{max:160,rows:3,ph:ptxt(p)[2]}),{count:1})+`<div class="serp" id="pSerp"></div><p class="note">الحقول الفارغة تأخذ اسم المشروع ووصفه تلقائياً.</p>`
 };
 const art=()=>{$("#pArt").innerHTML=artHTML(S.work.projects[i],480,360)};
 const serp=()=>{const e=$("#pSerp");if(!e)return;const q=S.work.projects[i];e.innerHTML=`<div class="u">titanpack.com › work › ${esc(q.slug)}</div><div class="t">${esc(q.seo.title||ptxt(q)[0]+" — Titan Pack")}</div><div class="d">${esc((q.seo.desc||ptxt(q)[2]||"").slice(0,160))}</div>`};
 const gal=()=>{const g=$("#pGal");if(!g)return;const q=S.work.projects[i],m=media();g.innerHTML=q.gallery.map((id,k)=>`<div class="mitem" data-idx="${k}">${thumbHTML(m[id])}<b>${esc((m[id]||{}).name||"—")}</b><button class="icon-btn sm" type="button" data-rmg="${k}" aria-label="إزالة" style="position:absolute;top:12px;inset-inline-end:12px">${ic("x",14)}</button></div>`).join("")||`<div class="empty" style="grid-column:1/-1;padding:18px">لا توجد صور بعد</div>`;
  $$("[data-rmg]",g).forEach(x=>x.onclick=()=>{if(edit(w=>w.projects[i].gallery.splice(+x.dataset.rmg,1),"projects"))gal()});
  sortable(g,".mitem",(f,t)=>{if(edit(w=>move(w.projects[i].gallery,f,t),"projects"))gal()})};
 const show=k=>{ptab=k;$$("[data-tab]",v).forEach(t=>t.setAttribute("aria-selected",t.dataset.tab===k));const T=$("#ptab");T.innerHTML=tabs[k]();bind(T);bindColors(T,"projects",art);bindPicks(T,art);
  $$("[data-arr]",T).forEach(box=>box.onchange=()=>{const vals=$$("input:checked",box).map(x=>box.dataset.num!=null?+x.value:x.value);edit(w=>setP(w,box.dataset.arr,vals),"projects")});
  const ga=$("#galAdd",T);if(ga)ga.onclick=async()=>{const idm=await pickMedia("image");if(idm&&edit(w=>w.projects[i].gallery.push(idm),"projects")){mark("gallery","رفع صور لمعرض مشروع");gal()}};
  gal();serp();};
 $$("[data-tab]",v).forEach(t=>t.onclick=()=>show(t.dataset.tab));
 bind(v); show(ptab);
 v.addEventListener("bound",e=>{art();serp();if(/\.proj\..+\.0$/.test(e.detail.path)){$(".ph h2",v).textContent=ptxt(S.work.projects[i])[0]}});
 $("#pOrder").onchange=e=>{const t=+e.target.value;if(edit(w=>move(w.projects,i,t),"projects")){mark("reorder","إعادة ترتيب المشاريع");render()}};
 $("#pDel").onclick=async()=>{if(!guard("delete"))return;if(await confirmBox("حذف المشروع؟",`سيُحذف «${ptxt(p)[0]}» بكل بياناته من المسودة. الملفات تبقى في مكتبة الوسائط.`,"حذف المشروع",true)&&edit(w=>{w.projects.splice(i,1);delete w.content.ar.proj[id];delete w.content.en.proj[id]},"delete")){toast("حُذف المشروع");location.hash="#/projects"}};
}

/* ====================================================== collections: services / team / testimonials */
function collection(v,cfg){
 const {key,meta,title,eyebrow,sub,item,editor,make,flag,addLabel,section}=cfg;
 const arr=l=>getP(S.work,`content.${l}.${key}`),metaA=()=>S.work[meta];
 v.innerHTML=`${ph(eyebrow,title,sub,`<a class="btn btn-ghost" href="#/sections/${section}">${ic("layers",16)} عنوان القسم</a><button class="btn btn-primary" type="button" id="colAdd">${ic("plus",16)} ${addLabel}</button>`)}${roBar()}
 <div class="split"><div style="display:grid;gap:10px;align-content:start"><div class="rows" id="colList"></div><p class="note">اسحب لتغيير الترتيب. الترتيب والإخفاء يُطبَّقان على اللغتين، والنصوص تُحرَّر لكل لغة على حدة.</p></div>${previewHTML()}</div>`;
 const draw=()=>{
  $("#colList").innerHTML=arr(S.lang).map((x,i)=>{const it=item(x,i),hid=(metaA()[i]||{}).visible===false;return`<div class="row${hid?" off":""}" data-idx="${i}"><span class="grip">${ic("grip",16)}</span><span class="num">${String(i+1).padStart(2,"0")}</span>${it.ic?`<span class="ic">${ic(it.ic)}</span>`:""}<span class="t"><b>${esc(it.t)}</b><span>${esc(it.s)}</span></span><span class="acts"><button class="icon-btn sm" type="button" data-a="vis" aria-label="${hid?"إظهار":"إخفاء"}">${ic(hid?"eyeOff":"eye",15)}</button><button class="icon-btn sm" type="button" data-a="edit" aria-label="تعديل">${ic("edit",15)}</button><button class="icon-btn sm" type="button" data-a="del" aria-label="حذف">${ic("trash",15)}</button></span></div>`}).join("")||`<div class="empty">لا توجد عناصر</div>`;
  sortable($("#colList"),".row",(f,t)=>{if(edit(w=>{for(const l of ["ar","en"])move(getP(w,`content.${l}.${key}`),f,t);move(w[meta],f,t);cfg.onMove&&cfg.onMove(w,f,t)})){draw();toast("تم تغيير الترتيب")}});
  $$("#colList .row").forEach(r=>{const i=+r.dataset.idx;r.querySelector(".t").onclick=()=>open(i);
   $$("[data-a]",r).forEach(b=>b.onclick=async()=>{const a=b.dataset.a;
    if(a==="edit")open(i);
    if(a==="vis"&&edit(w=>{w[meta][i]=w[meta][i]||{};w[meta][i].visible=w[meta][i].visible===false}))draw();
    if(a==="del"){if(!guard("delete"))return;if(await confirmBox("حذف العنصر؟",`سيُحذف «${item(arr(S.lang)[i],i).t}» من اللغتين.`,"حذف",true)&&edit(w=>{for(const l of ["ar","en"])getP(w,`content.${l}.${key}`).splice(i,1);w[meta].splice(i,1);cfg.onDelete&&cfg.onDelete(w,i)},"delete")){draw();toast("تم الحذف")}}
   });
  });
 };
 const open=i=>{pvScroll(section);drawer(`تعديل: ${item(arr(S.lang)[i],i).t}`,langNote()+editor(i),d=>{bindPicks(d);cfg.mount&&cfg.mount(d,i,draw);d.addEventListener("bound",draw)})};
 draw(); mountPreview(v,section);
 $("#colAdd").onclick=()=>{if(edit(w=>{for(const l of ["ar","en"])getP(w,`content.${l}.${key}`).push(make(l));w[meta].push(cfg.makeMeta?cfg.makeMeta():{visible:true})})){mark(flag,`${addLabel}`);draw();open(arr(S.lang).length-1)}};
 if(cfg.args&&cfg.args[0]!=null)open(+cfg.args[0]);
}
const ICONS=["pack","box","struct","die","brand","cube","press","truck","eye","pen"];
const iconPick=(pth)=>`<div class="fld"><span class="lbl">الأيقونة</span><div class="opt-grid" data-icon="${pth}">${ICONS.map(k=>`<button type="button" data-v="${k}" aria-label="${k}" aria-pressed="${getP(S.work,pth.replace("{L}","ar"))===k}">${ic(k,22)}</button>`).join("")}</div></div>`;
const bindIcon=(d,pth,after)=>$$("[data-icon] button",d).forEach(b=>b.onclick=()=>{if(edit(w=>{for(const l of ["ar","en"])setP(w,pth.replace("{L}",l),b.dataset.v)})){$$("[data-icon] button",d).forEach(x=>x.setAttribute("aria-pressed",x===b));after&&after()}});
PAGES.services={title:"الخدمات",lang:true,render(v,args){collection(v,{args,key:"services.items",meta:"services",section:"services",title:"الخدمات",eyebrow:"SERVICES",sub:"الخدمات الثماني الافتراضية وأي خدمة جديدة. كل خدمة: عنوان، وصف، أيقونة، صورة، مميزات، ترتيب وظهور.",addLabel:"إضافة خدمة",flag:"serviceAdd",
 item:(x)=>({ic:x[0],t:x[1],s:x[2]+" · "+x[4].length+" مميزات"}),
 make:l=>l==="ar"?["pack","خدمة جديدة","New service","وصف مختصر للخدمة.",[]]:["pack","New service","خدمة جديدة","A short description of the service.",[]],
 makeMeta:()=>({visible:true,image:null,gallery:[]}),
 editor:i=>iconPick(`content.{L}.services.items.${i}.0`)+fld("اسم الخدمة",inp(`content.{L}.services.items.${i}.1`,{sync:`content.{O}.services.items.${i}.2`}))+fld("الوصف",area(`content.{L}.services.items.${i}.3`,{max:180}),{count:1})+fld("المميزات",`<div class="tags" data-tags="content.{L}.services.items.${i}.4"></div>`)+fld("صورة الخدمة",pickHTML(`services.${i}.image`),{hint:"تظهر في صفحة الخدمة التفصيلية."}),
 mount:(d,i,draw)=>bindIcon(d,`content.{L}.services.items.${i}.0`,draw),
 onMove:(w,f,t)=>{const map=[...Array(w.services.length).keys()];move(map,f,t);w.projects.forEach(p=>p.meta.svc=p.meta.svc.map(s=>map.indexOf(s)))},
 onDelete:(w,i)=>w.projects.forEach(p=>p.meta.svc=p.meta.svc.filter(s=>s!==i).map(s=>s>i?s-1:s))})}};
PAGES.team={title:"الفريق",lang:true,render(v,args){collection(v,{args,key:"team.members",meta:"team",section:"team",title:"الفريق",eyebrow:"TEAM",sub:"الخبراء الخمسة الذين يرافقون العبوة من الفكرة للإنتاج. كل المعلومات قابلة للتعديل.",addLabel:"إضافة عضو",flag:"teamAdd",
 item:x=>({ic:x.ic,t:x.t,s:x.en}),
 make:l=>l==="ar"?{ic:"pen",t:"عضو جديد",en:"New member",d:"وصف الدور ومسؤولياته.",tags:[]}:{ic:"pen",t:"New member",en:"عضو جديد",d:"Role and responsibilities.",tags:[]},
 makeMeta:()=>({visible:true,photo:null}),
 editor:i=>iconPick(`content.{L}.team.members.${i}.ic`)+fld("المسمى / التخصص",inp(`content.{L}.team.members.${i}.t`,{sync:`content.{O}.team.members.${i}.en`}))+fld("نبذة",area(`content.{L}.team.members.${i}.d`,{max:200}),{count:1})+fld("المهارات",`<div class="tags" data-tags="content.{L}.team.members.${i}.tags"></div>`)+fld("صورة شخصية (اختياري)",pickHTML(`team.${i}.photo`)),
 mount:(d,i,draw)=>bindIcon(d,`content.{L}.team.members.${i}.ic`,draw)})}};
PAGES.testimonials={title:"آراء العملاء",lang:true,render(v,args){collection(v,{args,key:"tst.items",meta:"tst",section:"testimonials",title:"آراء العملاء",eyebrow:"TESTIMONIALS",sub:"اقتباسات العملاء كما تظهر في الموقع.",addLabel:"إضافة رأي",flag:"tstAdd",
 item:x=>({ic:"quote",t:x[1]+" — "+x[2],s:x[0]}),
 make:l=>l==="ar"?["اكتب رأي العميل هنا.","اسم أو صفة العميل","القطاع"]:["Write the client's words here.","Client name or role","Sector"],
 editor:i=>fld("الاقتباس",area(`content.{L}.tst.items.${i}.0`,{max:260,rows:4}),{count:1})+`<div class="f2">${fld("العميل",inp(`content.{L}.tst.items.${i}.1`))}${fld("القطاع",inp(`content.{L}.tst.items.${i}.2`))}</div>`})}};

/* ====================================================== MEDIA */
const mf={folder:"all",kind:"all",q:""};
const folders=()=>[...FOLDERS,...(TPCMS.get("tp-cms-folders")||[])];
function usage(id){
 const w=S.work,u=[];
 w.projects.forEach(p=>{if([p.cover,p.before,p.after,p.dieline].includes(id)||p.gallery.includes(id))u.push("مشروع: "+ptxt(p,"ar")[0])});
 if(w.bg.hero.image===id)u.push("خلفية الواجهة");if(w.seo.og===id)u.push("صورة المشاركة (OG)");
 w.services.forEach((s,i)=>{if(s.image===id)u.push("خدمة: "+w.content.ar.services.items[i][1])});
 w.baMedia.forEach(c=>{if(c.includes(id))u.push("قبل / بعد")});
 w.sections.forEach(s=>{if(s.custom&&s.custom.image===id)u.push("قسم: "+s.custom.ar.h2)});
 const r=media()[id];if(r&&r.clip&&w.bg.hero.kind==="clip"&&w.bg.hero.clip===r.clip)u.push("فيديو الواجهة");
 return u;
}
PAGES.media={title:"الوسائط",render(v){
 v.innerHTML=`${ph("MEDIA LIBRARY","مكتبة الوسائط","ارفع الصور والفيديو وملفات التصميم. الصور تُحوَّل تلقائياً إلى WebP وتُصغَّر لأبعاد الويب.",`<label class="btn btn-primary" style="cursor:pointer">${ic("upload",16)} رفع ملفات<input type="file" id="mUp" multiple hidden accept="${Object.values(MEDIA_RULES).flatMap(r=>r.ext).map(e=>"."+e).join(",")}"></label>`)}${roBar()}
 <div class="split mlayout"><section class="card" style="padding:10px"><div class="folders" id="mFold"></div><hr class="crease" style="margin:8px 0"><button class="btn btn-quiet btn-sm" type="button" id="mNewF">${ic("plus",14)} مجلد جديد</button></section>
 <div style="display:grid;gap:14px;align-content:start"><div class="toolbar"><label class="search">${ic("search",16)}<input type="search" id="mQ" placeholder="ابحث باسم الملف…" value="${esc(mf.q)}" aria-label="بحث"></label><div class="chips" id="mKind"></div></div>
 <label class="drop" id="mDrop">${ic("upload",24)}<b>اسحب الملفات هنا</b><span>أو اضغط للاختيار</span><small>JPG · PNG · WEBP · SVG ≤15MB — MP4 · WEBM · MOV ≤200MB — PDF · AI · PSD · ZIP ≤50MB</small><input type="file" multiple hidden></label>
 <div class="mgrid" id="mGrid"></div></div></div>`;
 const draw=()=>{
  const all=Object.values(media()),q=mf.q.trim().toLowerCase();
  $("#mFold").innerHTML=folders().map(([k,t])=>`<button type="button" data-f="${k}" aria-pressed="${mf.folder===k}">${ic(k==="all"?"grid":"folder",16)} ${esc(t)}<span>${k==="all"?all.length:all.filter(r=>r.folder===k).length}</span></button>`).join("");
  $$("#mFold button").forEach(b=>b.onclick=()=>{mf.folder=b.dataset.f;draw()});
  $("#mKind").innerHTML=[["all","الكل"],["image","صور"],["video","فيديو"],["doc","ملفات"]].map(([k,t])=>`<button class="chipb" type="button" data-k3="${k}" aria-pressed="${mf.kind===k}">${t}</button>`).join("");
  $$("#mKind button").forEach(b=>b.onclick=()=>{mf.kind=b.dataset.k3;draw()});
  const list=all.filter(r=>(mf.folder==="all"||r.folder===mf.folder)&&(mf.kind==="all"||r.kind===mf.kind)&&(!q||r.name.toLowerCase().includes(q)||(r.title||"").includes(q))).sort((a,b)=>b.at-a.at);
  $("#mGrid").innerHTML=list.map(r=>`<button type="button" class="mitem" data-id="${r.id}">${thumbHTML(r)}<b>${esc(r.name)}</b><span>${MEDIA_RULES[r.kind].t} · ${fmtBytes(r.optSize||r.size)}${usage(r.id).length?" · مستخدم":""}</span></button>`).join("")||`<div class="empty" style="grid-column:1/-1">لا توجد ملفات هنا</div>`;
  $$("#mGrid .mitem").forEach(b=>b.onclick=()=>detail(b.dataset.id));
 };
 const up=async fs=>{if(!guard("media"))return;await ingestAll([...fs],mf.folder);draw()};
 const d=$("#mDrop"),fi=$("input",d);fi.onchange=()=>up(fi.files);$("#mUp").onchange=e=>up(e.target.files);
 d.ondragover=e=>{e.preventDefault();d.classList.add("over")};d.ondragleave=()=>d.classList.remove("over");d.ondrop=e=>{e.preventDefault();d.classList.remove("over");up(e.dataTransfer.files)};
 $("#mQ").oninput=e=>{mf.q=e.target.value;draw()};
 $("#mNewF").onclick=async()=>{if(!guard("media"))return;const r=await modal({title:"مجلد جديد",body:fld("اسم المجلد",`<input id="nf" placeholder="مثال: عينات الطباعة">`),actions:[{label:"إلغاء",value:null,cls:"btn-quiet"},{label:"إنشاء",value:1,cls:"btn-accent"}],read:()=>$("#nf").value.trim()});if(r&&r.read){const f=TPCMS.get("tp-cms-folders")||[];f.push([uid("f"),r.read]);TPCMS.put("tp-cms-folders",f);draw()}};
 const detail=id=>{const r=media()[id];if(!r)return;const u=usage(id),src=r.data||sessionURLs[id]||(r.clip?`media/${r.clip}.mp4`:"");
  drawer(r.name,`<div class="art-prev" style="aspect-ratio:auto;max-height:320px;display:grid;place-items:center">${r.kind==="image"&&r.data?`<img src="${r.data}" alt="" style="max-height:320px;object-fit:contain">`:r.kind==="video"&&src?`<video src="${src}" ${r.clip?`poster="media/${r.clip}.jpg"`:""} controls muted playsinline style="width:100%;max-height:320px"></video>`:thumbHTML(r)}</div>
   ${fld("اسم الملف",`<input id="mdName" value="${esc(r.name)}" dir="ltr">`)}${fld("المجلد",`<select id="mdFold">${folders().filter(f=>f[0]!=="all").map(([k,t])=>`<option value="${k}" ${r.folder===k?"selected":""}>${esc(t)}</option>`).join("")}</select>`)}
   <table class="tbl"><tbody><tr><td class="muted">النوع</td><td>${MEDIA_RULES[r.kind].t} · ${esc(r.ext.toUpperCase())}</td></tr><tr><td class="muted">الحجم</td><td>${fmtBytes(r.size)}${r.optSize?` → <b>${fmtBytes(r.optSize)}</b> <span class="badge ok">WebP −${Math.max(0,Math.round((1-r.optSize/r.size)*100))}%</span>`:""}</td></tr>${r.w?`<tr><td class="muted">الأبعاد</td><td class="ltr">${r.w} × ${r.h}</td></tr>`:""}<tr><td class="muted">الرفع</td><td>${fmtDate(r.at)} · ${esc(r.by||"")}</td></tr><tr><td class="muted">المعرّف</td><td class="mono" style="text-transform:none">${r.id}</td></tr></tbody></table>
   <div class="fld"><span class="lbl">أين يُستخدم</span>${u.length?`<div class="checks">${u.map(x=>`<span class="badge pri">${esc(x)}</span>`).join("")}</div>`:`<span class="muted" style="font-size:.84rem">غير مستخدم حالياً</span>`}</div>
   ${r.kind==="video"&&!r.clip&&!r.data?`<p class="note">الفيديو المرفوع قابل للمعاينة في هذه الجلسة فقط؛ في المنصة يُرفع للخادم ويُحوَّل لصيغ الويب.</p>`:""}`,
   dd=>{const save=()=>{const m=media();if(!m[id])return;m[id].name=$("#mdName",dd).value.trim()||m[id].name;m[id].folder=$("#mdFold",dd).value;TPCMS.put(K.media,m);draw()};
    $("#mdName",dd).onchange=()=>{if(guard("media"))save()};$("#mdFold",dd).onchange=()=>{if(guard("media")){save();toast("نُقل الملف")}};
    $("#mdRep",dd).onchange=async e=>{if(!guard("media"))return;try{await ingest(e.target.files[0],r.folder,id);toast("استُبدل الملف — كل الأماكن التي تستخدمه تحدّثت","ok");persistWork.flush();TPCMS.put(K.work,S.work);closeDrawer();draw()}catch(x){toast(String(x),"err")}};
    $("#mdCopy",dd).onclick=()=>{navigator.clipboard&&navigator.clipboard.writeText(id).then(()=>toast("نُسخ معرّف الملف"),()=>toast("تعذّر النسخ","err"))};
    $("#mdDel",dd).onclick=async()=>{if(!guard("delete"))return;if(await confirmBox("حذف الملف؟",u.length?`هذا الملف مستخدم في ${u.length} موضع (${u.join("، ")}). سيُزال منها.`:"سيُحذف الملف نهائياً من المكتبة.","حذف",true)){const m=media();delete m[id];TPCMS.put(K.media,m);edit(w=>{w.projects.forEach(p=>{["cover","before","after","dieline"].forEach(k=>{if(p[k]===id)p[k]=null});p.gallery=p.gallery.filter(x=>x!==id)});if(w.bg.hero.image===id)w.bg.hero.image=null;if(w.seo.og===id)w.seo.og=null;w.services.forEach(s=>{if(s.image===id)s.image=null});w.baMedia=w.baMedia.map(c=>c.map(x=>x===id?null:x));w.sections.forEach(s=>{if(s.custom&&s.custom.image===id)s.custom.image=null})},"delete");closeDrawer();draw();toast("حُذف الملف")}};
   },`<label class="btn btn-ghost btn-sm" style="cursor:pointer">${ic("upload",14)} استبدال<input type="file" id="mdRep" hidden accept=".${MEDIA_RULES[r.kind].ext.join(",.")}"></label><button class="btn btn-quiet btn-sm" type="button" id="mdCopy">${ic("copy",14)} نسخ المعرّف</button><button class="btn btn-danger btn-sm" type="button" id="mdDel" style="margin-inline-start:auto">${ic("trash",14)} حذف</button>`);
 };
 draw();
}};

/* ====================================================== THEME */
const THEME_PRESETS=[
 ["الافتراضي","هوية تيتان باك الأصلية",{...TPCMS.THEME_DEF}],
 ["فخامة داكنة","أسود وذهبي لعلب الهدايا والعطور",{primary:"#1B1B1B",accent:"#C9A45C",secondary:"#ECE6DA",bg:"#F6F2EA",surface:"#FFFDF8",ink:"#1B1B1B",muted:"#6A6358",border:"#1B1B1B",font:"Reem Kufi",headWeight:700,tracking:0,btn:"square",radius:4}],
 ["كرافت طبيعي","أخضر زيتوني وبني للمنتجات العضوية",{primary:"#3E5641",accent:"#C98A4B",secondary:"#E9E1CF",bg:"#F4EFE3",surface:"#FBF8F1",ink:"#26301F",muted:"#5E6655",border:"#3E5641",font:"Cairo",btn:"pill",radius:18}],
 ["صيدلاني نقي","أزرق هادئ ونظيف لقطاع الأدوية",{primary:"#23395B",accent:"#6FB3A8",secondary:"#E7EEF1",bg:"#F5F8F9",surface:"#FFFFFF",ink:"#1C2833",muted:"#5B6B78",border:"#23395B",font:"IBM Plex Sans Arabic",btn:"soft",radius:10}]
];
const FONTS=["Alexandria","Reem Kufi","Cairo","IBM Plex Sans Arabic"];
function lum(h){const n=parseInt(h.slice(1),16),c=[n>>16,n>>8&255,n&255].map(v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4});return .2126*c[0]+.7152*c[1]+.0722*c[2]}
const contrast=(a,b)=>{const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
let ttab="colors";
PAGES.theme={title:"الهوية والثيم",render(v){
 v.innerHTML=`${ph("THEME ENGINE","الهوية والثيم","غيّر الهوية البصرية كاملة دون لمس الكود. كل تغيير يظهر فوراً في المعاينة، ولا يصل للموقع إلا بعد النشر.",`<button class="btn btn-ghost" type="button" id="thReset">استعادة الافتراضي</button>`)}${roBar()}
 <div class="split rev"><fieldset class="pg" ${ro()||(!can("theme")?"disabled":"")}><section class="card"><div class="tabs" role="tablist">${[["colors","الألوان"],["type","الخطوط"],["ui","الواجهة"],["motion","الحركة"],["presets","ثيمات جاهزة"]].map(([k,t])=>`<button type="button" role="tab" data-tab="${k}" aria-selected="${ttab===k}">${t}</button>`).join("")}</div><div class="form" id="ttab" style="margin-top:16px"></div></section>${!can("theme")&&!ro()?`<p class="note" style="margin-top:12px">${ic("lock",14)} تعديل الهوية متاح للمالك والمدير فقط.</p>`:""}</fieldset>${previewHTML()}</div>`;
 const T=()=>S.work.theme,t="theme";
 const contrastRow=()=>{const a=contrast(T().ink,T().bg),b=contrast("#F4ECD5",T().primary),c=contrast("#2A1606",T().accent);const bd=r=>`<span class="badge ${r>=4.5?"ok":r>=3?"warn":"err"}">${r.toFixed(1)} ${r>=4.5?"AA":r>=3?"AA كبير":"ضعيف"}</span>`;return`<div class="fld"><span class="lbl">التباين (WCAG)</span><table class="tbl"><tbody><tr><td>النص على الخلفية</td><td>${bd(a)}</td></tr><tr><td>النص على اللون الأساسي</td><td>${bd(b)}</td></tr><tr><td>الأزرار المميزة</td><td>${bd(c)}</td></tr></tbody></table></div>`};
 const tabs={
  colors:()=>`<div class="fld"><span class="lbl">المظهر الافتراضي</span><div class="seg" role="group" data-segk="theme.mode">${[["auto","تلقائي"],["light","فاتح"],["dark","داكن"]].map(([k,x])=>`<button type="button" data-v="${k}" aria-pressed="${T().mode===k}">${x}</button>`).join("")}</div></div>
   <div class="f2">${colorField("الأساسي Primary","theme.primary")}${colorField("المميز Accent","theme.accent")}${colorField("الثانوي Secondary","theme.secondary",{hint:"خلفية الأقسام البديلة"})}${colorField("الخلفية Background","theme.bg")}${colorField("السطح Surface","theme.surface")}${colorField("النص Text","theme.ink")}${colorField("النص الثانوي Muted","theme.muted")}${colorField("الحدود Border","theme.border")}${colorField("نجاح Success","theme.success")}${colorField("تحذير Warning","theme.warning")}${colorField("خطأ Error","theme.error")}</div><div id="ctr">${contrastRow()}</div><p class="note">ألوان الخلفية والنصوص تخص الوضع الفاتح؛ الوضع الداكن يحافظ على لوحته المدروسة. الأساسي والمميز يُطبَّقان على الوضعين.</p>`,
  type:()=>`${fld("خط العناوين",`<select data-k="theme.font" data-cap="theme" data-mark="font">${FONTS.map(f=>`<option style="font-family:'${f}'">${f}</option>`).join("")}</select>`)}<div class="card" style="padding:14px"><div id="fontSample" style="font-family:'${T().font}';font-size:1.6rem;font-weight:${T().headWeight};line-height:1.25">نصمم العبوة التي تجعل منتجك يُرى</div><p style="font-family:'${T().bodyFont}';color:var(--muted);margin-top:6px" id="bodySample">من الفكرة إلى العبوة الجاهزة للتنفيذ — From idea to production.</p></div>
   ${fld("خط النصوص",`<select data-k="theme.bodyFont" data-cap="theme" data-mark="font">${FONTS.map(f=>`<option>${f}</option>`).join("")}</select>`)}
   <div class="f2">${fld("حجم الخط الأساسي",`<input type="range" min="14" max="19" step="1" data-k="theme.baseSize" data-t="num" data-cap="theme">`,{hint:"14 – 19 px"})}${fld("ارتفاع السطر",`<input type="range" min="1.4" max="2" step="0.05" data-k="theme.lineHeight" data-t="num" data-cap="theme">`)}${fld("وزن العناوين",`<select data-k="theme.headWeight" data-t="num" data-cap="theme">${[500,600,700,800].map(x=>`<option value="${x}">${x}</option>`).join("")}</select>`)}${fld("تباعد أحرف العناوين",`<input type="range" min="-4" max="6" step="1" data-k="theme.tracking" data-t="num" data-cap="theme">`)}</div>`,
  ui:()=>`${fld("استدارة الزوايا",`<input type="range" min="0" max="28" step="1" data-k="theme.radius" data-t="num" data-cap="theme">`,{hint:"من زوايا حادة (0) إلى ناعمة (28 px)"})}<div class="fld"><span class="lbl">شكل الأزرار</span><div class="seg" role="group" data-segk="theme.btn">${[["soft","ناعم"],["pill","كبسولة"],["square","حاد"]].map(([k,x])=>`<button type="button" data-v="${k}" aria-pressed="${T().btn===k}">${x}</button>`).join("")}</div></div>${fld("أقصى عرض للمحتوى",`<input type="range" min="1040" max="1440" step="20" data-k="theme.container" data-t="num" data-cap="theme">`,{hint:"العرض الأقصى للحاوية على الشاشات الكبيرة"})}<div class="card" style="padding:14px;display:flex;gap:8px;flex-wrap:wrap" id="uiSample"></div>`,
  motion:()=>`${tgl("تفعيل الحركة والانتقالات","theme.motion",{cap:"theme"})}${fld("مدة الحركة",`<input type="range" min="0.5" max="2" step="0.1" data-k="theme.speed" data-t="num" data-cap="theme">`,{hint:"أقل = أسرع · 1 = الافتراضي"})}<div class="fld"><span class="lbl">نمط الانتقال</span><div class="seg" role="group" data-segk="theme.ease">${[["smooth","سلس"],["snappy","سريع"],["soft","ناعم"]].map(([k,x])=>`<button type="button" data-v="${k}" aria-pressed="${T().ease===k}">${x}</button>`).join("")}</div></div><p class="note">يحترم الموقع دائماً إعداد «تقليل الحركة» في جهاز الزائر.</p>`,
  presets:()=>`<div class="rows">${THEME_PRESETS.map(([n,d,p],k)=>`<button type="button" class="row" data-preset="${k}" style="cursor:pointer;text-align:start"><span style="display:flex;gap:3px">${[p.primary,p.accent,p.secondary||"#EFE6D0",p.bg||"#F7F2E6"].map(c=>`<i style="width:18px;height:34px;border-radius:5px;background:${c};box-shadow:0 0 0 1px var(--line)"></i>`).join("")}</span><span class="t"><b style="font-family:'${p.font}'">${n}</b><span>${d}</span></span>${ic("arrow",16)}</button>`).join("")}</div><p class="note">تطبيق ثيم جاهز يغيّر عدة إعدادات معاً ويطلب تأكيداً. يمكنك التراجع بـ«استعادة الافتراضي» أو من سجل الإصدارات.</p>`
 };
 const side=()=>{const s=$("#fontSample");if(s){s.style.fontFamily=`'${T().font}'`;s.style.fontWeight=T().headWeight;$("#bodySample").style.fontFamily=`'${T().bodyFont}'`}const c=$("#ctr");if(c)c.innerHTML=contrastRow();const u=$("#uiSample");if(u){const r={soft:Math.round(T().radius*.7),pill:999,square:2}[T().btn];u.innerHTML=`<span class="btn" style="background:${T().accent};color:#2A1606;border-radius:${r}px">ابدأ مشروعك</span><span class="btn" style="background:${T().primary};color:#F4ECD5;border-radius:${r}px">شاهد أعمالنا</span><span style="flex:1;min-width:120px;height:44px;border-radius:${T().radius}px;border:1px solid var(--line-strong)"></span>`}};
 const show=k=>{ttab=k;$$("[data-tab]",v).forEach(x=>x.setAttribute("aria-selected",x.dataset.tab===k));const box=$("#ttab");box.innerHTML=tabs[k]();bind(box);bindColors(box,t,(key)=>{if(key==="theme.primary")mark("primary","تغيير اللون الأساسي");side()});
  $$("[data-segk]",box).forEach(g=>$$("button",g).forEach(b=>b.onclick=()=>{if(edit(w=>setP(w,g.dataset.segk,b.dataset.v),t)){$$("button",g).forEach(x=>x.setAttribute("aria-pressed",x===b));side()}}));
  $$("[data-preset]",box).forEach(b=>b.onclick=async()=>{if(!guard(t))return;const [n,,p]=THEME_PRESETS[+b.dataset.preset];if(await confirmBox(`تطبيق ثيم «${n}»؟`,`سيتغير ${Object.keys(p).length} إعداداً في الهوية (الألوان، الخطوط، الأزرار). المعاينة تتحدث فوراً والموقع لا يتغير قبل النشر.`,"تطبيق")){edit(w=>Object.assign(w.theme,TPCMS.THEME_DEF,p),t);if(p.primary!==TPCMS.THEME_DEF.primary)mark("primary");if(p.font!==TPCMS.THEME_DEF.font)mark("font");mark(null,`تطبيق ثيم: ${n}`);toast(`طُبّق ثيم «${n}»`,"ok")}});
  box.addEventListener("bound",side);side()};
 $$("[data-tab]",v).forEach(x=>x.onclick=()=>show(x.dataset.tab));show(ttab);mountPreview(v,"hero");
 $("#thReset").onclick=async()=>{if(!guard(t))return;if(await confirmBox("استعادة الهوية الافتراضية؟","تعود كل إعدادات الثيم لقيم تيتان باك الأصلية في المسودة.","استعادة"))if(edit(w=>w.theme=clone(TPCMS.THEME_DEF),t))show(ttab)};
}};

/* ====================================================== NAVIGATION & FOOTER */
const TARGETS=()=>[...S.work.sections.filter(s=>s.visible!==false).map(s=>["#"+s.id,secLabel(s.id)]),["#top","أعلى الصفحة"]];
PAGES.navigation={title:"القائمة والتذييل",lang:true,render(v){
 v.innerHTML=`${ph("NAVIGATION","القائمة والتذييل","روابط القائمة العلوية وزرها، وأعمدة التذييل ونصوصه. الترتيب والروابط مشتركة بين اللغتين، والتسميات لكل لغة.")}${roBar()}
 <div class="g2"><section class="card"><div class="card-h"><h3>القائمة العلوية</h3>${langNote()}<div class="r"><button class="btn btn-ghost btn-sm" type="button" id="navAdd">${ic("plus",14)} رابط</button></div></div><div class="rows" id="navRows"></div><hr class="crease" style="margin:14px 0"><div id="navCta">${fld("زر القائمة (CTA)",inp("content.{L}.ctaNav",{mark:"nav"}))}</div></section>
 <section class="card"><div class="card-h"><h3>التذييل</h3>${langNote()}</div><div class="form"><div id="ftTop">${fld("نبذة التذييل",area("content.{L}.footer.about",{rows:2,mark:"footer"}))}</div><div id="ftCols" class="form"></div><div class="f2" id="ftBot">${fld("حقوق النشر",inp("content.{L}.footer.rights",{mark:"footer"}))}${fld("السطر الأخير",inp("content.{L}.footer.made",{mark:"footer"}))}</div></div></section></div>
 <section class="card"><div class="card-h"><h3>معاينة الشريط العلوي</h3></div><div id="navPrev" style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;padding:12px 16px;border:1px solid var(--line);border-radius:12px;background:var(--bg)"></div></section>`;
 const opt=(sel)=>TARGETS().map(([h,t])=>`<option value="${h}" ${h===sel?"selected":""}>${esc(t)}</option>`).join("")+(TARGETS().some(x=>x[0]===sel)?"":`<option value="${esc(sel)}" selected>${esc(sel)}</option>`);
 const prev=()=>{const c=C();$("#navPrev").innerHTML=`<img src="${$("#logoL").src}" alt="" width="30" height="30"><b style="font-family:var(--f-display)">${esc(c.brand)}</b>${c.nav.map(n=>`<span class="muted" style="font-size:.86rem">${esc(n[1])}</span>`).join("")}<span class="btn btn-accent btn-sm" style="margin-inline-start:auto">${esc(c.ctaNav)}</span>`};
 const draw=()=>{
  $("#navRows").innerHTML=C().nav.map((n,i)=>`<div class="row" data-idx="${i}"><span class="grip">${ic("grip",16)}</span><span class="t" style="display:grid;grid-template-columns:1fr 1fr;gap:6px">${inp(`content.{L}.nav.${i}.1`,{mark:"nav",attrs:' class="inp" aria-label="التسمية"'})}<select class="inp" data-href="${i}" aria-label="الوجهة">${opt(n[0])}</select></span><button class="icon-btn sm" type="button" data-del="${i}" aria-label="حذف">${ic("trash",14)}</button></div>`).join("");
  bind($("#navRows"));
  $$("[data-href]").forEach(s=>s.onchange=()=>{const i=+s.dataset.href;if(edit(w=>{w.content.ar.nav[i][0]=w.content.en.nav[i][0]=s.value})){mark("nav");prev()}});
  $$("#navRows [data-del]").forEach(b=>b.onclick=()=>{const i=+b.dataset.del;if(edit(w=>{w.content.ar.nav.splice(i,1);w.content.en.nav.splice(i,1)})){mark("nav","تعديل القائمة");draw()}});
  sortable($("#navRows"),".row",(f,t)=>{if(edit(w=>{move(w.content.ar.nav,f,t);move(w.content.en.nav,f,t)})){mark("nav","إعادة ترتيب القائمة");draw()}});
  $("#ftCols").innerHTML=C().footer.cols.map((col,ci)=>`<div class="card" style="padding:12px;display:grid;gap:8px"><div style="display:flex;gap:8px;align-items:center"><span class="mono muted">COL 0${ci+1}</span>${inp(`content.{L}.footer.cols.${ci}.0`,{mark:"footer",attrs:' class="inp" aria-label="عنوان العمود"'})}</div>${col[1].map((l,li)=>`<div style="display:grid;grid-template-columns:1fr 1fr auto;gap:6px">${inp(`content.{L}.footer.cols.${ci}.1.${li}.1`,{mark:"footer",attrs:' class="inp" aria-label="التسمية"'})}${inp(`content.{L}.footer.cols.${ci}.1.${li}.0`,{ltr:1,mark:"footer",sync:`content.{O}.footer.cols.${ci}.1.${li}.0`,attrs:' class="inp" aria-label="الرابط"'})}<button class="icon-btn sm" type="button" data-fdel="${ci}.${li}" aria-label="حذف">${ic("x",14)}</button></div>`).join("")}<button class="btn btn-quiet btn-sm" type="button" data-fadd="${ci}" style="justify-self:start">${ic("plus",14)} رابط</button></div>`).join("");
  bind($("#ftCols"));
  $$("[data-fdel]").forEach(b=>b.onclick=()=>{const [ci,li]=b.dataset.fdel.split(".").map(Number);if(edit(w=>{for(const l of ["ar","en"])w.content[l].footer.cols[ci][1].splice(li,1)})){mark("footer","تعديل التذييل");draw()}});
  $$("[data-fadd]").forEach(b=>b.onclick=()=>{const ci=+b.dataset.fadd;if(edit(w=>{w.content.ar.footer.cols[ci][1].push(["#","رابط جديد"]);w.content.en.footer.cols[ci][1].push(["#","New link"])})){mark("footer","إضافة رابط للتذييل");draw()}});
  prev();
 };
 draw(); bind($("#ftTop")); bind($("#ftBot")); bind($("#navCta"));
 v.addEventListener("bound",prev);
 $("#navAdd").onclick=()=>{if(edit(w=>{w.content.ar.nav.push(["#contact","رابط جديد"]);w.content.en.nav.push(["#contact","New link"])})){mark("nav","إضافة رابط للقائمة");draw();$$("#navRows input").pop().select()}};
}};

/* ====================================================== SEO */
PAGES.seo={title:"SEO",lang:true,render(v){
 const P=S.work,s=P.seo;
 v.innerHTML=`${ph("SEO","تحسين الظهور في محركات البحث","العنوان والوصف لكل لغة، صورة المشاركة، الرابط الأساسي، الفهرسة، خريطة الموقع والبيانات المنظمة.")}${roBar()}
 <div class="g2"><section class="card"><div class="card-h"><h3>البحث</h3>${langNote()}</div><div class="form">${fld("عنوان الموقع (Meta Title)",inp("seo.{L}.title",{max:60}),{count:1,hint:"50–60 حرفاً هو الأنسب."})}${fld("الوصف (Meta Description)",area("seo.{L}.desc",{max:160,rows:3}),{count:1,hint:"120–160 حرفاً."})}<div class="serp" id="serp"></div></div></section>
 <section class="card"><div class="card-h"><h3>المشاركة (Open Graph)</h3></div><div class="form">${fld("صورة المشاركة",pickHTML("seo.og"),{hint:"1200 × 630 px مثالية."})}<div class="og" id="og"></div></div></section></div>
 <div class="g2"><section class="card"><div class="card-h"><h3>الإعدادات التقنية</h3></div><div class="form">${fld("الرابط الأساسي (Canonical)",inp("seo.canonical",{ltr:1}))}${tgl("السماح بالفهرسة (index)","seo.index")}${tgl("تتبّع الروابط (follow)","seo.follow")}${tgl("توليد خريطة الموقع sitemap.xml","seo.sitemap")}<div class="fld"><span class="lbl">robots meta</span><code class="badge" id="robots"></code></div></div></section>
 <section class="card"><div class="card-h"><h3>ملفات مولّدة</h3><div class="r"><div class="seg" role="group" id="genSeg"><button type="button" data-g="sitemap" aria-pressed="true">sitemap.xml</button><button type="button" data-g="ld" aria-pressed="false">JSON-LD</button></div></div></div><pre class="code" id="gen"></pre></section></div>`;
 let g="sitemap";
 const paint=()=>{const st=S.work.seo,L_=st[S.lang],base=st.canonical.replace(/\/$/,""),og=TPCMS.mediaUrl(st.og);
  $("#serp").innerHTML=`<div class="u">${esc(base.replace(/^https?:\/\//,""))}${S.lang==="en"?" › en":""}</div><div class="t">${esc(L_.title)}</div><div class="d">${esc(L_.desc)}</div>`;
  $("#og").innerHTML=`<div class="im">${og?`<img src="${og}" alt="">`:`<img src="${$("#logoD").src}" alt="" style="width:72px;height:72px;object-fit:contain">`}</div><div class="tx"><span>${esc(base.replace(/^https?:\/\//,""))}</span><b>${esc(L_.title)}</b></div>`;
  $("#robots").textContent=`${st.index?"index":"noindex"}, ${st.follow?"follow":"nofollow"}`;
  const urls=["/","/en/",...S.work.projects.filter(p=>p.status==="published").map(p=>`/work/${p.slug}`)];
  $("#gen").textContent=g==="sitemap"?(st.sitemap?`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u=>`  <url><loc>${base}${u}</loc></url>`).join("\n")}\n</urlset>`:"<!-- sitemap disabled -->"):JSON.stringify({"@context":"https://schema.org","@type":"Organization",name:S.work.content.en.brand,alternateName:S.work.content.ar.brand,url:base+"/",description:S.work.seo.en.desc,knowsAbout:S.work.content.en.services.items.map(x=>x[1])},null,2)};
 bind(v);bindPicks(v,paint);paint();v.addEventListener("bound",paint);v.addEventListener("change",paint);
 $$("#genSeg button").forEach(b=>b.onclick=()=>{g=b.dataset.g;$$("#genSeg button").forEach(x=>x.setAttribute("aria-pressed",x===b));paint()});
}};

/* ====================================================== FORMS (inbox) */
const LSTAT={new:["جديد","acc"],progress:["قيد المتابعة","warn"],done:["مكتمل","ok"],spam:["مزعج","err"]};
const lf={s:"all"};
PAGES.forms={title:"النماذج",render(v){
 v.innerHTML=`${ph("FORMS","النماذج والطلبات","طلبات «لنبدأ مشروعك» الواردة من الموقع مع المرفقات، وإعدادات النموذج.")}
 <div class="split"><section class="card flush"><div class="card-h" style="padding:14px 16px 0"><div class="chips" id="lfs"></div></div><div class="tscroll"><table class="tbl"><thead><tr><th>العميل</th><th>نوع المشروع</th><th>الميزانية</th><th>الحالة</th><th>التاريخ</th></tr></thead><tbody id="lBody"></tbody></table></div></section>
 <fieldset class="pg" ${ro()||(!can("settings")?"disabled":"")}><section class="card"><div class="card-h"><h3>إعدادات النموذج</h3></div><div class="form">${fld("إرسال الإشعارات إلى",inp("settings.notify",{ltr:1,type:"email",attrs:' data-cap="settings"'}))}<div class="f2">${fld("حجم الملف الأقصى (MB)",`<input type="number" min="1" max="100" data-k="settings.maxMB" data-t="num" data-cap="settings">`)}${fld("عدد الملفات الأقصى",`<input type="number" min="1" max="20" data-k="settings.maxFiles" data-t="num" data-cap="settings">`)}</div><div class="fld"><span class="lbl">الأنواع المسموحة</span><div class="checks">${["PDF","AI","PSD","ZIP","JPG","PNG","WEBP"].map(x=>`<span class="badge">${x}</span>`).join("")}</div></div><p class="note"><b>الحماية:</b> تحقق من الحقول في المتصفح والخادم، فحص نوع الملف الفعلي، حد للحجم، حقل مخفي ضد البوتات، وحد لعدد الطلبات لكل عنوان IP.</p></div></section></fieldset></div>`;
 bind(v);
 const draw=()=>{const L=leads();
  $("#lfs").innerHTML=[["all","الكل"],...Object.entries(LSTAT).map(([k,x])=>[k,x[0]])].map(([k,t])=>`<button class="chipb" type="button" data-s="${k}" aria-pressed="${lf.s===k}">${t}<sup>${k==="all"?L.length:L.filter(l=>l.status===k).length}</sup></button>`).join("");
  $$("#lfs button").forEach(b=>b.onclick=()=>{lf.s=b.dataset.s;draw()});
  const list=L.filter(l=>lf.s==="all"||l.status===lf.s);
  $("#lBody").innerHTML=list.map(l=>`<tr class="click" data-id="${l.id}"><td><b>${esc(l.name)}</b>${l.demo?` <span class="badge">تجريبي</span>`:""}<div class="muted" style="font-size:.76rem">${esc(l.company||"")}</div></td><td>${esc(l.type||"—")}</td><td class="muted">${esc(l.budget||"—")}</td><td><span class="badge ${LSTAT[l.status][1]}"><i></i>${LSTAT[l.status][0]}</span></td><td class="muted" style="white-space:nowrap">${rel(l.at)}</td></tr>`).join("")||`<tr><td colspan="5"><div class="empty">لا توجد طلبات</div></td></tr>`;
  $$("#lBody tr[data-id]").forEach(r=>r.onclick=()=>openLead(r.dataset.id));
 };
 const openLead=id=>{if(can("edit")){const a=leads(),x=a.find(y=>y.id===id);if(x&&x.status==="new"){x.status="progress";TPCMS.put(K.leads,a);draw();paintSide()}}
  const l=leads().find(x=>x.id===id);if(!l)return;
  drawer(l.name,`<div style="display:flex;gap:8px;flex-wrap:wrap"><span class="badge ${LSTAT[l.status][1]}"><i></i>${LSTAT[l.status][0]}</span><span class="badge">${fmtDate(l.at)}</span>${l.lang?`<span class="badge">${l.lang.toUpperCase()}</span>`:""}</div>
   <table class="tbl"><tbody>${[["الشركة",l.company],["البريد",l.email],["الهاتف",l.phone],["نوع المشروع",l.type],["الميزانية",l.budget]].map(([a,b])=>`<tr><td class="muted">${a}</td><td ${/@|\+/.test(b||"")?'dir="ltr" style="text-align:end"':""}>${esc(b||"—")}</td></tr>`).join("")}</tbody></table>
   <div class="fld"><span class="lbl">تفاصيل المشروع</span><p class="note" style="color:var(--ink);white-space:pre-wrap">${esc(l.msg||"")}</p></div>
   <div class="fld"><span class="lbl">المرفقات (${(l.files||[]).length})</span>${(l.files||[]).map(f=>`<div class="row">${ic("doc",18)}<span class="t"><b class="ltr">${esc(f.name)}</b><span>${fmtBytes(f.size)}</span></span>${f.path?`<button class="btn btn-ghost btn-sm" type="button" data-path="${esc(f.path)}">${ic("ext",14)} فتح</button>`:""}</div>`).join("")||`<span class="muted" style="font-size:.84rem">بدون مرفقات</span>`}</div>
   ${fld("الحالة",`<select id="lSt">${Object.entries(LSTAT).map(([k,x])=>`<option value="${k}" ${l.status===k?"selected":""}>${x[0]}</option>`).join("")}</select>`)}`,
   d=>{$$("[data-path]",d).forEach(b=>b.onclick=async()=>{const c=await TPCMS.client(),{data,error}=await c.storage.from("lead-files").createSignedUrl(b.dataset.path,300);if(error)return toast("تعذّر فتح الملف","err");window.open(data.signedUrl,"_blank","noopener")});
    $("#lSt",d).onchange=e=>{if(!guard("edit"))return;const a=leads();a.find(x=>x.id===id).status=e.target.value;TPCMS.put(K.leads,a);draw();paintSide();toast("حُدّثت حالة الطلب")};
    $("#lDel",d).onclick=async()=>{if(!guard("delete"))return;if(await confirmBox("حذف الطلب؟","سيُحذف الطلب ومرفقاته نهائياً.","حذف",true)){TPCMS.put(K.leads,leads().filter(x=>x.id!==id));closeDrawer();draw();paintSide()}}},
   `${l.email?`<a class="btn btn-primary btn-sm" href="mailto:${esc(l.email)}?subject=${encodeURIComponent("Titan Pack — "+(l.type||""))}">${ic("mail",14)} رد بالبريد</a>`:""}${l.phone?`<a class="btn btn-ghost btn-sm" href="https://wa.me/${esc(l.phone.replace(/\D/g,""))}" target="_blank" rel="noopener">${ic("wa",14)} واتساب</a>`:""}<button class="btn btn-danger btn-sm" type="button" id="lDel" style="margin-inline-start:auto">${ic("trash",14)}</button>`);
 };
 draw();
}};

/* ====================================================== USERS */
PAGES.users={title:"المستخدمون",render(v){
 const U=()=>TPCMS.get(K.users)||[];
 v.innerHTML=`${ph("USERS & ROLES","المستخدمون والصلاحيات","أربعة أدوار: المالك، المدير، المحرر، المشاهد. الصلاحيات تُفرض في الخادم (API)؛ الواجهة تعكسها فقط.",`<button class="btn btn-primary" type="button" id="uInv">${ic("plus",16)} دعوة مستخدم</button>`)}
 ${!can("users")?`<div class="readonly-bar">${ic("lock",16)} إدارة المستخدمين متاحة للمالك فقط.</div>`:""}
 <section class="card flush"><div class="tscroll"><table class="tbl"><thead><tr><th>المستخدم</th><th>الدور</th><th>آخر نشاط</th><th>الحالة</th></tr></thead><tbody id="uBody"></tbody></table></div></section>
 <section class="card"><div class="card-h"><h3>مصفوفة الصلاحيات</h3></div><div class="tscroll"><table class="tbl perm"><thead><tr><th>الصلاحية</th>${Object.values(ROLES).map(r=>`<th>${r.t}</th>`).join("")}</tr></thead><tbody>${Object.values(CAPS).map(c=>`<tr><td>${c.t}</td>${Object.keys(ROLES).map(r=>`<td class="${c.r.includes(r)?"y":"n"}">${c.r.includes(r)?"✓":"—"}</td>`).join("")}</tr>`).join("")}<tr><td>عرض لوحة التحكم</td>${Object.keys(ROLES).map(()=>`<td class="y">✓</td>`).join("")}</tr></tbody></table></div></section>`;
 const draw=()=>{$("#uBody").innerHTML=U().map(u=>`<tr><td><div style="display:flex;gap:10px;align-items:center"><span class="av" style="width:34px;height:34px;border-radius:50%;background:var(--surface-2);display:grid;place-items:center;font-weight:700;color:var(--primary-ink)">${esc(u.name.trim()[0])}</span><div><b>${esc(u.name)}</b>${u.email===S.user.email?` <span class="badge acc">أنت</span>`:""}<div class="muted ltr" style="font-size:.76rem;text-align:start">${esc(u.email)}</div></div></div></td><td><select class="inp" data-u="${u.id}" style="width:auto" ${!can("users")||u.role==="owner"&&U().filter(x=>x.role==="owner").length<2?"disabled":""}>${Object.entries(ROLES).map(([k,r])=>`<option value="${k}" ${u.role===k?"selected":""}>${r.t}</option>`).join("")}</select></td><td class="muted">${u.pending?"دعوة معلّقة":rel(u.at)}</td><td>${u.pending?`<span class="badge warn"><i></i>مدعو</span>`:u.active?`<span class="badge ok"><i></i>نشط</span>`:`<span class="badge"><i></i>غير نشط</span>`}</td></tr>`).join("");
  $$("[data-u]").forEach(s=>s.onchange=()=>{const a=U();a.find(x=>x.id===s.dataset.u).role=s.value;TPCMS.put(K.users,a);mark(null,"تغيير دور مستخدم");toast("حُدّث الدور")})};
 draw();
 $("#uInv").onclick=async()=>{if(!guard("users"))return;const r=await modal({title:"دعوة مستخدم",body:`<div class="form">${fld("الاسم",`<input id="iN">`)}${fld("البريد الإلكتروني",`<input id="iE" type="email" dir="ltr">`)}${fld("الدور",`<select id="iR">${Object.entries(ROLES).filter(([k])=>k!=="owner").map(([k,x])=>`<option value="${k}">${x.t} — ${x.d}</option>`).join("")}</select>`)}</div>`,actions:[{label:"إلغاء",value:null,cls:"btn-quiet"},{label:"إرسال الدعوة",value:1,cls:"btn-accent",validate:()=>/^\S+@\S+\.\S+$/.test($("#iE").value)&&$("#iN").value.trim()||(toast("أدخل اسماً وبريداً صحيحاً","err"),false)}],read:()=>({name:$("#iN").value.trim(),email:$("#iE").value.trim(),role:$("#iR").value})});
  if(r){const a=U();a.push({id:uid("u"),...r.read,at:Date.now(),pending:true});TPCMS.put(K.users,a);mark(null,`دعوة ${r.read.name}`);draw();toast("أُرسلت الدعوة (محاكاة)","ok")}};
}};

/* ====================================================== SETTINGS */
PAGES.settings={title:"الإعدادات",lang:true,render(v){
 const ci=C().contact.info;
 v.innerHTML=`${ph("SETTINGS","الإعدادات العامة","اسم العلامة، اللغات، بيانات التواصل التي تظهر في الموقع، والنسخ الاحتياطي.")}${!can("settings")?`<div class="readonly-bar">${ic("lock",16)} الإعدادات متاحة للمالك فقط.</div>`:""}
 <fieldset class="pg" ${!can("settings")?"disabled":""}><div class="g2"><section class="card"><div class="card-h"><h3>العلامة واللغات</h3></div><div class="form"><div class="f2">${fld("الاسم بالعربية",inp("content.ar.brand",{attrs:' data-cap="settings"'}))}${fld("Name in English",inp("content.en.brand",{attrs:' data-cap="settings"'}))}</div>${fld("اللغة الافتراضية",`<select data-k="settings.defaultLang" data-cap="settings"><option value="ar">العربية (RTL)</option><option value="en">English (LTR)</option></select>`)}${tgl("تفعيل النسخة الإنجليزية","settings.en",{cap:"settings"})}</div></section>
 <section class="card"><div class="card-h"><h3>بيانات التواصل</h3>${langNote()}</div><div class="form">${ci.map((r,i)=>fld(r[0],inp(`content.{L}.contact.info.${i}.1`,{attrs:' data-cap="settings"',ltr:i<2?1:0,sync:i<2?`content.{O}.contact.info.${i}.1`:""}))).join("")}<p class="note">البريد وواتساب مشتركان بين اللغتين؛ الموقع والساعات تُكتب لكل لغة.</p></div></section></div>
 <div class="g2" style="margin-top:20px"><section class="card"><div class="card-h"><h3>نسخة احتياطية</h3></div><p class="muted" style="font-size:.86rem;margin-bottom:12px">صدّر المسودة الحالية كملف JSON أو استورد نسخة سابقة (تُحمَّل كمسودة ولا تُنشر تلقائياً).</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-ghost" type="button" id="exp">${ic("upload",16)} تصدير JSON</button><label class="btn btn-ghost" style="cursor:pointer">${ic("doc",16)} استيراد<input type="file" id="imp" accept=".json,application/json" hidden></label></div></section>
 <section class="card" style="border-color:color-mix(in srgb,var(--error) 40%,transparent)"><div class="card-h"><h3 style="color:var(--error)">منطقة الخطر</h3></div><p class="muted" style="font-size:.86rem;margin-bottom:12px">${TPCMS.remote?"يمسح النسخة المؤقتة من البيانات في هذا المتصفح (بما فيها التعديلات غير المحفوظة). المحتوى على الخادم لا يتأثر.":"إعادة ضبط بيانات النموذج في هذا المتصفح: المسودات والإصدارات والوسائط والطلبات."}</p><button class="btn btn-danger" type="button" id="wipe">${ic("trash",16)} ${TPCMS.remote?"مسح البيانات المحلية":"إعادة ضبط النموذج"}</button></section></div></fieldset>`;
 bind(v);
 $("#exp").onclick=()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(S.work,null,1)],{type:"application/json"}));a.download=`titan-pack-draft-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1e3)};
 $("#imp").onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const p=JSON.parse(await f.text());if(!p.content||!p.projects||!p.sections)throw 0;if(edit(w=>{},"settings")){S.work=migrate(p);TPCMS.put(K.work,S.work);toast("استُورد الملف كمسودة غير محفوظة","ok");render()}}catch(x){toast("ملف غير صالح","err")}};
 $("#wipe").onclick=async()=>{if(!guard("settings"))return;if(await confirmBox("إعادة ضبط النموذج؟","يحذف كل بيانات لوحة التحكم المحفوظة في هذا المتصفح ويعيد المحتوى الأصلي. لا يمكن التراجع.","إعادة الضبط",true)){Object.values(K).concat(["tp-cms-meta","tp-cms-folders","tp-theme","tp-bg"]).forEach(k=>{try{localStorage.removeItem(k)}catch(e){}});location.reload()}};
}};

/* ====================================================== VERSIONS */
PAGES.versions={title:"الإصدارات",render(v){
 const vs=TPCMS.get(K.versions)||[],lv=META().liveV;
 v.innerHTML=`${ph("VERSION HISTORY","سجل الإصدارات","كل نشر يحفظ نسخة كاملة من الموقع. عاين أي إصدار، قارنه بالمسودة الحالية، أو استعده كمسودة.")}
 <section class="card" id="pubCard">${pubCardHTML()}</section>
 <section class="card"><div class="vers">${vs.map(x=>`<div class="ver${x.v===lv?" live":""}"><span class="vn">v${x.v}</span><div><b>${esc(x.note)}</b> ${x.v===lv?`<span class="badge ok"><i></i>المنشور الآن</span>`:""}<div class="muted" style="font-size:.8rem">${fmtDate(x.at)} · ${esc(x.by)} · ${ROLES[x.role]?ROLES[x.role].t:""}</div><div class="chg">${x.changes.slice(0,6).map(c=>`<span class="badge">${esc(c)}</span>`).join("")}${x.changes.length>6?`<span class="badge">+${x.changes.length-6}</span>`:""}</div></div>
  <div class="acts"><a class="btn btn-ghost btn-sm" href="index.html?preview=v${x.v}" target="_blank" rel="noopener">${ic("eye",14)} معاينة</a><button class="btn btn-ghost btn-sm" type="button" data-cmp="${x.v}">مقارنة</button><button class="btn btn-primary btn-sm" type="button" data-rst="${x.v}" ${x.v===lv&&status()==="live"?"disabled":""}>${ic("history",14)} استعادة</button></div></div>`).join("")||`<div class="empty">لا توجد إصدارات بعد</div>`}</div></section>`;
 bindPub(v);
 $$("[data-rst]",v).forEach(b=>b.onclick=()=>restoreVersion(+b.dataset.rst));
 $$("[data-cmp]",v).forEach(b=>b.onclick=()=>{const x=vs.find(y=>y.v===+b.dataset.cmp),ch=diff(x.snapshot||BASE,S.work);modal({title:`v${x.v} مقابل المسودة الحالية`,body:ch.length?`<p class="muted">ما تغيّر في المسودة الحالية منذ هذا الإصدار:</p><ul class="changes" style="max-height:none">${ch.map(c=>`<li><span class="mono">${esc(c.k)}</span>${esc(c.t)}</li>`).join("")}</ul>`:`<p>المسودة الحالية مطابقة لهذا الإصدار.</p>`})});
}};

/* ====================================================== shell: sidebar, top bar, router, login */
function paintSide(){
 const nl=newLeads();
 $("#side").innerHTML=`<a class="brand" href="#/overview"><img src="${$("#logoD").src}" alt="" width="36" height="36"><span><b>${esc(S.work.content.ar.brand)}</b><small>DASHBOARD</small></span></a>
 ${NAV.map(([g,items])=>`<div class="grp">${g}</div>${items.map(([id,t,i])=>`<a class="nv${(id==="users"&&!can("users"))||(id==="settings"&&!can("settings"))?" locked":""}" href="#/${id}" ${S.route===id?'aria-current="page"':""}>${ic(i)}<span>${t}</span>${id==="forms"&&nl?`<span class="cnt">${nl}</span>`:""}${id==="versions"&&status()!=="live"?`<span class="cnt" title="تغييرات غير منشورة">●</span>`:""}</a>`).join("")}`).join("")}
 <div class="me"><span class="av">${esc(S.user.name.trim()[0])}</span><div style="min-width:0"><b>${esc(S.user.name)}</b><span>${ROLES[S.user.role].t}</span></div><button type="button" id="roleBtn" title="تبديل الدور للتجربة" aria-label="تبديل الدور">${ic("shield",16)}</button><button type="button" id="outBtn" title="تسجيل الخروج" aria-label="تسجيل الخروج">${ic("out",16)}</button></div>`;
 $$("#side a").forEach(a=>a.addEventListener("click",()=>closeSide()));
 $("#outBtn").onclick=()=>{TPCMS.put(K.session,null);location.hash="";location.reload()};
 $("#roleBtn").onclick=async()=>{const r=await modal({title:"تبديل الدور (للتجربة)",body:`<p class="muted">جرّب كيف تتغير اللوحة حسب الصلاحيات. في المنصة الحقيقية يحدد الخادم دور كل حساب.</p><div class="roles">${Object.entries(ROLES).map(([k,x])=>`<label><input type="radio" name="rr" value="${k}" ${S.user.role===k?"checked":""}><span><b>${x.t}</b><small>${x.d}</small></span></label>`).join("")}</div>`,actions:[{label:"إلغاء",value:null,cls:"btn-quiet"},{label:"تبديل",value:1,cls:"btn-accent"}],read:()=>($("input[name=rr]:checked")||{}).value});
  if(r&&r.read){S.user.role=r.read;TPCMS.put(K.session,S.user);toast(`أنت الآن: ${ROLES[r.read].t}`);render()}};
}
function paintTop(){
 const pg=PAGES[S.route],st=status();
 $("#topbar").innerHTML=`<button class="icon-btn menu-btn" type="button" id="menuBtn" aria-label="القائمة">${ic("menu")}</button><div class="ttl"><small>تيتان باك · لوحة التحكم</small><h1>${esc(S.route==="projects"&&S.args[0]&&S.args[0]!=="new"?S.title||pg.title:pg.title)}</h1></div>
 <div class="tools">${pg.lang?`<div class="seg" role="group" aria-label="لغة المحتوى"><button type="button" data-lang="ar" aria-pressed="${S.lang==="ar"}">AR</button><button type="button" data-lang="en" aria-pressed="${S.lang==="en"}">EN</button></div>`:""}
 <button class="status ${st}" type="button" id="stChip" title="${STATUS[st][1]}"><i></i><span class="hide-sm">${STATUS[st][0]}</span></button>
 <button class="btn btn-ghost btn-sm hide-sm" type="button" id="tDraft" ${st!=="unsaved"||!can("edit")?"disabled":""}>حفظ مسودة</button>
 <button class="btn btn-ghost btn-sm" type="button" id="tPrev">${ic("eye",15)}<span class="hide-sm">معاينة</span></button>
 <button class="btn btn-accent btn-sm" type="button" id="tPub" ${st==="live"||!can("publish")?"disabled":""} title="${can("publish")?"":"النشر للمالك والمدير"}">نشر</button>
 <button class="icon-btn" type="button" id="aiBtn" title="المساعد الذكي" aria-label="المساعد الذكي" style="color:var(--accent-ink)">${ic("spark")}</button>
 <button class="icon-btn" type="button" id="thBtn" title="المظهر" aria-label="تبديل المظهر">${ic(document.documentElement.dataset.theme==="dark"?"sun":"moon")}</button></div>`;
 $("#menuBtn").onclick=()=>{$("#side").classList.add("open");$("#sideScrim").hidden=false};
 $$("[data-lang]").forEach(b=>b.onclick=()=>{S.lang=UI.lang=b.dataset.lang;saveUI();render()});
 $("#stChip").onclick=()=>location.hash="#/overview";
 $("#tDraft").onclick=()=>{saveDraft();paintStatus()};
 $("#tPrev").onclick=openPreview; $("#tPub").onclick=publish; $("#aiBtn").onclick=openAI;
 $("#thBtn").onclick=()=>{const dark=matchMedia("(prefers-color-scheme: dark)").matches,cur=document.documentElement.dataset.theme||(dark?"dark":"light"),nx=cur==="dark"?"light":"dark";document.documentElement.dataset.theme=nx;UI.theme=nx;saveUI();paintTop()};
}
function closeSide(){$("#side").classList.remove("open");$("#sideScrim").hidden=true}
$("#sideScrim").onclick=closeSide;
/* status changes touch only the chrome and the publish card — never the page being edited */
const paintStatus=debounce(()=>{if(!S.user)return;paintTop();const c=$("#pubCard");if(c&&document.activeElement&&!c.contains(document.activeElement)){c.innerHTML=pubCardHTML();bindPub(c)}const nv=$('#side a[href="#/versions"]');if(nv){const has=$(".cnt",nv);if(status()!=="live"&&!has)nv.insertAdjacentHTML("beforeend",`<span class="cnt" title="تغييرات غير منشورة">●</span>`);else if(status()==="live"&&has)has.remove()}},60);
function render(){
 if(!S.user)return;
 const [id,...args]=(location.hash.replace(/^#\/?/,"")||"overview").split("/");
 S.route=PAGES[id]?id:"overview";S.args=args.map(decodeURIComponent);S.title="";
 closeDrawer();closeModal();paintSide();
 const v=$("#view");v.replaceWith(v.cloneNode(false));const nv=$("#view");
 PAGES[S.route].render(nv,S.args);paintTop();
 nv.focus({preventScroll:true});window.scrollTo(0,0);
 document.title=`${PAGES[S.route].title} — لوحة تحكم تيتان باك`;
}
addEventListener("hashchange",render);
/* other tabs (e.g. the site's contact form) write leads; keep the badge fresh */
addEventListener("storage",e=>{if(!S.user)return;if(e.key===K.leads){paintSide();if(S.route==="forms"||S.route==="overview")render()}});

function loginView(){
 const l=$("#login");l.hidden=false;$("#app").hidden=true;
 l.innerHTML=`<div class="login-art"><a class="brand" href="index.html" style="display:flex;gap:12px;align-items:center;text-decoration:none;color:inherit"><img src="${$("#logoD").src}" alt="" width="44" height="44"><span><b style="font-family:var(--f-display);font-size:1.1rem;display:block">تيتان باك</b><small class="mono" style="opacity:.6">CONTROL CENTER</small></span></a>
  <div style="position:relative;z-index:1"><div class="eyebrow mono" style="color:var(--accent)">VISUAL CONTROL CENTER</div><h1>أدِر موقعك كاملاً <em>دون أن تفتح الكود.</em></h1><p style="opacity:.75;max-width:44ch;margin-top:14px">المحتوى، المشاريع، الهوية، الوسائط والنشر — مع مسودة ومعاينة وسجل إصدارات.</p></div>
  <svg class="die" viewBox="0 0 400 380" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M44 120V244L68 254H356V110H68Z M116 110V62L130 40H198L212 62V110 M260 254V302L274 324H342L356 302V254" stroke-opacity=".55"/><path d="M68 110V254M116 110V254M212 110V254M260 110V254M116 62H212" stroke="#EF974F" stroke-dasharray="7 6"/></svg></div>
  <div class="login-form"><form id="lf" novalidate><div><div class="eyebrow mono">SIGN IN</div><h2>تسجيل الدخول</h2><p class="muted" style="font-size:.86rem;margin-top:4px">نموذج تفاعلي: أي كلمة مرور تعمل. اختر الدور لتجربة الصلاحيات.</p></div>
  <div class="fld"><label for="lN">الاسم</label><input id="lN" value="${esc((TPCMS.get(K.users)||[])[0]?.name||"")}" autocomplete="name" required></div>
  <div class="fld"><label for="lE">البريد الإلكتروني</label><input id="lE" type="email" dir="ltr" value="owner@titanpack.com" autocomplete="email" required></div>
  <div class="fld"><label for="lP">كلمة المرور</label><input id="lP" type="password" dir="ltr" value="titanpack" autocomplete="current-password" required></div>
  <div class="fld"><span class="lbl">الدور</span><div class="roles">${Object.entries(ROLES).map(([k,x],i)=>`<label><input type="radio" name="role" value="${k}" ${i===0?"checked":""}><span><b>${x.t}</b><small>${x.d}</small></span></label>`).join("")}</div></div>
  <button class="btn btn-accent" type="submit" style="justify-content:center;padding:.8em">دخول ${ic("arrow",16)}</button><p class="muted" style="font-size:.72rem;text-align:center">في المنصة: تسجيل دخول آمن، جلسات مشفرة وحد لمحاولات الدخول.</p></form></div>`;
 $("#lf").onsubmit=e=>{e.preventDefault();const n=$("#lN").value.trim(),em=$("#lE").value.trim();if(!n||!/^\S+@\S+\.\S+$/.test(em)||!$("#lP").value){toast("أكمل الاسم والبريد وكلمة المرور","err");return}
  S.user={name:n,email:em,role:$("input[name=role]:checked").value};TPCMS.put(K.session,S.user);mark("login",`تسجيل دخول (${ROLES[S.user.role].t})`);boot()};
}
function boot(){
 initStores();
 S.user=TPCMS.get(K.session);
 if(!S.user)return loginView();
 S.work=migrate(TPCMS.get(K.work)||TPCMS.get(K.draft)||TPCMS.get(K.live)||clone(BASE));
 refreshSnap(); $("#login").hidden=true; $("#app").hidden=false; render();
}
