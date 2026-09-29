/* Titan Pack dashboard — core: state, roles, draft → preview → publish, versions, media ingest and UI primitives.
   Pages register themselves in PAGES (pages.js); the assistant lives in assistant.js. */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=tpEsc, K=TPCMS.K, BASE=TPCMS.BASE, clone=TPCMS.clone, J=o=>JSON.stringify(o);
const uid=p=>p+Date.now().toString(36).slice(-4)+Math.random().toString(36).slice(2,6);
const debounce=(f,ms)=>{let t;const d=(...a)=>{clearTimeout(t);t=setTimeout(()=>f(...a),ms)};d.flush=(...a)=>{clearTimeout(t);f(...a)};return d};
const UI=Object.assign({theme:"auto",lang:"ar",device:"desktop"},TPCMS.get("tp-admin-ui")||{});
const saveUI=()=>TPCMS.put("tp-admin-ui",UI);

/* ---------- icons (24px line, same stroke as the site) ---------- */
const IC={
 grid:'<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
 page:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
 layers:'<path d="M12 3 2 8l10 5 10-5z"/><path d="m2 13 10 5 10-5"/>',
 folder:'<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
 users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6 6 0 0 1 3.5 5.5"/>',
 quote:'<path d="M7 7h4v4c0 3-1.5 5-4 6M15 7h4v4c0 3-1.5 5-4 6"/>',
 image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
 palette:'<path d="M12 3a9 9 0 1 0 0 18c1 0 1.6-.8 1.6-1.6 0-.5-.2-.8-.5-1.2-.3-.3-.5-.7-.5-1.1 0-.9.7-1.6 1.6-1.6H16a5 5 0 0 0 5-5c0-4.1-4-7.5-9-7.5z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10.5" cy="7.5" r="1"/><circle cx="15" cy="8" r="1"/>',
 menu:'<path d="M4 7h16M4 12h16M4 17h10"/>',
 search:'<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4-4"/>',
 inbox:'<path d="M3 13h5l1.5 3h5L16 13h5"/><path d="M5 5h14l2 8v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5z"/>',
 shield:'<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
 gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
 history:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
 spark:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
 eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
 eyeOff:'<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
 grip:'<circle cx="9" cy="6" r="1.2"/><circle cx="15" cy="6" r="1.2"/><circle cx="9" cy="12" r="1.2"/><circle cx="15" cy="12" r="1.2"/><circle cx="9" cy="18" r="1.2"/><circle cx="15" cy="18" r="1.2"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
 copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>',
 edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
 upload:'<path d="M12 16V4M7 9l5-5 5 5M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
 ext:'<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
 check:'<path d="m5 12 5 5 9-10"/>',
 x:'<path d="M6 6l12 12M18 6 6 18"/>',
 star:'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
 moon:'<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
 out:'<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 16l-4-4 4-4M6 12h10"/>',
 desk:'<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20h8M12 16v4"/>',
 tab:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M11 18h2"/>',
 phone:'<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>',
 video:'<rect x="3" y="5" width="14" height="14" rx="2"/><path d="m17 10 4-2.5v9L17 14"/>',
 doc:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
 link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
 text:'<path d="M5 6h14M5 12h14M5 18h9"/>',
 chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
 timeline:'<circle cx="6" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="12" r="2"/><path d="M8 6h4a4 4 0 0 1 4 4v0M8 18h4a4 4 0 0 0 4-4"/>',
 split:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16M9 10l-2 2 2 2M15 10l2 2-2 2"/>',
 cloud:'<rect x="3" y="8" width="5" height="8" rx="1"/><rect x="10" y="6" width="4" height="12" rx="1"/><rect x="16" y="9" width="5" height="6" rx="1"/>',
 mega:'<path d="M3 10v4a1 1 0 0 0 1 1h2l5 4V5L6 9H4a1 1 0 0 0-1 1zM15 9a4 4 0 0 1 0 6M18 6a8 8 0 0 1 0 12"/>',
 mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
 globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
 lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
 send:'<path d="m4 12 16-8-6 16-2-7z"/>',
 arrow:'<path d="M19 12H5M11 6l-6 6 6 6"/>',
 wa:'<path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a4 4 0 0 1-2-2l.8-1-1-2z"/>',
 box:I.box,pack:I.pack,struct:I.struct,die:I.die,brand:I.brand,cube:I.cube,press:I.press,truck:I.truck,pen:I.pen
};
const ic=(k,sz=18)=>`<svg class="ico" viewBox="0 0 24 24" width="${sz}" height="${sz}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k]||I[k]||""}</svg>`;

/* ---------- formatting ---------- */
const dtf=new Intl.DateTimeFormat("ar-u-nu-latn",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});
const fmtDate=t=>dtf.format(new Date(t));
function rel(t){const s=(Date.now()-new Date(t))/1000;if(s<60)return"الآن";const m=s/60;if(m<60)return`منذ ${Math.round(m)} د`;const h=m/60;if(h<24)return`منذ ${Math.round(h)} س`;const d=h/24;if(d<30)return`منذ ${Math.round(d)} يوم`;return fmtDate(t)}
const fmtBytes=b=>b<1024?b+" B":b<1048576?(b/1024).toFixed(0)+" KB":(b/1048576).toFixed(1)+" MB";
const other=l=>l==="ar"?"en":"ar";
const LN={ar:"العربية",en:"English"};

