/* Titan Pack — CMS layer (prototype).
   Stands in for the API: payloads live in localStorage under the keys below. The public site renders
   the published payload, `?preview=draft` renders the saved draft, `?preview=work` renders the dashboard's
   unsaved working copy (live preview iframe) and `?preview=v<N>` renders a stored version.
   In production these become API calls; the payload shape is the contract. */
const TPCMS=(()=>{
 const K={work:"tp-cms-work",draft:"tp-cms-draft",live:"tp-cms-live",versions:"tp-cms-versions",media:"tp-cms-media",leads:"tp-cms-leads",users:"tp-cms-users",session:"tp-cms-session",log:"tp-cms-log"};
 const clone=o=>JSON.parse(JSON.stringify(o));
 const get=k=>{try{return JSON.parse(localStorage.getItem(k)||"null")}catch(e){return null}};
 const put=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}};

 /* section registry: id, Arabic label, English label, type */
 const SECTIONS=[["hero","الواجهة","Hero","hero"],["about","من نحن","About","text"],["team","الفريق","Team","team"],["services","الخدمات","Services","services"],
  ["featured","مشاريع مختارة","Featured","projects"],["work","المعرض","Gallery","gallery"],["process","المراحل","Process","timeline"],["materials","الخامات والتشطيب","Materials","custom"],
  ["ba","قبل / بعد","Before / After","beforeafter"],["video","الفيديو","Video","video"],["stats","الأرقام","Statistics","stats"],["testimonials","آراء العملاء","Testimonials","testimonials"],
  ["cta","دعوة للعمل","CTA","cta"],["contact","تواصل","Contact","contact"]];

 const THEME_DEF={primary:"#06414F",accent:"#EF974F",font:"Alexandria",radius:14,motion:true,mode:"auto",
  secondary:"#EFE6D0",bg:"#F7F2E6",surface:"#FFFCF4",ink:"#1E2A2E",muted:"#56666A",border:"#06414F",success:"#2F7D5B",warning:"#C98A1B",error:"#B83A2E",
  bodyFont:"IBM Plex Sans Arabic",baseSize:16,lineHeight:1.75,headWeight:700,tracking:-1,container:1240,btn:"soft",speed:1,ease:"smooth"};

 /* defaults captured before any overlay — the "factory" content */
 const BASE={v:1,
  content:clone(CONTENT),
  cats:[...CATS],
  projects:PROJECTS.map((p,i)=>({...clone(p),featured:!!p.featured,status:"published",slug:p.id,meta:clone(PROJ_META[p.id]),industry:"",cover:null,gallery:[],videos:[],before:null,after:null,dieline:null,seo:{title:"",desc:""}})),
  sections:SECTIONS.map(([id])=>({id,visible:true})),
  services:CONTENT.ar.services.items.map(()=>({visible:true,image:null,gallery:[]})),
  team:CONTENT.ar.team.members.map(()=>({visible:true,photo:null})),
  tst:CONTENT.ar.tst.items.map(()=>({visible:true})),
  videos:CONTENT.ar.video.items.map(()=>({url:"",poster:null})),
  baMedia:CONTENT.ar.ba.cases.map(()=>[null,null]),
  bg:{hero:{kind:"clip",clip:"dieline",url:"",image:null,ov:.55}},
  theme:clone(THEME_DEF),
  seo:{ar:{title:"تيتان باك — تصميم وهندسة العبوات",desc:"استوديو متخصص في تصميم العبوات والعلب والفرد والمجسمات ثلاثية الأبعاد وتجهيز ملفات الطباعة."},
       en:{title:"Titan Pack — Packaging Design & Engineering",desc:"A studio for packaging, box design, dielines, 3D mockups and print-ready production files."},
       og:null,canonical:"https://titanpack.com/",index:true,follow:true,sitemap:true},
  settings:{defaultLang:"ar",en:true,maintenance:false,notify:"hello@titanpack.com",maxMB:25,maxFiles:5}
 };

 const params=new URLSearchParams(location.search);
 const mode=params.get("preview")||"live";
 function keyFor(m){return m==="draft"?K.draft:m==="work"?K.work:K.live}
 function read(m=mode){
  if(/^v\d+$/.test(m)){const v=(get(K.versions)||[]).find(x=>"v"+x.v===m);return v?v.snapshot:null}
  return get(keyFor(m))||(m==="work"?get(K.draft)||get(K.live):m==="draft"?get(K.live):null);
 }
 const media=()=>get(K.media)||{};
 const mediaUrl=id=>id?(media()[id]||{}).data||null:null;

 /* overlay a payload on the shared globals (CONTENT, CATS, PROJECTS, PROJ_META) — mutates in place */
 function apply(p){
  p=p||BASE;
  for(const l of ["ar","en"]){const t=CONTENT[l];for(const k of Object.keys(t))delete t[k];Object.assign(t,clone(p.content[l]||BASE.content[l]))}
  CATS.splice(0,CATS.length,...p.cats);
  const M=media();
  // services: drop hidden ones and remap project→service indexes to match
  const svcMap={};let n=0;(p.services||[]).forEach((s,i)=>{if(s.visible!==false)svcMap[i]=n++});
  for(const l of ["ar","en"]){const C=CONTENT[l];
   C.services.items=C.services.items.filter((_,i)=>svcMap[i]!==undefined);
   C.team.members=C.team.members.filter((_,i)=>(p.team||[])[i]?.visible!==false);
   C.tst.items=C.tst.items.filter((_,i)=>(p.tst||[])[i]?.visible!==false);
  }
  const live=p.projects.filter(x=>x.status==="published");
  PROJECTS.splice(0,PROJECTS.length,...live.map(x=>({...x,featured:x.featured?1:0,coverUrl:x.cover&&M[x.cover]?M[x.cover].data:null})));
  for(const k of Object.keys(PROJ_META))delete PROJ_META[k];
  live.forEach(x=>{
   PROJ_META[x.id]={...x.meta,svc:(x.meta.svc||[]).filter(i=>svcMap[i]!==undefined).map(i=>svcMap[i])};
   for(const l of ["ar","en"]){const pr=CONTENT[l].proj;if(!pr[x.id])pr[x.id]=[x.lbl,"",""]}
  });
  return p;
 }

 /* theme tokens the site's own customizer doesn't cover → one <style> block (light palette only; dark keeps its own) */
 const hexA=(h,a)=>{const n=parseInt(h.slice(1),16);return`rgba(${n>>16},${n>>8&255},${n&255},${a})`};
 function themeCSS(t){
  const d=THEME_DEF,v=[],x=[];
  const c=(k,css)=>{if(t[k]&&t[k]!==d[k])v.push(css)};
  c("bg",`--bg:${t.bg}`);c("surface",`--surface:${t.surface}`);c("secondary",`--surface-2:${t.secondary}`);c("ink",`--ink:${t.ink}`);c("muted",`--muted:${t.muted}`);
  if(t.border&&t.border!==d.border)v.push(`--line:${hexA(t.border,.16)};--line-strong:${hexA(t.border,.38)}`);
  c("success",`--success:${t.success}`);c("warning",`--warning:${t.warning}`);c("error",`--error:${t.error}`);
  const g=[];
  if(t.bodyFont&&t.bodyFont!==d.bodyFont)g.push(`--f-body:"${t.bodyFont}","IBM Plex Sans Arabic",system-ui,sans-serif`);
  if(+t.container&&+t.container!==d.container)g.push(`--container:${+t.container}px`);
  if(t.speed!=null&&+t.speed!==d.speed)g.push(`--speed:${+t.speed}`);
  if(t.ease==="snappy")g.push(`--ease:cubic-bezier(.4,0,.2,1)`);else if(t.ease==="soft")g.push(`--ease:cubic-bezier(.16,1,.3,1)`);
  if(v.length)x.push(`:root{${v.join(";")}}`);
  if(g.length)x.push(`:root{${g.join(";")}}`);
  if(+t.baseSize&&+t.baseSize!==d.baseSize||+t.lineHeight&&+t.lineHeight!==d.lineHeight)x.push(`body{font-size:${+t.baseSize}px;line-height:${+t.lineHeight}}`);
  if(+t.headWeight!==d.headWeight||+t.tracking!==d.tracking)x.push(`h1,h2,h3,h4{font-weight:${+t.headWeight};letter-spacing:${(+t.tracking/100).toFixed(3)}em}`);
  if(t.btn==="pill")x.push(`.btn{border-radius:999px}`);else if(t.btn==="square")x.push(`.btn{border-radius:2px}`);
  return x.join("\n");
 }
 function injectTheme(t,doc=document){
  let s=doc.getElementById("tp-cms-theme");
  if(!s){s=doc.createElement("style");s.id="tp-cms-theme";doc.head.appendChild(s)}
  s.textContent=themeCSS(t);
 }

 function addLead(l){const a=get(K.leads)||[];a.unshift({id:"L"+Date.now().toString(36),at:new Date().toISOString(),status:"new",...l});put(K.leads,a.slice(0,200))}

 const payload=mode==="live"&&!get(K.live)?null:read();
 if(payload)apply(payload);
 return {K,SECTIONS,THEME_DEF,BASE,clone,get,put,read,apply,media,mediaUrl,themeCSS,injectTheme,addLead,mode,preview:mode!=="live",payload};
})();
