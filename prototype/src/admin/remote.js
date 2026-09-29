/* Titan Pack dashboard — Supabase mode (active when config.js names a project).
   Replaces the prototype's pretend sign-in, local drafts, publishing, media and inbox with the real service.
   The database rules in supabase/migrations are the authority; this file only mirrors them in the UI.
   The working copy (unsaved edits) and the live preview stay local, exactly as in the prototype. */
if(TPCMS.remote){
 let sb=null;
 const RECOVERY=/type=recovery/.test(location.hash);   // read before the client consumes the link
 const WORKBASE="tp-cms-workbase";
 const ERR={forbidden:"صلاحيتك لا تسمح بهذا الإجراء.",last_owner:"لا يمكن تغيير دور أو إيقاف آخر مالك للموقع.",no_draft:"لا توجد مسودة محفوظة للنشر.",no_version:"هذا الإصدار غير موجود.",signup_not_invited:"هذا البريد غير مدعو. اطلب من مالك الموقع دعوتك أولاً.",rate_limited:"طلبات كثيرة خلال وقت قصير. حاول بعد قليل."};
 const msg=e=>{const m=(e&&(e.message||e.error_description))||String(e);const k=Object.keys(ERR).find(x=>m.includes(x));if(k)return ERR[k];
  if(/Invalid login credentials/i.test(m))return"البريد أو كلمة المرور غير صحيحة.";
  if(/Email not confirmed/i.test(m))return"أكّد بريدك أولاً من الرسالة التي وصلتك، ثم سجّل الدخول.";
  if(/Database error saving new user/i.test(m))return ERR.signup_not_invited;
  if(/already registered/i.test(m))return"هذا البريد مسجّل بالفعل. سجّل الدخول أو استعد كلمة المرور.";
  if(/Password should be/i.test(m))return"كلمة المرور قصيرة. استخدم 8 أحرف على الأقل.";
  if(/row-level security|permission denied/i.test(m))return ERR.forbidden;
  if(/fetch|network|Failed to load/i.test(m))return"تعذّر الاتصال بالخادم. تحقق من الإنترنت وحاول مرة أخرى.";
  return m};
 const ok=r=>{if(r&&r.error)throw r.error;return r?r.data:null};

 /* ---------- pull everything the dashboard shows into the local cache ---------- */
 async function hydrate(){
  const q=[sb.from("site_state").select("slot,payload,updated_at,updated_by"),
   sb.from("versions").select("v,note,changes,author,author_role,created_at").order("v",{ascending:false}).limit(50),
   sb.from("leads").select("*").order("created_at",{ascending:false}).limit(500),
   sb.from("profiles").select("*").order("created_at"),
   can("users")?sb.from("invites").select("*"):Promise.resolve({data:[]}),
   sb.from("media_folders").select("*"),
   sb.from("activity").select("at,author,text").order("at",{ascending:false}).limit(40)];
  const [st,vers,lds,profs,invs,folds,acts]=(await Promise.all(q)).map(ok);
  await TPCMS.pullMedia(sb);
  const draft=st.find(r=>r.slot==="draft"),live=st.find(r=>r.slot==="live");
  TPCMS.cache(K.live,live?live.payload:null);TPCMS.cache(K.draft,draft?draft.payload:null);
  TPCMS.cache(K.versions,vers.map(r=>({v:r.v,at:+new Date(r.created_at),by:r.author,role:r.author_role,note:r.note,changes:r.changes})));
  const who=id=>{const p=profs.find(x=>x.id===id);return p?(p.name||p.email):""};
  setMeta({liveV:vers[0]?vers[0].v:null,liveAt:vers[0]?+new Date(vers[0].created_at):null,liveBy:vers[0]?vers[0].author:"",draftAt:draft?+new Date(draft.updated_at):null,draftBy:draft?who(draft.updated_by):""});
  TPCMS.cache(K.leads,lds.map(toLead));
  TPCMS.cache(K.users,[...profs.map(p=>({id:p.id,name:p.name||p.email,email:p.email,role:p.role,at:p.last_seen||p.created_at,active:p.active})),...invs.map(i=>({id:"inv:"+i.email,name:i.name||i.email,email:i.email,role:i.role,at:i.created_at,pending:true}))]);
  TPCMS.cache("tp-cms-folders",folds.map(f=>[f.id,f.name]));
  const l=LOG();l.events=acts.map(a=>({at:+new Date(a.at),by:a.author,text:a.text}));TPCMS.cache(K.log,l);
  // keep unsaved local edits only if they were made on top of the draft that is still on the server
  const base=draft?draft.updated_at:"none";
  if(!(TPCMS.get(K.work)&&localStorage.getItem(WORKBASE)===base)){TPCMS.cache(K.work,draft?draft.payload:(live?live.payload:clone(BASE)));localStorage.setItem(WORKBASE,base)}
 }

 /* ---------- local writes that must reach the server ---------- */
 const sync=(p,label)=>p.then(r=>{if(r&&r.error)throw r.error}).catch(e=>{toast(`${label}: ${msg(e)}`,"err");hydrate().then(render)});
 function registerHooks(){
  const H=TPCMS.hooks;
  H[K.media]=(next,prev)=>{prev=prev||{};
   for(const id in prev){const a=prev[id],b=next[id];
    if(!b){sync(sb.from("media").delete().eq("id",id),"حذف الملف");if(a.path)sb.storage.from("media").remove([a.path]);continue}
    if(a.name!==b.name||a.folder!==b.folder||a.title!==b.title)sync(sb.from("media").update({name:b.name,folder:b.folder,title:b.title||null}).eq("id",id),"تحديث الملف")}};
  H[K.leads]=(next,prev)=>{prev=prev||[];
   for(const a of prev){const b=next.find(x=>x.id===a.id);
    if(!b)sync(sb.from("leads").delete().eq("id",a.id),"حذف الطلب");else if(b.status!==a.status)sync(sb.from("leads").update({status:b.status}).eq("id",a.id),"تحديث الطلب")}};
  H[K.users]=(next,prev)=>{prev=prev||[];
   for(const b of next){const a=prev.find(x=>x.id===b.id);
    if(!a&&b.pending)sync(sb.from("invites").insert({email:b.email.toLowerCase(),name:b.name,role:b.role}),"الدعوة").then(()=>hydrate().then(render));
    else if(a&&a.role!==b.role)sync(b.pending?sb.from("invites").update({role:b.role}).eq("email",b.email):sb.rpc("set_user_access",{target:b.id,new_role:b.role,is_active:b.active!==false}),"تغيير الدور")}};
  H["tp-cms-folders"]=(next,prev)=>{prev=prev||[];next.filter(f=>!prev.some(p=>p[0]===f[0])).forEach(f=>sync(sb.from("media_folders").insert({id:f[0],name:f[1]}),"المجلد"))};
 }

 /* ---------- someone else may have saved the draft since this dashboard loaded it ---------- */
 async function draftStamp(){const {data,error}=await sb.from("site_state").select("updated_at").eq("slot","draft").maybeSingle();if(error)throw error;return data?data.updated_at:"none"}
 async function pullDraft(){localStorage.removeItem(WORKBASE);await hydrate();S.work=migrate(TPCMS.get(K.work));refreshSnap()}
 /* true → safe to write; "reloaded" → the newer draft was loaded (nothing local to lose); false → cancelled */
 async function ensureFresh(){
  let stamp;try{stamp=await draftStamp()}catch(e){toast(msg(e),"err");return false}
  if(stamp===localStorage.getItem(WORKBASE))return true;
  if(status()!=="unsaved"){await pullDraft();return"reloaded"}
  const r=await modal({title:"توجد مسودة أحدث على الخادم",body:`<p>حفظ مستخدم آخر مسودة بعد أن بدأت التعديل. اختر ما تريد:</p><ul class="changes"><li><b>تحميل الأحدث</b> — تظهر تعديلاته وتُفقد تعديلاتك غير المحفوظة.</li><li><b>استبدالها بتعديلاتي</b> — تُحفظ نسختك وتُلغى تعديلاته.</li></ul>`,
   actions:[{label:"إلغاء",value:null,cls:"btn-quiet"},{label:"تحميل الأحدث",value:"load",cls:"btn-ghost"},{label:"استبدالها بتعديلاتي",value:"mine",cls:"btn-danger"}]});
  if(r==="mine")return true;
  if(r==="load"){await pullDraft();toast("حُمّلت أحدث مسودة من الخادم");render()}
  return false;
 }
 let warnedStale=false;
 async function refreshDraft(){
  if(!S.user||document.hidden)return;
  let stamp;try{stamp=await draftStamp()}catch(e){return}
  if(stamp===localStorage.getItem(WORKBASE))return;
  if(status()!=="unsaved"){await pullDraft();paintStatus();if($("#drawer").hidden&&$("#modal").hidden)render();toast("حُدّثت المسودة: حفظ مستخدم آخر تعديلات جديدة");return}
  if(!warnedStale){warnedStale=true;toast("حفظ مستخدم آخر مسودة أحدث. سيُطلب منك الاختيار عند الحفظ.","err")}
 }

 /* ---------- overrides of the prototype's local behaviour ---------- */
 initStores=function(){};
 const localMark=mark;
 mark=function(flag,text){localMark(flag,text);if(text&&S.user)sb.from("activity").insert({author:S.user.name,text:String(text).slice(0,300)}).then(()=>{})};

 saveDraft=async function(silent){
  if(!guard("edit"))return false;
  persistWork.flush();
  const fresh=await ensureFresh();if(fresh!==true)return fresh==="reloaded";
  const payload=clone(S.work);warnedStale=false;
  return sb.from("site_state").upsert({slot:"draft",payload}).select("updated_at").single().then(({data,error})=>{
   if(error){toast("تعذّر حفظ المسودة: "+msg(error),"err");return false}
   TPCMS.cache(K.draft,payload);localStorage.setItem(WORKBASE,data.updated_at);
   setMeta({draftAt:Date.now(),draftBy:S.user.name});refreshSnap();mark("draft",silent?"":"حفظ مسودة");
   if(!silent)toast("تم حفظ المسودة على الخادم","ok");paintStatus();const c=$("#pubCard");if(c){c.innerHTML=pubCardHTML();bindPub(c)}return true;
  });
 };
 openPreview=function(){
  const w=window.open("about:blank","_blank");if(w)w.opener=null;
  (status()==="unsaved"&&can("edit")?saveDraft(true):Promise.resolve(true)).then(saved=>{
   if(!saved){w&&w.close();return}
   setMeta({previewAt:Date.now()});mark("preview","فتح معاينة المسودة");
   if(w)w.location.href="index.html?preview=draft";else location.href="index.html?preview=draft";
  });
 };
 publish=async function(){
  if(!guard("publish"))return;
  const fresh=await ensureFresh();if(fresh===false)return;
  if(fresh==="reloaded"){toast("حُمّلت أحدث مسودة من الخادم — راجعها ثم انشر");render();return}
  if(status()==="unsaved"&&!(await saveDraft(true)))return;
  const d=draftP()||S.work,note=await askPublish(diff(liveP(),d));if(note==null)return;
  const {data:n,error}=await sb.rpc("publish",{note,changes:diff(liveP(),d).map(c=>c.t)});
  if(error){toast("تعذّر النشر: "+msg(error),"err");return}
  await hydrate();refreshSnap();mark("publish",`نشر الإصدار v${n}`);toast(`تم النشر — الإصدار v${n} على الموقع الآن`,"ok");render();
 };
 restoreVersion=async function(n){
  if(status()==="unsaved"&&!(await confirmBox("تعديلات غير محفوظة","الاستعادة تستبدل المسودة، وستُفقد تعديلاتك غير المحفوظة.","متابعة",true)))return;
  if(!guard("restore"))return;
  if(!(await confirmBox(`استعادة الإصدار v${n}؟`,"يستبدل محتوى هذا الإصدار المسودة الحالية على الخادم. الموقع المنشور لا يتغير حتى تضغط «نشر».","استعادة كمسودة")))return;
  const {error}=await sb.rpc("restore_version",{version:n});
  if(error){toast("تعذّرت الاستعادة: "+msg(error),"err");return}
  await pullDraft();
  mark("restore",`استعادة الإصدار v${n} كمسودة`);toast(`استُعيد v${n} كمسودة — راجعها ثم انشر`,"ok");render();
 };
 ingest=async function(file,folder="all",replaceId){
  const ext=(file.name.split(".").pop()||"").toLowerCase(),kind=kindOf(ext);
  if(!kind)throw`${file.name}: نوع غير مدعوم`;
  if(file.size>MEDIA_RULES[kind].max*1048576)throw`${file.name}: أكبر من ${MEDIA_RULES[kind].max} MB`;
  const m=media(),old=replaceId&&m[replaceId];let blob=file,outExt=ext,dims={};
  if(kind==="image"&&ext!=="svg"){const o=await optimize(file);blob=await (await fetch(o.data)).blob();outExt="webp";dims={w:o.w,h:o.h}}
  const id=replaceId||uid("m"),fold=old?old.folder:(folder==="all"?(kind==="video"?"video":kind==="doc"?"docs":"projects"):folder);
  const path=`${fold}/${id}-${Date.now().toString(36)}.${outExt}`;
  const up=await sb.storage.from("media").upload(path,blob,{contentType:blob.type||file.type||"application/octet-stream",upsert:false});
  if(up.error)throw`${file.name}: ${msg(up.error)}`;
  const url=sb.storage.from("media").getPublicUrl(path).data.publicUrl;
  const base=(old?old.name:file.name).replace(/\.[^.]+$/,"");
  const row={id,name:`${base}.${outExt}`.slice(0,200),title:old?old.title||null:null,kind,ext:outExt,size:file.size,opt_size:blob!==file?blob.size:null,w:dims.w||null,h:dims.h||null,folder:fold,path,url,author:S.user.name};
  const res=old?await sb.from("media").update(row).eq("id",id):await sb.from("media").insert(row);
  if(res.error){sb.storage.from("media").remove([path]);throw`${file.name}: ${msg(res.error)}`}
  if(old&&old.path)sb.storage.from("media").remove([old.path]);
  const rec=TPCMS.toMedia({...row,created_at:new Date().toISOString()}),mm=media();mm[id]=rec;TPCMS.cache(K.media,mm);
  mark("upload",`رفع ${rec.name}`);return rec;
 };

 /* new contact requests arrive while the dashboard is open: refresh on navigation and every minute */
 const toLead=r=>({id:r.id,at:r.created_at,status:r.status,name:r.name,company:r.company,email:r.email,phone:r.phone,type:r.type,budget:r.budget,msg:r.msg,lang:r.lang,files:r.files});
 async function refreshLeads(){
  if(!S.user||document.hidden)return;
  const {data,error}=await sb.from("leads").select("*").order("created_at",{ascending:false}).limit(500);if(error)return;
  const next=data.map(toLead);if(J(next)===J(TPCMS.get(K.leads)||[]))return;
  TPCMS.cache(K.leads,next);paintSide();
  if((S.route==="forms"||S.route==="overview")&&$("#drawer").hidden&&$("#modal").hidden)render();
 }
 addEventListener("hashchange",()=>{refreshLeads();refreshDraft()});setInterval(refreshDraft,60000);setInterval(refreshLeads,60000);

 /* sidebar: no role switching (the server decides the role); sign-out ends the Supabase session */
 const localSide=paintSide;
 paintSide=function(){localSide();const r=$("#roleBtn");if(r)r.remove();$("#outBtn").onclick=async()=>{await sb.auth.signOut();["tp-cms-session",K.work,WORKBASE].forEach(k=>localStorage.removeItem(k));location.hash="";location.reload()}};

 /* versions: compare needs the stored payload, fetched on demand */
 const localVersions=PAGES.versions.render;
 PAGES.versions.render=function(v,args){localVersions(v,args);
  $$("[data-cmp]",v).forEach(b=>b.onclick=async()=>{const n=+b.dataset.cmp,{data,error}=await sb.from("versions").select("payload").eq("v",n).single();
   if(error)return toast(msg(error),"err");const ch=diff(migrate(data.payload),S.work);
   modal({title:`v${n} مقابل المسودة الحالية`,body:ch.length?`<p class="muted">ما تغيّر في المسودة الحالية منذ هذا الإصدار:</p><ul class="changes" style="max-height:none">${ch.map(c=>`<li><span class="mono">${esc(c.k)}</span>${esc(c.t)}</li>`).join("")}</ul>`:`<p>المسودة الحالية مطابقة لهذا الإصدار.</p>`})});
 };

 /* ---------- sign-in, first owner, invited sign-up, password reset ---------- */
 async function hasOwner(){const {data,error}=await sb.rpc("has_owner");if(error)throw error;return data}
 function authView(mode,note=""){
  loginView();                                       // keeps the prototype's branded left panel
  const f=$("#login .login-form");
  const T={signin:["SIGN IN","تسجيل الدخول","ادخل ببريدك وكلمة المرور."],owner:["FIRST RUN","إنشاء حساب المالك","لا يوجد مالك لهذا الموقع بعد. أول حساب يُنشأ هنا يصبح المالك بصلاحيات كاملة."],
   invite:["INVITATION","إنشاء حساب بدعوة","استخدم البريد الذي وصلته الدعوة عليه. الدور يحدده المالك."],reset:["RESET","استعادة كلمة المرور","سنرسل رابطاً لتعيين كلمة مرور جديدة."],newpass:["NEW PASSWORD","كلمة مرور جديدة","اختر كلمة مرور من 8 أحرف على الأقل."]}[mode];
  const email=`<div class="fld"><label for="aE">البريد الإلكتروني</label><input id="aE" type="email" dir="ltr" autocomplete="email" required></div>`;
  const pass=(id,l,ac)=>`<div class="fld"><label for="${id}">${l}</label><input id="${id}" type="password" dir="ltr" minlength="8" autocomplete="${ac}" required></div>`;
  f.innerHTML=`<form id="af" novalidate><div><div class="eyebrow mono">${T[0]}</div><h2>${T[1]}</h2><p class="muted" style="font-size:.86rem;margin-top:4px">${T[2]}</p></div>
   ${note?`<p class="note" role="status">${esc(note)}</p>`:""}
   ${mode==="owner"||mode==="invite"?`<div class="fld"><label for="aN">الاسم</label><input id="aN" autocomplete="name" required></div>`:""}
   ${mode!=="newpass"?email:""}
   ${mode==="signin"?pass("aP","كلمة المرور","current-password"):""}
   ${mode==="owner"||mode==="invite"||mode==="newpass"?pass("aP","كلمة المرور","new-password")+pass("aP2","تأكيد كلمة المرور","new-password"):""}
   <button class="btn btn-accent" type="submit" style="justify-content:center;padding:.8em">${{signin:"دخول",owner:"إنشاء حساب المالك",invite:"إنشاء الحساب",reset:"إرسال الرابط",newpass:"حفظ كلمة المرور"}[mode]}</button>
   <p class="muted" style="font-size:.8rem;text-align:center;display:flex;gap:14px;justify-content:center;flex-wrap:wrap">${mode==="signin"?`<a href="#" data-m="reset">نسيت كلمة المرور؟</a><a href="#" data-m="invite">وصلتني دعوة</a>`:mode==="owner"?"":`<a href="#" data-m="signin">العودة لتسجيل الدخول</a>`}</p></form>`;
  $$("[data-m]",f).forEach(a=>a.onclick=e=>{e.preventDefault();authView(a.dataset.m)});
  const btn=$("button[type=submit]",f);
  $("#af").onsubmit=async e=>{e.preventDefault();
   const v=id=>($("#"+id,f)||{}).value||"",em=v("aE").trim(),pw=v("aP");
   if(mode!=="newpass"&&!/^\S+@\S+\.\S+$/.test(em))return toast("أدخل بريداً صحيحاً","err");
   if(["owner","invite","newpass"].includes(mode)){if(pw.length<8)return toast("كلمة المرور 8 أحرف على الأقل","err");if(pw!==v("aP2"))return toast("كلمتا المرور غير متطابقتين","err")}
   if((mode==="owner"||mode==="invite")&&!v("aN").trim())return toast("اكتب اسمك","err");
   btn.disabled=true;
   try{
    const back=location.origin+location.pathname;
    if(mode==="signin"){ok(await sb.auth.signInWithPassword({email:em,password:pw}));return boot()}
    if(mode==="owner"||mode==="invite"){const d=ok(await sb.auth.signUp({email:em,password:pw,options:{data:{name:v("aN").trim()},emailRedirectTo:back}}));
     if(d.session)return boot();return authView("signin","أنشأنا الحساب. افتح الرسالة التي أرسلناها إلى بريدك واضغط رابط التأكيد، ثم سجّل الدخول.")}
    if(mode==="reset"){ok(await sb.auth.resetPasswordForEmail(em,{redirectTo:back}));return authView("signin","إذا كان البريد مسجّلاً ستصلك رسالة فيها رابط لتعيين كلمة مرور جديدة.")}
    if(mode==="newpass"){ok(await sb.auth.updateUser({password:pw}));history.replaceState(null,"",location.pathname);toast("تم تغيير كلمة المرور","ok");return boot()}
   }catch(x){toast(msg(x),"err")}finally{btn.disabled=false}
  };
  ($("input",f)||btn).focus();
 }

 boot=async function(){
  const l=$("#login");$("#app").hidden=true;l.hidden=false;
  if(!sb){l.innerHTML=`<div class="login-form"><p class="muted">جارٍ الاتصال بالخادم…</p></div>`;
   try{sb=await TPCMS.client()}catch(e){l.innerHTML=`<div class="login-form"><div class="note">تعذّر تحميل خدمة الحسابات. تحقق من الاتصال بالإنترنت ثم أعد تحميل الصفحة.</div></div>`;return}}
  try{
   const {data:{session}}=await sb.auth.getSession();
   if(RECOVERY&&session)return authView("newpass");
   if(!session)return authView(await hasOwner()?"signin":"owner");
   const prof=ok(await sb.from("profiles").select("*").eq("id",session.user.id).maybeSingle());
   if(!prof||!prof.active){await sb.auth.signOut();return authView("signin","هذا الحساب غير مفعّل. تواصل مع مالك الموقع.")}
   S.user={id:prof.id,name:prof.name||prof.email,email:prof.email,role:prof.role};TPCMS.put(K.session,S.user);
   sb.from("profiles").update({last_seen:new Date().toISOString()}).eq("id",prof.id).then(()=>{});
   await hydrate();registerHooks();
   S.work=migrate(TPCMS.get(K.work));refreshSnap();
   l.hidden=true;$("#app").hidden=false;if(!LOG().flags.login)mark("login",`تسجيل دخول (${ROLES[S.user.role].t})`);render();
  }catch(e){l.innerHTML=`<div class="login-form"><div class="note">${esc(msg(e))}</div></div>`}
 };
}