/* ---------- roles & permissions (UI mirror — the API enforces the same matrix) ---------- */
const ROLES={owner:{t:"المالك",d:"صلاحيات كاملة"},manager:{t:"مدير",d:"المحتوى والمشاريع والنشر"},editor:{t:"محرر",d:"تعديل المحتوى وحفظ المسودات"},viewer:{t:"مشاهد",d:"قراءة فقط"}};
const CAPS={
 edit:{t:"تعديل المحتوى والأقسام",r:["owner","manager","editor"]},
 projects:{t:"إدارة المشاريع",r:["owner","manager","editor"]},
 media:{t:"رفع وإدارة الوسائط",r:["owner","manager","editor"]},
 delete:{t:"حذف العناصر",r:["owner","manager"]},
 theme:{t:"تعديل الهوية والثيم",r:["owner","manager"]},
 publish:{t:"النشر على الموقع",r:["owner","manager"]},
 restore:{t:"استعادة الإصدارات",r:["owner","manager"]},
 settings:{t:"الإعدادات و SEO العام",r:["owner"]},
 users:{t:"إدارة المستخدمين",r:["owner"]}
};
const can=c=>!!S.user&&CAPS[c].r.includes(S.user.role);
function deny(c){toast(`صلاحية «${ROLES[S.user.role].t}» لا تسمح بـ: ${CAPS[c].t}`,"err");return false}
const guard=c=>can(c)||deny(c);

/* ---------- state ---------- */
const S={work:null,user:null,route:"overview",args:[],lang:UI.lang,live:"",draft:"",sel:{}};
function migrate(p){
 p=p||clone(BASE);
 for(const k in BASE)if(p[k]===undefined)p[k]=clone(BASE[k]);
 p.theme={...BASE.theme,...p.theme};p.seo={...BASE.seo,...p.seo};p.settings={...BASE.settings,...p.settings};p.bg={...BASE.bg,...p.bg};
 return p;
}
const liveP=()=>TPCMS.get(K.live)||BASE;
const draftP=()=>TPCMS.get(K.draft);
const META=()=>TPCMS.get("tp-cms-meta")||{};
const setMeta=o=>TPCMS.put("tp-cms-meta",{...META(),...o});
function refreshSnap(){S.live=J(liveP());const d=draftP();S.draft=d?J(d):S.live}
function status(){const w=J(S.work);if(w!==S.draft)return"unsaved";if(S.draft!==S.live)return"draft";return"live"}
const STATUS={unsaved:["تغييرات غير محفوظة","احفظ المسودة لتتمكن من معاينتها ونشرها."],draft:["مسودة بانتظار النشر","المسودة محفوظة ولم تصل للموقع بعد. عاينها ثم انشر."],live:["كل التغييرات منشورة","الموقع يعرض أحدث نسخة. أي تعديل جديد يبدأ كمسودة."]};

const persistWork=debounce(()=>{if(!TPCMS.put(K.work,S.work))toast("مساحة التخزين التجريبية ممتلئة — احذف بعض الوسائط","err")},260);
/* every mutation goes through edit(): it guards the permission, writes the working copy (→ live preview) and refreshes status */
function edit(fn,cap="edit"){
 if(!guard(cap))return false;
 fn(S.work); persistWork(); paintStatus(); return true;
}

/* ---------- activity log & acceptance tracking ---------- */
const LOG=()=>TPCMS.get(K.log)||{flags:{},events:[]};
function mark(flag,text){
 const l=LOG(); if(flag&&!l.flags[flag])l.flags[flag]=Date.now();
 if(text)l.events.unshift({at:Date.now(),by:S.user?S.user.name:"",text});
 l.events=l.events.slice(0,60); TPCMS.put(K.log,l);
}

