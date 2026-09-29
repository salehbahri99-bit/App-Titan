/* Titan Pack dashboard — AI assistant (prototype).
   Intents are matched locally so the flow can be tested offline; in the platform the same panel sends the request
   plus a CMS schema summary to Claude through the API, which returns the same kind of plan: small edits run with
   an undo, structural or large edits wait for confirmation. */
const AI_SUG=["اجعل الموقع أكثر فخامة","غيّر اللون الأساسي إلى الأسود","أضف هذا المشروع إلى المعرض","اكتب وصفاً احترافياً لهذا المشروع","أنشئ قسم جديد للخدمات","أخفِ قسم الفيديو"];
const aiMsgs=[];const aiActs={};
const norm=s=>s.toLowerCase().replace(/[ً-ْـ]/g,"").replace(/[أإآ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي");
const COLOR_WORDS=[[/اسود|black/,"#1B1B1B","الأسود"],[/كحلي|navy|ازرق|blue/,"#23395B","الأزرق الداكن"],[/اخضر|زيتي|green|olive/,"#3E5641","الأخضر الزيتوني"],[/خمري|عنابي|احمر|burgundy|red/,"#6B2D3C","الخمري"],[/بني|brown/,"#5A3A22","البني"],[/ذهبي|gold/,"#C9A45C","الذهبي"],[/برتقالي|orange/,"#EF974F","البرتقالي"],[/فيروزي|تركواز|teal|turquoise/,"#1E8AA0","الفيروزي"],[/بنفسجي|purple/,"#4B3869","البنفسجي"]];
const FONT_WORDS=[[/الكسندريا|alexandria/,"Alexandria"],[/ريم|reem|كوفي|kufi/,"Reem Kufi"],[/القاهره|cairo/,"Cairo"],[/بلكس|plex/,"IBM Plex Sans Arabic"]];
const SEC_WORDS=[[/خدمات|خدمه|service/,"services","الخدمات"],[/فريق|team/,"team","الفريق"],[/اراء|اقتباس|testimonial/,"testimonials","آراء العملاء"],[/ارقام|احصائيات|stat/,"stats","الأرقام"],[/فيديو|video/,"video","الفيديو"],[/معرض|gallery/,"gallery","المعرض"],[/شعارات|عملاء|logo/,"logos","شعارات العملاء"],[/تواصل|contact/,"contact","تواصل"],[/مراحل|خط زمني|timeline|process/,"timeline","المراحل"],[/قبل|before/,"beforeafter","قبل / بعد"],[/نص|text/,"text","نص"]];
const SEC_IDS=[[/الواجهه|hero/,"hero"],[/من نحن|about/,"about"],[/الفريق|team/,"team"],[/الخدمات|services/,"services"],[/مختار|featured/,"featured"],[/المعرض|gallery|work/,"work"],[/المراحل|process/,"process"],[/الخامات|materials/,"materials"],[/قبل|before/,"ba"],[/الفيديو|video/,"video"],[/الارقام|stats/,"stats"],[/الاراء|testimonial/,"testimonials"],[/دعوه|cta/,"cta"],[/تواصل|contact/,"contact"]];

function ctxProject(){if(S.route==="projects"&&S.args[0]&&S.args[0]!=="new")return S.work.projects.find(p=>p.id===S.args[0]);return null}
function withUndo(label,fn,cap){const before=clone(S.work);if(!edit(fn,cap))return null;mark(null,"المساعد: "+label);const id=uid("u");aiActs[id]=()=>{S.work=before;TPCMS.put(K.work,S.work);toast("تم التراجع");render();openAI()};return id}
function describe(p){
 const l=S.lang,c=S.work.content[l],t=ptxt(p,l),cat=(c.cats||{})[p.cat]||p.cat,mat=c.materials.mats[p.meta.mat][0],fins=p.meta.fin.map(f=>c.materials.fins[f][0]),svc=p.meta.svc.map(i=>(c.services.items[i]||[])[1]).filter(Boolean);
 const join=(a,and)=>a.length<2?a.join(""):a.slice(0,-1).join("، ")+` ${and} `+a[a.length-1];
 return l==="ar"?`${t[0]}${t[1]?` لصالح ${t[1]}`:""}: عبوة في قطاع ${cat} بمقاس ${p.dims} مم، نُفذت على ${mat}${fins.length?` مع ${join(fins,"و")}`:""}. شمل العمل ${join(svc,"و")||"التصميم الكامل"}، لتخرج عبوة تُقرأ بوضوح على الرف وتصل إلى المطبعة بملفات جاهزة دون تعديلات.`
  :`${t[0]}${t[1]?` for ${t[1]}`:""}: a ${cat.toLowerCase()} pack at ${p.dims} mm, produced on ${mat}${fins.length?` with ${join(fins.map(x=>x.toLowerCase()),"and")}`:""}. The scope covered ${join(svc.map(x=>x.toLowerCase()),"and")||"end-to-end design"}, delivering a pack that reads clearly on shelf and reaches the printer with production-ready files.`;
}
function think(raw){
 const q=norm(raw),T=S.work.theme;
 // colour
 if(/لون|color|colour/.test(q)){
  const hex=(raw.match(/#[0-9a-f]{6}/i)||[])[0],w=COLOR_WORDS.find(([r])=>r.test(q)),key=/مميز|accent|ثانوي|الازرار/.test(q)?"accent":"primary";
  const val=hex||(w&&w[1]),old=T[key];if(!val)return{t:"أي لون تقصد؟ اكتب اسم اللون (أسود، كحلي، زيتوني، خمري…) أو رمزه مثل ‎#1B1B1B."};
  if(!can("theme"))return{t:`اقتراح: ${key==="primary"?"اللون الأساسي":"اللون المميز"} ← ${val}. صلاحيتك لا تسمح بتعديل الهوية؛ اطلب من المالك أو المدير.`};
  const id=withUndo(`تغيير ${key==="primary"?"اللون الأساسي":"اللون المميز"}`,x=>x.theme[key]=val,"theme");if(!id)return{t:"لم يتم التنفيذ."};
  if(key==="primary")mark("primary");
  return{t:`تم. ${key==="primary"?"اللون الأساسي":"اللون المميز"} الآن ${w?w[2]:""} <span class="ltr">${val}</span> في المسودة، والمعاينة تحدّثت.`,plan:{items:[`${key==="primary"?"الأساسي":"المميز"}: <span class="ltr">${old}</span> ← <span class="ltr" style="display:inline-block;width:12px;height:12px;border-radius:3px;background:${val};vertical-align:middle"></span> <span class="ltr">${val}</span>`],acts:[["تراجع",id,"btn-ghost"],["افتح الثيم","go:theme","btn-quiet"]]}};
 }
 // luxury preset — large change → confirm
 if(/فخام|فخم|راقي|luxur|premium|elegant/.test(q)){
  const p=THEME_PRESETS[1][2],id=uid("a");
  aiActs[id]=()=>{const u=withUndo("تطبيق هوية فاخرة",x=>Object.assign(x.theme,p),"theme");if(!u)return;mark("primary");mark("font");say({t:"طُبّقت الهوية الفاخرة على المسودة. راجع المعاينة، ثم احفظ المسودة وانشر عندما تكون جاهزاً.",plan:{items:[],acts:[["تراجع",u,"btn-ghost"],["عرض في الثيم","go:theme","btn-quiet"]]}})};
  return{t:"اقتراحي لإحساس أكثر فخامة يناسب علب الهدايا والعطور:",plan:{items:[`اللون الأساسي أسود فحمي <span class="ltr">${p.primary}</span> والمميز ذهبي <span class="ltr">${p.accent}</span>`,`خلفية عاجية دافئة <span class="ltr">${p.bg}</span> وسطح <span class="ltr">${p.surface}</span>`,`خط العناوين «${p.font}» بوزن ${p.headWeight}`,"أزرار حادة الزوايا واستدارة 4px للبطاقات"],warn:`تغيير كبير: ${Object.keys(p).length} إعدادات في الهوية — يحتاج تأكيدك.`,acts:can("theme")?[["تأكيد التطبيق",id,"btn-accent"],["إلغاء","noop","btn-quiet"]]:[["صلاحيتك لا تسمح","noop","btn-quiet"]]}};
 }
 // font
 if(/خط|font/.test(q)){const f=FONT_WORDS.find(([r])=>r.test(q));if(!f)return{t:`الخطوط المتاحة: ${FONTS.join("، ")}. أي خط تريد للعناوين؟`};const id=withUndo(`خط العناوين ${f[1]}`,x=>x.theme.font=f[1],"theme");if(!id)return{t:"لم يتم التنفيذ."};mark("font");return{t:`تم تغيير خط العناوين إلى «${f[1]}».`,plan:{items:[],acts:[["تراجع",id,"btn-ghost"]]}}}
 // project description
 if(/وصف|describe|description/.test(q)){
  const p=ctxProject();
  if(!p){const recent=S.work.projects.slice(0,3);return{t:"افتح المشروع الذي تريد وصفه ثم اطلب مرة أخرى، أو اختر واحداً:",plan:{items:[],acts:recent.map(r=>[ptxt(r,"ar")[0],"go:projects/"+r.id,"btn-ghost"])}}}
  const txt=describe(p),id=uid("a");
  aiActs[id]=()=>{const u=withUndo("كتابة وصف مشروع",x=>x.content[S.lang].proj[p.id][2]=txt,"projects");if(u){say({t:"أُدرج الوصف في المشروع.",plan:{items:[],acts:[["تراجع",u,"btn-ghost"]]}});render();openAI()}};
  return{t:`مسودة وصف لـ«${ptxt(p)[0]}» (${LN[S.lang]}) مبنية على بيانات المشروع:`,plan:{items:[`<span style="white-space:normal">${esc(txt)}</span>`],acts:[["إدراج في الوصف",id,"btn-accent"],["نسخ","copy:"+txt,"btn-quiet"]]}};
 }
 // add / publish project to gallery
 if(/مشروع|project/.test(q)&&/اضف|انشر|المعرض|add|gallery|publish/.test(q)){
  const p=ctxProject();
  if(!p)return{t:"لإضافة مشروع جديد: أنشئه كمسودة وأكمل بياناته، ثم اطلب مني نشره في المعرض.",plan:{items:[],acts:[["إنشاء مشروع","go:projects/new","btn-accent"]]}};
  const feat=/مميز|مختار|featured/.test(q);
  if(p.status==="published"&&(!feat||p.featured))return{t:`«${ptxt(p)[0]}» منشور في المعرض بالفعل${p.featured?" وضمن المشاريع المختارة":""}.`};
  const id=withUndo("إضافة مشروع للمعرض",x=>{const y=x.projects.find(z=>z.id===p.id);y.status="published";if(feat)y.featured=true},"projects");if(!id)return{t:"لم يتم التنفيذ."};
  render();return{t:`تم. «${ptxt(p)[0]}» أصبح «منشوراً» في المسودة${feat?" وضمن المشاريع المختارة":""} ويظهر في المعرض بعد النشر.`,plan:{items:[],acts:[["تراجع",id,"btn-ghost"],["نشر الآن","publish","btn-accent"]]}};
 }
 // hide / show a section
 if(/اخف|اخفي|hide|اظهر|show/.test(q)){
  const m=SEC_IDS.find(([r])=>r.test(q));if(!m)return{t:"أي قسم؟ مثال: «أخفِ قسم الفيديو» أو «أظهر قسم الآراء»."};
  const show=/اظهر|show/.test(q),id=withUndo(`${show?"إظهار":"إخفاء"} قسم`,x=>x.sections.find(s=>s.id===m[1]).visible=show);if(!id)return{t:"لم يتم التنفيذ."};
  pvScroll(m[1]);if(S.route==="sections")render();
  return{t:`تم ${show?"إظهار":"إخفاء"} قسم «${secLabel(m[1])}» في المسودة.`,plan:{items:[],acts:[["تراجع",id,"btn-ghost"]]}};
 }
 // new section — structural → confirm
 if(/قسم|section/.test(q)&&/جديد|انشئ|اضف|new|add|create/.test(q)){
  const t=SEC_WORDS.find(([r])=>r.test(q))||[,"custom","مخصص"],id=uid("a");
  const copy=t[1]==="services"?{ar:{eyebrow:"خدمات إضافية",h2:"خدمات تكمل مشروع عبوتك",p:"تصوير المنتج، كتابة نصوص العبوة، وتجهيز صور المتجر الإلكتروني — بنفس جودة التصميم.",btn:"اطلب الخدمة",href:"#contact"},en:{eyebrow:"Extra services",h2:"Services that complete your pack",p:"Product photography, on-pack copywriting and e-commerce imagery — at the same design standard.",btn:"Request",href:"#contact"}}:{ar:{eyebrow:t[2],h2:`قسم ${t[2]} جديد`,p:"اكتب هنا وصفاً قصيراً لهذا القسم.",btn:"",href:"#contact"},en:{eyebrow:t[1],h2:`New ${t[1]} section`,p:"Write a short description for this section.",btn:"",href:"#contact"}};
  aiActs[id]=()=>{const nid=uid("cs-");const u=withUndo("إنشاء قسم",x=>{const at=x.sections.findIndex(s=>s.id==="cta");x.sections.splice(at<0?x.sections.length:at,0,{id:nid,visible:true,custom:{type:t[1],image:null,...clone(copy)}})});if(!u)return;mark("sectionAdd");location.hash="#/sections/"+nid;say({t:"أُضيف القسم قبل «دعوة للعمل» وفتحته للتعديل.",plan:{items:[],acts:[["تراجع",u,"btn-ghost"]]}})};
  return{t:`سأضيف قسماً من نوع «${t[2]}» بمحتوى مبدئي:`,plan:{items:[`العنوان: ${esc(copy.ar.h2)}`,`النص: ${esc(copy.ar.p)}`,"الموضع: قبل قسم «دعوة للعمل» — نسخة عربية وإنجليزية"],warn:"تغيير في هيكل الصفحة — يحتاج تأكيدك.",acts:[["تأكيد الإنشاء",id,"btn-accent"],["إلغاء","noop","btn-quiet"]]}};
 }
 if(/انشر|publish/.test(q))return{t:"سأفتح نافذة النشر لتراجع التغييرات قبل وصولها للموقع.",plan:{items:[],acts:[["مراجعة ونشر","publish","btn-accent"]]}};
 return{t:"أستطيع تنفيذ أوامر مثل:",plan:{items:["تغيير الألوان والخطوط: «غيّر اللون الأساسي إلى الكحلي»","اقتراح هوية كاملة: «اجعل الموقع أكثر فخامة»","كتابة وصف مشروع مفتوح: «اكتب وصفاً احترافياً لهذا المشروع»","نشر مشروع في المعرض: «أضف هذا المشروع إلى المعرض»","الأقسام: «أنشئ قسم جديد للخدمات» · «أخفِ قسم الفيديو»"],acts:[]}};
}
function say(m){aiMsgs.push({r:"a",...m});paintAI()}
function aiSend(text){text=text.trim();if(!text)return;aiMsgs.push({r:"u",t:esc(text)});aiMsgs.push({r:"a",typing:1});paintAI();
 setTimeout(()=>{aiMsgs.pop();let res;try{res=think(text)}catch(e){res={t:"حدث خطأ أثناء تنفيذ الطلب."}}aiMsgs.push({r:"a",...res});paintAI()},450)}
function paintAI(){
 const log=$("#aiLog");if(!log)return;
 log.innerHTML=aiMsgs.map(m=>`<div class="msg ${m.r}">${m.typing?`<span class="typing"><i></i><i></i><i></i></span>`:m.t}${m.plan?`<div class="plan">${m.plan.items.length?`<ul>${m.plan.items.map(i=>`<li>${i}</li>`).join("")}</ul>`:""}${m.plan.warn?`<span class="warn">${ic("lock",12)} ${m.plan.warn}</span>`:""}${m.plan.acts.length?`<div class="acts">${m.plan.acts.map(([l,a,c])=>`<button class="btn btn-sm ${c}" type="button" data-ai="${esc(a)}">${esc(l)}</button>`).join("")}</div>`:""}</div>`:""}</div>`).join("");
 log.scrollTop=log.scrollHeight;
 $$("[data-ai]",log).forEach(b=>b.onclick=()=>{const a=b.dataset.ai;b.closest(".acts").querySelectorAll("button").forEach(x=>x.disabled=true);
  if(a==="noop")return say({t:"حسناً، لم أغيّر شيئاً."});
  if(a==="publish")return publish();
  if(a.startsWith("go:")){location.hash="#/"+a.slice(3);return}
  if(a.startsWith("copy:")){navigator.clipboard&&navigator.clipboard.writeText(a.slice(5)).then(()=>toast("نُسخ النص"));return}
  aiActs[a]&&aiActs[a]()});
}
function openAI(){
 const p=$("#ai");p.hidden=false;
 if(!aiMsgs.length)aiMsgs.push({r:"a",t:`أهلاً ${esc(S.user.name.split(" ")[0])}، أنا مساعد تيتان باك. أعدّل المسودة فقط — لا شيء يصل للموقع قبل النشر، والتغييرات الكبيرة أطلب تأكيدك عليها.`});
 p.innerHTML=`<div class="ai-h"><span class="spark">${ic("spark",18)}</span><div><b>المساعد الذكي</b><small>نموذج تجريبي · يفهم أوامر محددة محلياً</small></div><button class="icon-btn sm" type="button" id="aiX" aria-label="إغلاق">${ic("x",16)}</button></div>
 <div class="ai-log" id="aiLog" aria-live="polite"></div><div class="ai-sug">${AI_SUG.map(s=>`<button type="button">${s}</button>`).join("")}</div>
 <form class="ai-f" id="aiF"><textarea id="aiIn" placeholder="اطلب تعديلاً… مثال: غيّر اللون الأساسي إلى الكحلي" aria-label="رسالة للمساعد"></textarea><button class="btn btn-accent" type="submit" aria-label="إرسال">${ic("send",16)}</button></form>`;
 $("#aiX").onclick=closeAI;
 $$(".ai-sug button",p).forEach(b=>b.onclick=()=>aiSend(b.textContent));
 $("#aiF").onsubmit=e=>{e.preventDefault();aiSend($("#aiIn").value);$("#aiIn").value=""};
 $("#aiIn").onkeydown=e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();$("#aiF").requestSubmit()}};
 paintAI();$("#aiIn").focus();
}
function closeAI(){$("#ai").hidden=true}

boot();