/* ---------- diff: human-readable change list between two payloads ---------- */
const CONTENT_LBL={hero:"الواجهة",intro:"من نحن",team:"الفريق",services:"الخدمات",featured:"مشاريع مختارة",gallery:"المعرض",process:"المراحل",materials:"الخامات والتشطيب",ba:"قبل / بعد",video:"الفيديو",stats:"الأرقام",tst:"آراء العملاء",cta:"دعوة للعمل",contact:"تواصل",nav:"القائمة",ctaNav:"زر القائمة",footer:"التذييل",cats:"التصنيفات",brand:"اسم العلامة",proj:null};
const THEME_LBL={primary:"اللون الأساسي",accent:"اللون المميز",secondary:"اللون الثانوي",bg:"الخلفية",surface:"السطح",ink:"النص",muted:"النص الثانوي",border:"الحدود",success:"النجاح",warning:"التحذير",error:"الخطأ",font:"خط العناوين",bodyFont:"خط النص",baseSize:"حجم الخط",lineHeight:"ارتفاع السطر",headWeight:"وزن العناوين",tracking:"تباعد الأحرف",radius:"الاستدارة",btn:"شكل الأزرار",container:"عرض الحاوية",motion:"الحركة",speed:"سرعة الحركة",ease:"نمط الانتقال",mode:"المظهر"};
function diff(a,b){
 const out=[],push=(k,t)=>out.push({k,t});
 const tk=Object.keys(THEME_LBL).filter(k=>J(a.theme[k])!==J(b.theme[k]));
 if(tk.length)push("THEME",tk.map(k=>THEME_LBL[k]).join("، "));
 const secName=s=>s.custom?(s.custom.ar.h2||"قسم مخصص"):(TPCMS.SECTIONS.find(x=>x[0]===s.id)||[,s.id])[1];
 const ai=a.sections.map(s=>s.id),bi=b.sections.map(s=>s.id);
 b.sections.filter(s=>!ai.includes(s.id)).forEach(s=>push("SECTION","قسم جديد: "+secName(s)));
 a.sections.filter(s=>!bi.includes(s.id)).forEach(s=>push("SECTION","حذف قسم: "+secName(s)));
 if(J(ai.filter(x=>bi.includes(x)))!==J(bi.filter(x=>ai.includes(x))))push("SECTION","ترتيب الأقسام");
 b.sections.forEach(s=>{const o=a.sections.find(x=>x.id===s.id);if(!o)return;if(o.visible!==s.visible)push("SECTION",(s.visible?"إظهار: ":"إخفاء: ")+secName(s));else if(s.custom&&J(o.custom)!==J(s.custom))push("SECTION","تعديل: "+secName(s))});
 const pa=a.projects.map(p=>p.id),pb=b.projects.map(p=>p.id),pt=(p,x)=>(x.content.ar.proj[p.id]||[p.lbl])[0];
 b.projects.filter(p=>!pa.includes(p.id)).forEach(p=>push("PROJECT","مشروع جديد: "+pt(p,b)));
 a.projects.filter(p=>!pb.includes(p.id)).forEach(p=>push("PROJECT","حذف مشروع: "+pt(p,a)));
 if(J(pa.filter(x=>pb.includes(x)))!==J(pb.filter(x=>pa.includes(x))))push("PROJECT","ترتيب المشاريع");
 b.projects.forEach(p=>{const o=a.projects.find(x=>x.id===p.id);if(!o)return;
  const ta=["ar","en"].map(l=>J(a.content[l].proj[p.id])).join(),tb=["ar","en"].map(l=>J(b.content[l].proj[p.id])).join();
  if(J(o)!==J(p)||ta!==tb)push("PROJECT","تعديل مشروع: "+pt(p,b)+(o.status!==p.status?` (${PSTAT[p.status][0]})`:""))});
 for(const l of ["ar","en"])for(const k in CONTENT_LBL){if(!CONTENT_LBL[k])continue;const x=a.content[l][k],y=b.content[l][k];if(J(x)!==J(y))push(l.toUpperCase(),CONTENT_LBL[k])}
 [["services","الخدمات (ظهور/وسائط)"],["team","الفريق (ظهور)"],["tst","الآراء (ظهور)"],["videos","روابط الفيديو"],["baMedia","صور قبل / بعد"],["bg","وسائط الواجهة"],["seo","SEO"],["settings","الإعدادات"],["cats","التصنيفات"]].forEach(([k,t])=>{if(J(a[k])!==J(b[k]))push("SITE",t)});
 return out;
}
const PSTAT={published:["منشور","ok"],draft:["مسودة","warn"],archived:["مؤرشف",""]};

/* ---------- draft / preview / publish / restore ---------- */
function saveDraft(silent){
 if(!guard("edit"))return false;
 persistWork.flush();
 if(!TPCMS.put(K.draft,S.work)){toast("تعذّر الحفظ: مساحة التخزين ممتلئة","err");return false}
 setMeta({draftAt:Date.now(),draftBy:S.user.name}); refreshSnap(); mark("draft",silent?"":"حفظ مسودة");
 if(!silent)toast("تم حفظ المسودة","ok"); paintStatus(); return true;
}
function openPreview(){
 if(status()==="unsaved"&&can("edit"))saveDraft(true);
 setMeta({previewAt:Date.now()}); mark("preview","فتح معاينة المسودة"); window.open("index.html?preview=draft","_blank","noopener");
}
async function publish(){
 if(!guard("publish"))return;
 if(status()==="unsaved")saveDraft(true);
 const d=draftP()||S.work,ch=diff(liveP(),d);
 if(!ch.length){toast("لا توجد تغييرات للنشر");return}
 const v=await modal({title:"نشر التغييرات على الموقع",body:`<p class="muted">ستنتقل هذه التغييرات من المسودة إلى الموقع المنشور، ويُحفظ إصدار جديد يمكن استعادته لاحقاً.</p>
  <ul class="changes">${ch.map(c=>`<li><span class="mono">${esc(c.k)}</span>${esc(c.t)}</li>`).join("")}</ul>
  <div class="fld"><label for="pubNote">وصف الإصدار</label><input id="pubNote" placeholder="مثال: تحديث الواجهة وإضافة مشروع جديد" maxlength="120"></div>`,
  actions:[{label:"إلغاء",value:null,cls:"btn-quiet"},{label:`نشر ${ch.length} تغيير`,value:"ok",cls:"btn-accent"}],
  read:()=>$("#pubNote").value.trim()});
 if(!v)return;
 const vs=TPCMS.get(K.versions)||[],n=(vs[0]?vs[0].v:0)+1;
 vs.unshift({v:n,at:Date.now(),by:S.user.name,role:S.user.role,note:v.read||ch.slice(0,2).map(c=>c.t).join("، "),changes:ch.map(c=>c.t),snapshot:clone(d)});
 while(!TPCMS.put(K.versions,vs)&&vs.length>3)vs.pop();
 TPCMS.put(K.live,d); setMeta({liveAt:Date.now(),liveBy:S.user.name,liveV:n}); refreshSnap();
 mark("publish",`نشر الإصدار v${n}`); toast(`تم النشر — الإصدار v${n} على الموقع الآن`,"ok"); render();
}
async function restoreVersion(n){
 if(!guard("restore"))return;
 const v=(TPCMS.get(K.versions)||[]).find(x=>x.v===n);if(!v)return;
 const ok=await confirmBox(`استعادة الإصدار v${n}؟`,"يستبدل محتوى هذا الإصدار المسودة الحالية. الموقع المنشور لا يتغير حتى تضغط «نشر».","استعادة كمسودة");
 if(!ok)return;
 S.work=migrate(clone(v.snapshot||BASE)); TPCMS.put(K.work,S.work); saveDraft(true);
 mark("restore",`استعادة الإصدار v${n} كمسودة`); toast(`استُعيد v${n} كمسودة — راجعها ثم انشر`,"ok"); render();
}

/* ---------- media ---------- */
const MEDIA_RULES={image:{ext:["jpg","jpeg","png","webp","svg"],max:15,t:"صورة"},video:{ext:["mp4","webm","mov"],max:200,t:"فيديو"},doc:{ext:["pdf","ai","psd","zip"],max:50,t:"ملف"}};
const FOLDERS=[["all","كل الوسائط"],["brand","الهوية والشعارات"],["projects","المشاريع"],["video","الفيديو"],["docs","المستندات"]];
const media=()=>TPCMS.media();
const sessionURLs={}; // uploaded videos: previewable this session only (the API stores the file)
function initStores(){
 if(!TPCMS.get(K.media)){
  const m={},now=Date.now();
  m["m-logo-l"]={id:"m-logo-l",name:"titan-pack-logo.png",ext:"png",kind:"image",size:27000,folder:"brand",data:$("#logoL").src,at:now-864e6,by:"النظام"};
  m["m-logo-d"]={id:"m-logo-d",name:"titan-pack-logo-light.png",ext:"png",kind:"image",size:23000,folder:"brand",data:$("#logoD").src,at:now-864e6,by:"النظام"};
  [["dieline","رسم الفرد"],["box","علبة تدور"],["halftone","شبكة CMYK"],["flute","الكرتون المموج"],["sheet","فرخ المطبعة"]].forEach(([k,t],i)=>m["m-clip-"+k]={id:"m-clip-"+k,name:k+".mp4",title:t,ext:"mp4",kind:"video",clip:k,size:[3.1,2.4,1.8,2.2,2.9][i]*1048576,folder:"video",at:now-7e8+i*1e7,by:"النظام"});
  m["m-profile"]={id:"m-profile",name:"titan-pack-profile.pdf",ext:"pdf",kind:"doc",size:4.2*1048576,folder:"docs",at:now-5e8,by:"النظام"};
  TPCMS.put(K.media,m);
 }
 if(!TPCMS.get(K.users))TPCMS.put(K.users,[
  {id:"u1",name:"مالك تيتان باك",email:"owner@titanpack.com",role:"owner",at:Date.now()-36e5,active:true},
  {id:"u2",name:"ليان خالد",email:"layan@titanpack.com",role:"manager",at:Date.now()-2*864e5,active:true},
  {id:"u3",name:"عمر ناصر",email:"omar@titanpack.com",role:"editor",at:Date.now()-5*864e5,active:true},
  {id:"u4",name:"هبة يوسف",email:"hiba@titanpack.com",role:"viewer",at:Date.now()-20*864e5,active:false}]);
 if(!TPCMS.get(K.leads)){const d=864e5,n=Date.now();TPCMS.put(K.leads,[
  {id:"L1",at:new Date(n-3*36e5).toISOString(),status:"new",name:"رامي حداد",company:"محمصة الجبل",email:"rami@example.com",phone:"+970 59 000 0001",type:"تصميم عبوة",budget:"1,500 – 5,000 $",msg:"نحتاج عبوة قهوة 250 غ بصمام ونافذة شفافة، مع نسخة 1 كغ.",files:[{name:"logo.ai",size:820000},{name:"current-bag.jpg",size:1400000}],demo:1},
  {id:"L2",at:new Date(n-1*d).toISOString(),status:"new",name:"Dana Saleh",company:"Luma Skincare",email:"dana@example.com",phone:"",type:"مسار كامل",budget:"أكثر من 5,000 $",msg:"Serum and cream boxes for a new line, soft-touch with foil.",files:[{name:"brief.pdf",size:2300000}],lang:"en",demo:1},
  {id:"L3",at:new Date(n-3*d).toISOString(),status:"progress",name:"مؤسسة الريف",company:"الريف للتمور",email:"info@example.com",phone:"+970 56 000 0003",type:"فرد وقالب قص",budget:"500 – 1,500 $",msg:"علبة تمور 500 غ بفواصل داخلية.",files:[],demo:1},
  {id:"L4",at:new Date(n-8*d).toISOString(),status:"done",name:"سامر عودة",company:"صيدلية الشفاء",email:"samer@example.com",phone:"",type:"تجهيز للطباعة",budget:"أقل من 500 $",msg:"تجهيز ملفات 6 علب أدوية للمطبعة.",files:[{name:"boxes.zip",size:18000000}],demo:1}])}
 if(!TPCMS.get(K.versions)){const d=864e5,n=Date.now();TPCMS.put(K.versions,[
  {v:3,at:n-3*d,by:"ليان خالد",role:"manager",note:"مراجعة نصوص الخدمات والمراحل",changes:["الخدمات","المراحل"],snapshot:null},
  {v:2,at:n-9*d,by:"مالك تيتان باك",role:"owner",note:"إضافة 12 مشروعاً تجريبياً للمعرض",changes:["المعرض","مشاريع مختارة"],snapshot:null},
  {v:1,at:n-19*d,by:"مالك تيتان باك",role:"owner",note:"الإطلاق الأول للنموذج",changes:["الإنشاء"],snapshot:null}]);
  setMeta({liveAt:n-3*d,liveBy:"ليان خالد",liveV:3})}
}
function kindOf(ext){for(const k in MEDIA_RULES)if(MEDIA_RULES[k].ext.includes(ext))return k;return null}
async function optimize(file){
 const bmp=await createImageBitmap(file);let out=null;
 for(const [max,q] of [[1600,.82],[1200,.74],[900,.68]]){
  const s=Math.min(1,max/Math.max(bmp.width,bmp.height)),c=document.createElement("canvas");
  c.width=Math.round(bmp.width*s);c.height=Math.round(bmp.height*s);c.getContext("2d").drawImage(bmp,0,0,c.width,c.height);
  out={data:c.toDataURL("image/webp",q),w:c.width,h:c.height};
  if(out.data.length<420000)break;
 }
 return out;
}
/* validate → optimise → store; returns the record or throws a user-facing message */
async function ingest(file,folder="all",replaceId){
 const ext=(file.name.split(".").pop()||"").toLowerCase(),kind=kindOf(ext);
 if(!kind)throw`${file.name}: نوع غير مدعوم`;
 if(file.size>MEDIA_RULES[kind].max*1048576)throw`${file.name}: أكبر من ${MEDIA_RULES[kind].max} MB`;
 const m=media(),old=replaceId&&m[replaceId];
 const rec={id:replaceId||uid("m"),name:old?old.name.replace(/\.[^.]+$/,"")+"."+(kind==="image"&&ext!=="svg"?"webp":ext):file.name,ext,kind,size:file.size,folder:old?old.folder:(folder==="all"?(kind==="video"?"video":kind==="doc"?"docs":"projects"):folder),at:Date.now(),by:S.user.name,title:old&&old.title};
 if(kind==="image"){
  if(ext==="svg"){if(file.size>300000)throw`${file.name}: ملف SVG كبير للنموذج`;rec.data=await new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result);f.readAsDataURL(file)})}
  else{const o=await optimize(file);Object.assign(rec,o,{ext:"webp",optSize:Math.round(o.data.length*.75)})}
 }else if(kind==="video"){sessionURLs[rec.id]=URL.createObjectURL(file)}
 m[rec.id]=rec;
 if(!TPCMS.put(K.media,m))throw`${file.name}: مساحة التخزين التجريبية ممتلئة`;
 mark("upload",`رفع ${rec.name}`);
 return rec;
}
async function ingestAll(files,folder){
 const ok=[];for(const f of files){try{ok.push(await ingest(f,folder))}catch(e){toast(String(e),"err")}}
 if(ok.length){const saved=ok.filter(r=>r.optSize).reduce((a,r)=>a+(r.size-r.optSize),0);toast(`تم رفع ${ok.length} ملف`+(saved>0?` · وُفّر ${fmtBytes(saved)} بتحويل الصور إلى WebP`:""),"ok")}
 return ok;
}
function thumbHTML(r){
 if(!r)return`<div class="thumb"><span class="ftype">${ic("image",26)}</span></div>`;
 if(r.kind==="image"&&r.data)return`<div class="thumb"><img src="${r.data}" alt="" loading="lazy"></div>`;
 if(r.kind==="video"&&r.clip)return`<div class="thumb"><img src="media/${r.clip}.jpg" alt="" loading="lazy" onerror="this.remove()"><span class="ftype" style="position:absolute">${ic("video",26)}</span></div>`;
 return`<div class="thumb"><span class="ftype">${ic(r.kind==="video"?"video":"doc",26)}<span>${esc(r.ext.toUpperCase())}</span></span></div>`;
}

/* ---------- UI primitives ---------- */
function toast(msg,kind=""){const t=document.createElement("div");t.className="toast "+kind;t.textContent=msg;$("#toasts").appendChild(t);setTimeout(()=>t.remove(),kind==="err"?5000:3200)}
let modalResolve=null,lastFocus=null;
function modal({title,body,actions=[{label:"إغلاق",value:null,cls:"btn-ghost"}],wide,read,onMount}){
 closeModal();lastFocus=document.activeElement;
 const m=$("#modal");
 m.innerHTML=`<div class="box${wide?" wide":""}"><div class="mh"><h3 id="mTitle">${esc(title)}</h3><button class="icon-btn sm" type="button" data-mclose aria-label="إغلاق">${ic("x",16)}</button></div><div class="mb">${body}</div>${actions.length?`<div class="mf">${actions.map((a,i)=>`<button class="btn ${a.cls||"btn-ghost"}" type="button" data-i="${i}">${esc(a.label)}</button>`).join("")}</div>`:""}</div>`;
 m.setAttribute("aria-labelledby","mTitle"); m.hidden=false;
 return new Promise(res=>{
  modalResolve=res;
  $$(".mf button",m).forEach(b=>b.onclick=()=>{const a=actions[+b.dataset.i];if(a.value==null)return closeModal();const out=read?{value:a.value,read:read()}:a.value;if(a.validate&&!a.validate())return;closeModal(out)});
  $("[data-mclose]",m).onclick=()=>closeModal();
  m.onclick=e=>{if(e.target===m)closeModal()};
  onMount&&onMount(m,closeModal);
  ($("input,select,textarea",$(".mb",m))||$(".mf .btn:last-child",m)||$("[data-mclose]",m)).focus();
 });
}
function closeModal(v=null){const m=$("#modal");if(m.hidden)return;m.hidden=true;m.innerHTML="";const r=modalResolve;modalResolve=null;r&&r(v);lastFocus&&lastFocus.focus&&lastFocus.focus()}
const confirmBox=(title,text,ok="تأكيد",danger)=>modal({title,body:`<p>${esc(text)}</p>`,actions:[{label:"إلغاء",value:null,cls:"btn-quiet"},{label:ok,value:true,cls:danger?"btn-danger":"btn-accent"}]});
function drawer(title,body,onMount,foot){
 const w=$("#drawer"),d=$(".drawer",w);lastFocus=document.activeElement;
 d.innerHTML=`<div class="mh"><h3>${esc(title)}</h3><button class="icon-btn sm" type="button" data-close aria-label="إغلاق">${ic("x",16)}</button></div><fieldset class="mb pg" ${ro()}>${body}</fieldset>${foot?`<div class="mf">${foot}</div>`:""}`;
 w.hidden=false; $$("[data-close]",w).forEach(b=>b.onclick=closeDrawer);
 bind(d); onMount&&onMount(d); ($("input,textarea,select",d)||$("[data-close]",d)).focus();
}
function closeDrawer(){const w=$("#drawer");if(w.hidden)return;w.hidden=true;$(".drawer",w).innerHTML="";lastFocus&&lastFocus.focus&&lastFocus.focus()}
document.addEventListener("keydown",e=>{if(e.key!=="Escape")return;if(!$("#modal").hidden)closeModal();else if(!$("#drawer").hidden)closeDrawer();else if(!$("#ai").hidden)closeAI()});
const ro=()=>S.user&&S.user.role==="viewer"?"disabled":"";

/* ---------- data binding: [data-k="content.{L}.hero.h1"] ⇄ S.work ---------- */
const path=p=>p.replace(/\{L\}/g,S.lang).replace(/\{O\}/g,other(S.lang)).split(".").map(x=>/^\d+$/.test(x)?+x:x);
const getP=(o,p)=>path(p).reduce((a,k)=>a==null?a:a[k],o);
function setP(o,p,v){const k=path(p),last=k.pop();const t=k.reduce((a,x)=>a[x],o);t[last]=v}
const toField={em:v=>String(v||"").replace(/<em>(.*?)<\/em>/g,"[$1]"),mark:v=>String(v||"").replace(/<mark>(.*?)<\/mark>/g,"[$1]"),lines:v=>(v||[]).join("\n")};
const fromField={em:v=>esc(v).replace(/\[(.+?)\]/g,"<em>$1</em>"),mark:v=>esc(v).replace(/\[(.+?)\]/g,"<mark>$1</mark>"),lines:v=>v.split("\n").map(x=>x.trim()).filter(Boolean),num:v=>+v,bool:(v,el)=>el.checked};
function bind(root){
 $$("[data-k]",root).forEach(el=>{
  const p=el.dataset.k,t=el.dataset.t,cap=el.dataset.cap||"edit";
  const v=getP(S.work,p);
  if(t==="bool")el.checked=!!v;else el.value=toField[t]?toField[t](v):(v??"");
  if(/\.en\.|^content\.en/.test(path(p).join("."))||el.dataset.ltr!=null)el.dir="ltr";
  const cnt=el.closest(".fld")&&$(".cnt",el.closest(".fld"));
  const upd=()=>{if(cnt){const mx=+el.dataset.max;cnt.textContent=el.value.length+(mx?" / "+mx:"");cnt.classList.toggle("over",mx&&el.value.length>mx)}};upd();
  el.addEventListener(t==="bool"||el.tagName==="SELECT"?"change":"input",()=>{
   upd(); const val=fromField[t]?fromField[t](el.value,el):el.value;
   const ok=edit(w=>{setP(w,p,val);el.dataset.sync&&setP(w,el.dataset.sync,val)},cap);
   if(!ok){if(t==="bool")el.checked=!el.checked;return}
   el.dataset.mark&&mark(el.dataset.mark); el.dispatchEvent(new CustomEvent("bound",{bubbles:true,detail:{path:p,value:val}}));
  });
 });
 $$("[data-tags]",root).forEach(mountTags);
}
const fld=(label,inner,o={})=>`<div class="fld${o.cls?" "+o.cls:""}"><label${o.for?` for="${o.for}"`:""}>${esc(label)}${o.count?`<span class="cnt"></span>`:""}</label>${inner}${o.hint?`<span class="hint">${o.hint}</span>`:""}</div>`;
const inp=(k,o={})=>`<input data-k="${k}"${o.t?` data-t="${o.t}"`:""}${o.max?` data-max="${o.max}"`:""}${o.mark?` data-mark="${o.mark}"`:""}${o.sync?` data-sync="${o.sync}"`:""}${o.ph?` placeholder="${esc(o.ph)}"`:""}${o.type?` type="${o.type}"`:""}${o.ltr?" data-ltr":""}${o.id?` id="${o.id}"`:""}${o.attrs||""}>`;
const area=(k,o={})=>`<textarea data-k="${k}"${o.t?` data-t="${o.t}"`:""}${o.max?` data-max="${o.max}"`:""}${o.mark?` data-mark="${o.mark}"`:""}${o.rows?` rows="${o.rows}"`:""}${o.ph?` placeholder="${esc(o.ph)}"`:""}></textarea>`;
const tgl=(label,k,o={})=>`<label class="tgl"><span>${esc(label)}</span><input type="checkbox" data-k="${k}" data-t="bool"${o.cap?` data-cap="${o.cap}"`:""}${o.mark?` data-mark="${o.mark}"`:""}></label>`;
const langNote=()=>`<span class="badge pri">${ic("globe",12)} تحرير ${LN[S.lang]}</span>`;
function mountTags(box){
 const p=box.dataset.tags;
 const draw=()=>{const a=getP(S.work,p)||[];box.innerHTML=a.map((t,i)=>`<span>${esc(t)}<button type="button" data-i="${i}" aria-label="حذف">×</button></span>`).join("")+`<input placeholder="أضف واضغط Enter" aria-label="إضافة">`;
  $$("button",box).forEach(b=>b.onclick=()=>{if(edit(w=>getP(w,p).splice(+b.dataset.i,1)))draw()});
  const i=$("input",box);if(/\.en\.|content\.en/.test(path(p).join(".")))i.dir="ltr";
  i.onkeydown=e=>{if((e.key==="Enter"||e.key===",")&&i.value.trim()){e.preventDefault();const v=i.value.trim();if(edit(w=>getP(w,p).push(v))){draw();$("input",box).focus()}}else if(e.key==="Backspace"&&!i.value&&(getP(S.work,p)||[]).length){if(edit(w=>getP(w,p).pop())){draw();$("input",box).focus()}}}};
 draw();
}
function colorField(label,k,o={}){return`<div class="fld"><span class="lbl">${esc(label)}</span><div class="color"><input type="color" data-color="${k}" aria-label="${esc(label)}"><input type="text" data-colort="${k}" maxlength="7" aria-label="${esc(label)} hex"></div>${o.hint?`<span class="hint">${o.hint}</span>`:""}</div>`}
function bindColors(root,cap="theme",after){
 $$("[data-color]",root).forEach(c=>{const k=c.dataset.color,t=$(`[data-colort="${k}"]`,root);c.value=t.value=getP(S.work,k);
  const set=v=>{if(!/^#[0-9a-f]{6}$/i.test(v))return;if(edit(w=>setP(w,k,v),cap)){c.value=t.value=v;after&&after(k,v)}};
  c.oninput=()=>set(c.value);t.onchange=()=>set(t.value.trim())});
}
/* media picker field: stores a media id at path */
function pickHTML(k,{kind="image",label="اختيار من المكتبة"}={}){const r=media()[getP(S.work,k)];return`<div class="pick" data-pick="${k}" data-kind="${kind}">${thumbHTML(r)}<div style="display:grid;gap:6px;min-width:0"><b style="font-size:.82rem" class="ltr">${r?esc(r.name):"لا يوجد ملف"}</b><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn btn-ghost btn-sm" type="button" data-pk>${ic("image",14)} ${esc(label)}</button>${r?`<button class="btn btn-quiet btn-sm" type="button" data-rm>إزالة</button>`:""}</div></div></div>`}
function bindPicks(root,onChange){
 $$("[data-pick]",root).forEach(el=>{const k=el.dataset.pick;
  $("[data-pk]",el).onclick=async()=>{const id=await pickMedia(el.dataset.kind);if(id&&edit(w=>setP(w,k,id))){el.outerHTML=pickHTML(k,{kind:el.dataset.kind});bindPicks(root,onChange);onChange&&onChange(k,id)}};
  const rm=$("[data-rm]",el);if(rm)rm.onclick=()=>{if(edit(w=>setP(w,k,null))){el.outerHTML=pickHTML(k,{kind:el.dataset.kind});bindPicks(root,onChange);onChange&&onChange(k,null)}};
 });
}
async function pickMedia(kind="image"){
 let sel=null;
 const list=()=>Object.values(media()).filter(r=>kind==="any"||r.kind===kind).sort((a,b)=>b.at-a.at);
 const grid=()=>list().map(r=>`<button type="button" class="mitem" data-id="${r.id}" aria-pressed="${r.id===sel}">${thumbHTML(r)}<b>${esc(r.name)}</b><span>${fmtBytes(r.optSize||r.size)}</span></button>`).join("")||`<div class="empty" style="grid-column:1/-1">لا توجد ملفات من هذا النوع بعد</div>`;
 const v=await modal({title:"مكتبة الوسائط",wide:true,body:`<label class="drop" id="pkDrop">${ic("upload",22)}<span>اسحب ملفاً هنا أو اضغط للرفع</span><small>${MEDIA_RULES[kind]?MEDIA_RULES[kind].ext.join(" · ").toUpperCase():""}</small><input type="file" hidden multiple accept="${MEDIA_RULES[kind]?MEDIA_RULES[kind].ext.map(e=>"."+e).join(","):""}"></label><div class="mgrid" id="pkGrid">${grid()}</div>`,
  actions:[{label:"إلغاء",value:null,cls:"btn-quiet"},{label:"اختيار",value:"pick",cls:"btn-accent",validate:()=>sel||(toast("اختر ملفاً أولاً","err"),false)}],
  onMount:m=>{
   const g=$("#pkGrid",m),wire=()=>$$(".mitem",g).forEach(b=>{b.onclick=()=>{sel=b.dataset.id;$$(".mitem",g).forEach(x=>x.setAttribute("aria-pressed",x===b))};b.ondblclick=()=>{sel=b.dataset.id;$(".mf .btn-accent",m).click()}});wire();
   const d=$("#pkDrop",m),fi=$("input",d);
   const up=async fs=>{if(!guard("media"))return;const r=await ingestAll([...fs]);if(r.length){sel=r[r.length-1].id;g.innerHTML=grid();wire()}};
   fi.onchange=()=>up(fi.files);
   d.ondragover=e=>{e.preventDefault();d.classList.add("over")};d.ondragleave=()=>d.classList.remove("over");d.ondrop=e=>{e.preventDefault();d.classList.remove("over");up(e.dataTransfer.files)};
  }});
 return v?sel:null;
}

/* ---------- drag & drop reorder (pointer-free HTML5 DnD + keyboard via buttons) ---------- */
function sortable(container,itemSel,onMove){
 let from=null;
 $$(itemSel,container).forEach(el=>{
  el.draggable=true;
  el.addEventListener("dragstart",e=>{if(ro()){e.preventDefault();return}from=+el.dataset.idx;el.classList.add("dragging");e.dataTransfer.effectAllowed="move";e.dataTransfer.setData("text/plain",from)});
  el.addEventListener("dragend",()=>{el.classList.remove("dragging");$$(".drag-over",container).forEach(x=>x.classList.remove("drag-over"))});
  el.addEventListener("dragover",e=>{e.preventDefault();el.classList.add("drag-over")});
  el.addEventListener("dragleave",()=>el.classList.remove("drag-over"));
  el.addEventListener("drop",e=>{e.preventDefault();el.classList.remove("drag-over");const to=+el.dataset.idx;if(from!=null&&from!==to)onMove(from,to);from=null});
 });
}
const move=(a,f,t)=>{const [x]=a.splice(f,1);a.splice(t,0,x);return a};

/* ---------- live preview pane ---------- */
function previewHTML(){return`<div class="pv"><div class="pv-bar"><div class="seg" role="group" aria-label="الجهاز">${[["desktop","desk","سطح المكتب"],["tablet","tab","لوحي"],["mobile","phone","جوال"]].map(([d,i,t])=>`<button type="button" data-dev="${d}" aria-pressed="${UI.device===d}" title="${t}" aria-label="${t}">${ic(i,15)}</button>`).join("")}</div><span class="url">titanpack.com · معاينة مباشرة للمسودة</span><a class="icon-btn sm" href="index.html?preview=work" target="_blank" rel="noopener" title="فتح في نافذة" aria-label="فتح في نافذة">${ic("ext",15)}</a></div><div class="pv-stage ${UI.device}" id="pvStage"><div class="pv-scale"><iframe id="pvFrame" title="معاينة الموقع" src="index.html?preview=work&lang=${S.lang}"></iframe></div></div></div>`}
let pvRO=null;
function mountPreview(root,scrollTo){
 const st=$("#pvStage",root),fr=$("#pvFrame",root);if(!fr)return;
 const fit=()=>{const w=st.clientWidth,h=st.clientHeight;if(UI.device==="desktop"&&w<1280){const s=w/1280;fr.style.width="1280px";fr.style.height=h/s+"px";fr.style.transform=`scale(${s})`}else{fr.style.width="";fr.style.height="";fr.style.transform=""}};
 pvRO&&pvRO.disconnect();pvRO=new ResizeObserver(fit);pvRO.observe(st);fit();
 $$("[data-dev]",root).forEach(b=>b.onclick=()=>{UI.device=b.dataset.dev;saveUI();st.className="pv-stage "+UI.device;$$("[data-dev]",root).forEach(x=>x.setAttribute("aria-pressed",x===b));fit()});
 persistWork.flush();
 fr.addEventListener("load",()=>{if(scrollTo)setTimeout(()=>pvScroll(scrollTo),150)});
}
function pvScroll(id){const f=$("#pvFrame");if(f&&f.contentWindow)f.contentWindow.postMessage({tpScroll:id},location.origin==="null"?"*":location.origin)}
