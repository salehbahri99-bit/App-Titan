/* Titan Pack — public site prototype. All visible content lives in CONTENT (mirrors the future CMS models). */
(function(){
"use strict";
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};

/* ---------- icons (24px line) ---------- */
const I={
 pack:'<path d="M12 2.8 20.5 7v10L12 21.2 3.5 17V7z"/><path d="M3.5 7 12 11.2 20.5 7M12 11.2v10"/>',
 box:'<rect x="3.5" y="7" width="17" height="13" rx="1"/><path d="M3.5 7 6 3.5h12L20.5 7M9.5 11h5"/>',
 struct:'<path d="M3 8h6v8H3zM9 8h6v8H9zM15 8h6v8h-6z"/><path d="M9 8 11 4h2l2 4" stroke-dasharray="2 2"/>',
 die:'<path d="M4 4h7v5h9v11H4z"/><path d="M11 9v11M4 13h16" stroke-dasharray="2.2 2"/><circle cx="18" cy="5" r="2"/><path d="m16.6 6.4-3 3"/>',
 brand:'<circle cx="12" cy="12" r="8.5"/><path d="M8 9h8M12 9v7"/>',
 cube:'<path d="M12 3 20 7.5v9L12 21 4 16.5v-9z"/><path d="M12 12 20 7.5M12 12 4 7.5M12 12v9"/><path d="M16 5.2 8 9.8" opacity=".5"/>',
 press:'<rect x="3" y="10" width="18" height="8" rx="1.5"/><path d="M7 10V4h10v6M7 14h10M7 18v2h10v-2"/>',
 truck:'<path d="M2.5 6h11v10h-11zM13.5 9.5H18l3.5 3.5v3h-8"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
 eye:'<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
 pen:'<path d="m14.5 4.5 5 5L9 20H4v-5z"/><path d="m12.5 6.5 5 5"/>'
};
const ico=(k,sz=24)=>`<svg class="ico" viewBox="0 0 24 24" width="${sz}" height="${sz}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[k]}</svg>`;

/* ---------- content ---------- */
const CATS=["food","coffee","cosmetics","pharma","retail","premium","carton","branding","special"];
const PROJECTS=[
 {id:"hadaba",cat:"coffee",shape:"tall",pat:"band",bg:"#E9DCC6",c1:"#2B1B14",c2:"#EF974F",c3:"#F4ECD5",lbl:"HADABA",dims:"80×80×180",featured:1},
 {id:"lama",cat:"cosmetics",shape:"tall",pat:"arc",bg:"#EADFE0",c1:"#F6EEE9",c2:"#B9727A",c3:"#5B2F36",lbl:"LAMA",dims:"45×45×140",featured:1},
 {id:"sultan",cat:"premium",shape:"wide",pat:"frame",bg:"#0B3440",c1:"#101010",c2:"#C9A45C",c3:"#E9D39A",lbl:"SULTAN",dims:"300×220×60",featured:1},
 {id:"naqaa",cat:"pharma",shape:"bar",pat:"split",bg:"#E3ECEE",c1:"#FFFFFF",c2:"#1E8AA0",c3:"#0B4250",lbl:"NAQAA",dims:"120×30×60"},
 {id:"waha",cat:"food",shape:"wide",pat:"dots",bg:"#EFE2C5",c1:"#6B3E1F",c2:"#E3B04B",c3:"#F7EBD0",lbl:"WAHA",dims:"240×160×50"},
 {id:"reef",cat:"retail",shape:"cube",pat:"kraft",bg:"#DCD3C4",c1:"#B98B5E",c2:"#2F4F3A",c3:"#F4ECD5",lbl:"REEF",dims:"200×200×200"},
 {id:"misk",cat:"special",shape:"tall",pat:"frame",bg:"#1B1B1B",c1:"#2A2A2A",c2:"#B0895A",c3:"#E7D3B3",lbl:"MISK",dims:"70×70×160"},
 {id:"sabah",cat:"food",shape:"flat",pat:"stripes",bg:"#F3E4CF",c1:"#FFFFFF",c2:"#D8563B",c3:"#7A2A1B",lbl:"SABAH",dims:"330×330×45"},
 {id:"mailer",cat:"carton",shape:"flat",pat:"kraft",bg:"#E4DED2",c1:"#C49A6C",c2:"#06414F",c3:"#F4ECD5",lbl:"SHIP",dims:"350×250×80"},
 {id:"karma",cat:"branding",shape:"cube",pat:"arc",bg:"#D9E4DD",c1:"#F4ECD5",c2:"#3E7A5A",c3:"#1F3D2D",lbl:"KARMA",dims:"120×120×120"},
 {id:"origin",cat:"coffee",shape:"bar",pat:"band",bg:"#F0E6D2",c1:"#06414F",c2:"#EF974F",c3:"#F4ECD5",lbl:"ORIGIN",dims:"160×60×90"},
 {id:"zaytoun",cat:"food",shape:"tall",pat:"dots",bg:"#E5E6CF",c1:"#556B2F",c2:"#D9C36A",c3:"#F7F2DC",lbl:"ZAYTOUN",dims:"70×70×260"}
];
const MAT_KEYS=["kraft","sbs","duplex","corr","fbb","rigid"];
const FIN_KEYS=["matte","gloss","foil","emboss","deboss","spot","soft","die"];

const CONTENT={
ar:{
 dir:"rtl",lang:"ar",switchTo:"EN",
 brand:"تيتان باك",
 nav:[["#about","من نحن"],["#team","الفريق"],["#services","الخدمات"],["#work","الأعمال"],["#process","المراحل"],["#materials","الخامات"],["#contact","تواصل"]],
 ctaNav:"ابدأ مشروعك",
 hero:{eyebrow:"PACKAGING · STRUCTURE · PREPRESS",h1:'نصمم العبوة التي تجعل منتجك <em>يُرى</em> قبل أن يُفتح.',desc:"فريق من خمسة متخصصين يرافق منتجك من الفكرة الأولى وحتى ملف الفرد الجاهز للمطبعة: تصميم، هندسة إنشائية، مجسمات ثلاثية الأبعاد، وتجهيز فني للإنتاج.",c1:"ابدأ مشروعك",c2:"شاهد أعمالنا",
  specs:[["5","متخصصين في فريق واحد"],["6","مراحل من الفكرة للإنتاج"],["0.1 مم","دقة ملفات الفرد"]],
  flat:"الفرد المسطح",solid:"المجسم",meta:"علبة بلسان عكسي · 60×30×90 مم",cut:"خط قص",crease:"خط طي"},
 intro:{eyebrow:"من نحن",lead:'تيتان باك استوديو متخصص في تصميم وهندسة العبوات. نجمع <mark>الإبداع البصري</mark> مع <mark>الدقة الفنية</mark> حتى تصل عبوتك إلى خط الإنتاج كما تخيلتها تماماً.',
  pillars:[["DESIGN","تصميم يبيع","هوية بصرية على العبوة تلفت النظر على الرف وتشرح المنتج في ثوانٍ."],["ENGINEERING","هندسة تُطوى بدقة","فرد مدروس للقص والطي والتجميع، مناسب للخامة ولآلة التغليف."],["PRODUCTION","ملفات جاهزة للمطبعة","فصل ألوان، تراكب، نزيف وعلامات قص وفق متطلبات كل مطبعة."]]},
 team:{eyebrow:"الفريق",h2:"خمسة متخصصين، مسار واحد متكامل",p:"كل مرحلة في عبوتك يتولاها خبير في مجاله، ويتسلّمها الخبير التالي دون أن يضيع شيء في الطريق.",
  members:[
   {ic:"eye",t:"المدير الإبداعي",en:"Creative Director",d:"يحدد الاتجاه الإبداعي والهوية البصرية ولغة العلامة على العبوة.",tags:["الهوية","الاتجاه الفني","العلامة"]},
   {ic:"pack",t:"مصمم العبوات",en:"Packaging Designer",d:"يصمم واجهات العلب والعبوات ويحوّل الهوية إلى تصميم يعمل على الرف.",tags:["تصميم العلب","الملصقات","الرف"]},
   {ic:"struct",t:"مهندس العبوات الإنشائية",en:"Structural Packaging Engineer",d:"يرسم الفرد وأنظمة القص والطي والقفل، ويختبرها بعينات فعلية.",tags:["الفرد","القص والطي","العينات"]},
   {ic:"press",t:"أخصائي ما قبل الطباعة والإنتاج",en:"Prepress & Production",d:"يجهز الملفات الفنية ويطابق الألوان ويضمن توافقها مع متطلبات المطبعة.",tags:["فصل الألوان","البروفات","المطابقة"]},
   {ic:"cube",t:"أخصائي المجسمات ثلاثية الأبعاد",en:"3D / Visualization",d:"يبني مجسمات واقعية وعروضاً للمنتج قبل الطباعة لاعتماد التصميم بثقة.",tags:["3D","المحاكاة","العرض"]}]},
 services:{eyebrow:"الخدمات",h2:"كل ما تحتاجه العبوة، تحت سقف واحد",p:"اختر خدمة واحدة أو المسار الكامل. كل خدمة تُسلَّم بملفات مصدرية منظمة وجاهزة للاستخدام.",
  items:[
   ["pack","تصميم العبوات","Packaging Design","تصميم متكامل للعبوة يعكس هوية المنتج ويجذب المشتري.",["دراسة المنافسين","تصميم الواجهات","نسخ متعددة للأحجام"]],
   ["box","تصميم العلب","Box Design","علب منتجات وعلب هدايا وعلب عرض بتصاميم مدروسة.",["علب طي","علب هدايا","علب عرض"]],
   ["struct","التصميم الإنشائي","Structural Design","هيكل العلبة ونظام الإغلاق والتقوية حسب وزن المنتج.",["أقفال وألسنة","فواصل داخلية","اختبار التحمل"]],
   ["die","الفرد وقوالب القص","Die-Cut / Dieline","ملفات فرد دقيقة بخطوط القص والطي والنزيف.",["خطوط قص وطي","مقاسات بالمليمتر","ملفات للمكبس"]],
   ["brand","الهوية البصرية","Branding","شعار ونظام ألوان وخطوط يعمل على العبوة وخارجها.",["الشعار","دليل الهوية","تطبيقات"]],
   ["cube","المجسمات ثلاثية الأبعاد","3D Mockups","عرض واقعي للعبوة من كل الزوايا قبل الإنتاج.",["صور عرض","دوران 360°","مشاهد تسويقية"]],
   ["press","التجهيز للطباعة","Print Preparation","ملفات نهائية وفق مواصفات المطبعة وطريقة الطباعة.",["CMYK و Pantone","تراكب ونزيف","بروفات لونية"]],
   ["truck","متابعة الإنتاج","Production Support","متابعة مع المطبعة حتى استلام الدفعة الأولى.",["اختيار المطبعة","فحص العينة","اعتماد الإنتاج"]]]},
 featured:{eyebrow:"مشاريع مختارة",h2:"أعمال تتحدث عن نفسها",p:"دراسات حالة كاملة: من المشكلة إلى الفرد إلى العبوة على الرف.",view:"عرض دراسة الحالة"},
 gallery:{eyebrow:"المعرض",h2:"معرض الأعمال الكامل",p:"صفِّ الأعمال حسب القطاع واضغط على أي مشروع لعرض تفاصيله.",all:"الكل"},
 sample:"محتوى تجريبي · يُستبدل من لوحة التحكم",
 cats:{food:"أغذية",coffee:"قهوة",cosmetics:"مستحضرات تجميل",pharma:"أدوية",retail:"تجزئة",premium:"علب فاخرة",carton:"كرتون",branding:"هوية بصرية",special:"مشاريع خاصة"},
 proj:{hadaba:["بُن الهضبة","محمصة قهوة مختصة","علبة قهوة طويلة بغطاء وإطار نحاسي للعلامة."],lama:["لمى","علامة عناية بالبشرة","مجموعة علب سيروم بألوان هادئة وطباعة ناعمة الملمس."],sultan:["حلويات السلطان","محل حلويات شرقية","علبة صلبة فاخرة بغطاء منفصل وتذهيب حراري."],naqaa:["نقاء فارما","شركة أدوية","علبة دواء واضحة المعلومات مع طباعة برايل."],waha:["تمور الواحة","مزرعة تمور","علبة تمور مسطحة بنافذة عرض وفواصل داخلية."],reef:["سوق الريف","متجر منتجات ريفية","علب كرافت بطباعة لون واحد صديقة للبيئة."],misk:["مِسك","دار عطور","علبة عطر بإغلاق مغناطيسي وبطانة مخملية."],sabah:["مخبز الصباح","مخبز ومعجنات","علب معجنات بطباعة لونين وقفل سريع بدون غراء."],mailer:["علبة الشحن","متجر إلكتروني","علبة شحن مموجة بقفل ذاتي وطباعة داخلية."],karma:["كرمة","علامة زيوت طبيعية","هوية بصرية كاملة ونظام عبوات لخمسة منتجات."],origin:["أوريجن","قهوة أحادية المصدر","علب عينات قهوة بنظام ألوان لكل بلد منشأ."],zaytoun:["زيتون","معصرة زيت زيتون","علبة زجاجة زيت بفتحة عرض وقاعدة مقوّاة."]},
 lb:{client:"العميل",cat:"القطاع",dims:"المقاس (مم)",mat:"الخامة",fin:"التشطيب",svc:"الخدمات",prev:"السابق",next:"التالي",close:"إغلاق"},
 process:{eyebrow:"آلية العمل",h2:"ست مراحل واضحة من الفكرة إلى الإنتاج",p:"اضغط على أي مرحلة لتعرف ما يحدث فيها وما تستلمه في نهايتها.",deliver:"ما تستلمه",
  steps:[
   ["الاستكشاف","Discovery","نفهم المنتج والسوق والمنافسين وقيود الإنتاج والميزانية قبل أي رسم.",["ملخص المشروع","تحليل المنافسين","قائمة المتطلبات الفنية"],"2–3 أيام"],
   ["الفكرة","Concept","نطوّر اتجاهين أو ثلاثة اتجاهات إبداعية مع لوحات إلهام ومسودات أولية.",["اتجاهات إبداعية","لوحات إلهام","اختيار الاتجاه"],"3–5 أيام"],
   ["التصميم","Design","نبني التصميم الكامل لكل أوجه العبوة مع النصوص والرموز والباركود.",["تصميم كل الأوجه","النصوص الإلزامية","جولتا تعديل"],"5–7 أيام"],
   ["التصميم الإنشائي","Structural","نرسم الفرد ونختبر الطي والإغلاق بعينة بيضاء قبل اعتماد المقاسات.",["ملف الفرد","عينة بيضاء","مقاسات معتمدة"],"3–4 أيام"],
   ["المجسم ثلاثي الأبعاد","3D Visualization","نعرض العبوة بشكل واقعي من كل الزوايا لاعتمادها قبل الطباعة.",["صور عرض","ملف دوران","صور للمتجر الإلكتروني"],"2–3 أيام"],
   ["تجهيز الإنتاج","Production Prep","نجهز الملفات النهائية ونتابع البروفة اللونية وعينة المطبعة.",["ملفات نهائية","بروفة لونية","متابعة الدفعة الأولى"],"3–5 أيام"]]},
 materials:{eyebrow:"الخامات والتشطيب",h2:"الخامة جزء من التصميم",p:"نختار الورق والكرتون والتشطيب حسب المنتج وطريقة العرض وتكلفة الإنتاج.",
  mats:{kraft:["كرافت","250–400 g/m²","ملمس طبيعي ولون بني، مناسب للمنتجات العضوية."],sbs:["SBS أبيض","230–350 g/m²","أبيض من الوجهين، أفضل نتيجة للطباعة الدقيقة."],duplex:["دوبلكس","250–450 g/m²","وجه أبيض وظهر رمادي، اقتصادي للعلب اليومية."],corr:["كرتون مموج","E · B · C flute","طبقات مموجة للشحن والحماية والوزن الثقيل."],fbb:["كرتون طي","235–380 g/m²","خفيف وصلب، الخيار الأشيع لعلب التجزئة."],rigid:["علب صلبة","1.5–3 mm board","كرتون مضغوط مغلف بورق فاخر، للهدايا والعطور."]},
  finTitle:"خيارات التشطيب",finP:"تأثيرات تُضاف بعد الطباعة لتمنح العبوة ملمساً ولمعاناً مختلفاً.",
  fins:{matte:["مطفي","سطح هادئ بلا انعكاس"],gloss:["لامع","ألوان أعمق وانعكاس واضح"],foil:["تذهيب حراري","رقائق معدنية ذهبية أو فضية"],emboss:["نقش بارز","عناصر مرتفعة عن السطح"],deboss:["نقش غائر","عناصر منخفضة داخل السطح"],spot:["UV موضعي","لمعان على عناصر محددة"],soft:["ملمس مخملي","طبقة ناعمة كالمخمل"],die:["قص بالقالب","أشكال ونوافذ مقصوصة بدقة"]}},
 ba:{eyebrow:"قبل / بعد",h2:"الفرق يظهر على الرف",p:"اسحب المؤشر لترى كيف تغيّرت العبوة بعد إعادة التصميم.",before:"BEFORE",after:"AFTER",
  cases:[["بُن الهضبة","قهوة"],["نقاء فارما","أدوية"]],
  notes:[["01","هوية واضحة تُقرأ من مترين على الرف."],["02","فرد جديد وفّر 12% من مساحة الورق في الفرخ."],["03","تشطيب مطفي مع UV موضعي على الشعار."]]},
 video:{eyebrow:"فيديو",h2:"شاهد كيف تُصنع العبوة",p:"عروض قصيرة لمراحل العمل والمجسمات. تُرفع الفيديوهات أو تُربط بروابط خارجية من لوحة التحكم.",play:"تشغيل",
  note:"هنا يظهر الفيديو المرفوع من مكتبة الوسائط أو رابط خارجي. يمكن استبداله أو حذفه من لوحة التحكم دون تعديل الكود.",
  items:[["من الفرد إلى العبوة","1:24","طي علبة بلسان عكسي خطوة بخطوة"],["جولة عرض 360°","0:48","مجسم ثلاثي الأبعاد لعلبة فاخرة"],["من داخل المطبعة","2:10","متابعة البروفة وعينة الإنتاج"]]},
 stats:[["+7","سنوات خبرة في الطباعة والتغليف"],["+350","مشروع عبوة وهوية"],["9","قطاعات صناعية"],["48","ساعة لأول مسودة","h"]],
 tst:{eyebrow:"آراء العملاء",h2:"ماذا يقول من عمل معنا",
  items:[["الفريق فهم المنتج من أول اجتماع. وصلتنا ملفات الفرد جاهزة والمطبعة لم تطلب أي تعديل.","صاحب محمصة","قطاع القهوة"],["المجسمات ثلاثية الأبعاد ساعدتنا نعتمد التصميم ونبدأ التسويق قبل وصول الطباعة.","مديرة تسويق","مستحضرات تجميل"],["أعادوا تصميم علبة الشحن فخفّ الوزن وقلّ التالف أثناء التوصيل.","مدير عمليات","متجر إلكتروني"]]},
 cta:{h2:"جاهز تحوّل فكرتك إلى عبوة؟",p:"أرسل لنا تفاصيل المنتج ومقاساته، ونعود إليك خلال يوم عمل بخطة وجدول زمني.",c1:"اطلب عرض سعر",c2:"شاهد المراحل"},
 contact:{eyebrow:"تواصل",h2:"لنبدأ مشروعك",p:"املأ النموذج وأرفق أي ملفات لديك: صور المنتج، الشعار، أو فرد قديم.",
  info:[["البريد","يُضبط من الإعدادات"],["واتساب","يُضبط من الإعدادات"],["الموقع","فلسطين · نخدم الخليج والمنطقة"],["ساعات العمل","الأحد – الخميس · 9:00 – 17:00"]],
  f:{name:"الاسم",company:"الشركة",email:"البريد الإلكتروني",phone:"رقم الهاتف",type:"نوع المشروع",budget:"الميزانية التقريبية",msg:"تفاصيل المشروع",files:"المرفقات",choose:"اختر…",
   types:["تصميم عبوة","تصميم علبة","فرد وقالب قص","هوية بصرية","مجسم ثلاثي الأبعاد","تجهيز للطباعة","مسار كامل"],
   budgets:["أقل من 500 $","500 – 1,500 $","1,500 – 5,000 $","أكثر من 5,000 $","غير محدد"],
   drop:"اسحب الملفات هنا أو اضغط للاختيار",dropSmall:"PDF · AI · PSD · ZIP · JPG · PNG · WEBP — حتى 25 MB للملف، 5 ملفات كحد أقصى",
   send:"إرسال الطلب",privacy:"بياناتك تُستخدم للرد على طلبك فقط.",
   req:"هذا الحقل مطلوب",badEmail:"تحقق من صيغة البريد الإلكتروني",badPhone:"أدخل رقماً صحيحاً",badType:"نوع الملف غير مدعوم",tooBig:"أكبر من 25 MB",tooMany:"الحد الأقصى 5 ملفات",
   ok:"تم تجهيز الطلب بنجاح. في النسخة النهائية يُحفظ الطلب في لوحة التحكم ويُرسل إشعار بالبريد."}},
 footer:{about:"استوديو تصميم وهندسة عبوات. من الفكرة إلى العبوة الجاهزة للتنفيذ.",cols:[["الموقع",[["#about","من نحن"],["#team","الفريق"],["#work","الأعمال"],["#process","المراحل"]]],["الخدمات",[["#services","تصميم العبوات"],["#services","الفرد وقوالب القص"],["#services","المجسمات"],["#services","التجهيز للطباعة"]]],["تابعنا",[["#","Instagram"],["#","Behance"],["#","LinkedIn"],["#","WhatsApp"]]]],rights:"© 2026 تيتان باك. جميع الحقوق محفوظة.",made:"تصميم وتطوير فريق تيتان باك"},
 tc:{fab:"تخصيص الهوية",title:"محرّك الثيمات",sub:"معاينة مباشرة لما سيتحكم به المالك من لوحة التحكم.",primary:"اللون الأساسي",accent:"اللون المميز",font:"خط العناوين",radius:"استدارة الزوايا",motion:"الحركة والانتقالات",theme:"المظهر",light:"فاتح",dark:"داكن",auto:"تلقائي",reset:"استعادة الافتراضي",
  note:"هذه لوحة تجريبية داخل النموذج. في المنصة الكاملة تُحفظ التغييرات كمسودة، ثم معاينة، ثم نشر، مع سجل للإصدارات."}
},
en:{
 dir:"ltr",lang:"en",switchTo:"ع",
 brand:"Titan Pack",
 nav:[["#about","About"],["#team","Team"],["#services","Services"],["#work","Work"],["#process","Process"],["#materials","Materials"],["#contact","Contact"]],
 ctaNav:"Start a project",
 hero:{eyebrow:"PACKAGING · STRUCTURE · PREPRESS",h1:'We design the package that gets your product <em>seen</em> before it’s opened.',desc:"A team of five specialists that takes your product from first idea to a press-ready dieline: design, structural engineering, 3D visualization and production prep.",c1:"Start a project",c2:"See our work",
  specs:[["5","specialists, one team"],["6","stages, idea to press"],["0.1 mm","dieline precision"]],
  flat:"Flat dieline",solid:"Folded",meta:"Reverse tuck end · 60×30×90 mm",cut:"Cut",crease:"Crease"},
 intro:{eyebrow:"About",lead:'Titan Pack is a studio for packaging design and engineering. We pair <mark>visual craft</mark> with <mark>technical precision</mark> so your package reaches the production line exactly as you pictured it.',
  pillars:[["DESIGN","Design that sells","Shelf-ready identity that catches the eye and explains the product in seconds."],["ENGINEERING","Structures that fold right","Dielines built for cutting, folding and assembly, matched to the board and the line."],["PRODUCTION","Press-ready files","Separations, trapping, bleed and marks set to each printer’s specs."]]},
 team:{eyebrow:"Team",h2:"Five specialists, one continuous workflow",p:"Each stage of your package is owned by an expert, then handed to the next without anything lost along the way.",
  members:[
   {ic:"eye",t:"Creative Director",en:"المدير الإبداعي",d:"Sets the creative direction, visual identity and brand voice on pack.",tags:["Identity","Art direction","Brand"]},
   {ic:"pack",t:"Packaging Designer",en:"مصمم العبوات",d:"Designs boxes and product packaging, turning the brand into shelf impact.",tags:["Box design","Labels","Shelf"]},
   {ic:"struct",t:"Structural Packaging Engineer",en:"مهندس إنشائي",d:"Draws dielines, cutting, folding and locking systems, then tests them in white samples.",tags:["Dielines","Cut & fold","Samples"]},
   {ic:"press",t:"Prepress & Production Specialist",en:"ما قبل الطباعة",d:"Prepares technical files, matches color and checks them against printer requirements.",tags:["Separations","Proofs","Matching"]},
   {ic:"cube",t:"3D / Visualization Specialist",en:"المجسمات",d:"Builds realistic 3D mockups so designs are approved with confidence before print.",tags:["3D","Rendering","Presentation"]}]},
 services:{eyebrow:"Services",h2:"Everything a package needs, under one roof",p:"Pick a single service or the full path. Every service ships with organized, ready-to-use source files.",
  items:[
   ["pack","Packaging Design","تصميم العبوات","End-to-end pack design that reflects the product and wins the buyer.",["Competitor audit","Panel design","Size variants"]],
   ["box","Box Design","تصميم العلب","Product, gift and display boxes with considered graphics.",["Folding cartons","Gift boxes","Display boxes"]],
   ["struct","Structural Design","التصميم الإنشائي","Box structure, closures and reinforcement sized to the product’s weight.",["Locks & tucks","Inserts","Load testing"]],
   ["die","Die-Cut / Dieline","الفرد","Precise dieline files with cut, crease and bleed lines.",["Cut & crease","Metric dimensions","Die-maker files"]],
   ["brand","Branding","الهوية","Logo, color and type systems that work on pack and beyond.",["Logo","Brand guide","Applications"]],
   ["cube","3D Mockups","المجسمات","Photoreal views of the package from every angle before production.",["Renders","360° spins","Marketing scenes"]],
   ["press","Print Preparation","التجهيز للطباعة","Final files to the printer’s spec and print method.",["CMYK & Pantone","Trap & bleed","Color proofs"]],
   ["truck","Production Support","متابعة الإنتاج","We stay with the printer until the first run is delivered.",["Printer selection","Sample check","Run sign-off"]]]},
 featured:{eyebrow:"Selected work",h2:"Work that speaks for itself",p:"Full case studies: from the problem, to the dieline, to the package on the shelf.",view:"View case study"},
 gallery:{eyebrow:"Gallery",h2:"Full project gallery",p:"Filter by industry and open any project to see its details.",all:"All"},
 sample:"Sample content · replaced from the dashboard",
 cats:{food:"Food",coffee:"Coffee",cosmetics:"Cosmetics",pharma:"Pharmaceutical",retail:"Retail",premium:"Premium boxes",carton:"Carton",branding:"Branding",special:"Special projects"},
 proj:{hadaba:["Hadaba Coffee","Specialty roaster","Tall coffee canister box with a copper frame for the mark."],lama:["Lama","Skincare brand","Serum box family in calm tones with soft-touch print."],sultan:["Sultan Sweets","Oriental sweets shop","Rigid luxury box with separate lid and hot-foil stamping."],naqaa:["Naqaa Pharma","Pharmaceutical company","Clear-information medicine carton with Braille."],waha:["Waha Dates","Date farm","Flat date box with display window and inserts."],reef:["Reef Market","Rural goods store","Single-color kraft boxes, recyclable throughout."],misk:["Misk","Perfume house","Perfume box with magnetic closure and velvet lining."],sabah:["Sabah Bakery","Bakery","Two-color pastry boxes with a glue-free quick lock."],mailer:["Ship Mailer","Online store","Self-locking corrugated mailer with inside print."],karma:["Karma","Natural oils brand","Full identity and a pack system for five products."],origin:["Origin","Single-origin coffee","Coffee sample boxes color-coded by origin."],zaytoun:["Zaytoun","Olive oil press","Bottle carton with a display cut-out and reinforced base."]},
 lb:{client:"Client",cat:"Industry",dims:"Size (mm)",mat:"Material",fin:"Finishing",svc:"Services",prev:"Previous",next:"Next",close:"Close"},
 process:{eyebrow:"Process",h2:"Six clear stages from idea to production",p:"Select a stage to see what happens in it and what you receive at the end.",deliver:"You receive",
  steps:[
   ["Discovery","الاستكشاف","We learn the product, market, competitors, production limits and budget before drawing anything.",["Project brief","Competitor review","Technical requirements"],"2–3 days"],
   ["Concept","الفكرة","We develop two or three creative directions with mood boards and first sketches.",["Creative directions","Mood boards","Direction sign-off"],"3–5 days"],
   ["Design","التصميم","We build every panel of the pack with copy, symbols and barcodes.",["All panels designed","Mandatory copy","Two revision rounds"],"5–7 days"],
   ["Structural Design","الإنشائي","We draw the dieline and test folding and closure with a white sample before sizes are fixed.",["Dieline file","White sample","Approved dimensions"],"3–4 days"],
   ["3D Visualization","المجسم","We show the pack realistically from every angle for approval before print.",["Renders","Spin file","E-commerce images"],"2–3 days"],
   ["Production Prep","الإنتاج","We prepare final files and follow the color proof and the printer’s sample.",["Final files","Color proof","First-run follow-up"],"3–5 days"]]},
 materials:{eyebrow:"Materials & finishing",h2:"The board is part of the design",p:"We choose paper, board and finishing to suit the product, the display and the production cost.",
  mats:{kraft:["Kraft","250–400 g/m²","Natural brown texture, suited to organic products."],sbs:["SBS white","230–350 g/m²","White both sides; the best base for fine print."],duplex:["Duplex","250–450 g/m²","White face, grey back; economical for everyday boxes."],corr:["Corrugated","E · B · C flute","Fluted layers for shipping, protection and weight."],fbb:["Folding carton","235–380 g/m²","Light and stiff; the most common retail carton."],rigid:["Rigid box","1.5–3 mm board","Wrapped chipboard for gifts and fragrance."]},
  finTitle:"Finishing options",finP:"Effects added after print to give the pack a different feel and sheen.",
  fins:{matte:["Matte","Calm, non-reflective surface"],gloss:["Gloss","Deeper color, clear reflection"],foil:["Hot foil","Gold or silver metallic foil"],emboss:["Emboss","Raised elements"],deboss:["Deboss","Pressed-in elements"],spot:["Spot UV","Gloss on selected elements"],soft:["Soft touch","Velvet-like coating"],die:["Die cutting","Precisely cut shapes and windows"]}},
 ba:{eyebrow:"Before / After",h2:"The difference shows on the shelf",p:"Drag the handle to see how the package changed after the redesign.",before:"BEFORE",after:"AFTER",
  cases:[["Hadaba Coffee","Coffee"],["Naqaa Pharma","Pharma"]],
  notes:[["01","A clear identity that reads from two meters away."],["02","A new dieline saved 12% of board on the press sheet."],["03","Matte finish with spot UV on the mark."]]},
 video:{eyebrow:"Video",h2:"See how a package is made",p:"Short films of the workflow and 3D mockups. Videos are uploaded or linked from the dashboard.",play:"Play",
  note:"The uploaded video or external link plays here. It can be replaced or removed from the dashboard without touching code.",
  items:[["From dieline to box","1:24","Folding a reverse tuck end, step by step"],["360° showcase","0:48","3D mockup of a luxury box"],["Inside the print shop","2:10","Following the proof and production sample"]]},
 stats:[["7+","years in print & packaging"],["350+","packaging and identity projects"],["9","industries served"],["48","hours to first draft","h"]],
 tst:{eyebrow:"Testimonials",h2:"What clients say",
  items:[["They understood the product from the first meeting. The dielines arrived ready and the printer asked for no changes.","Roastery owner","Coffee"],["The 3D mockups let us approve the design and start marketing before the print run arrived.","Marketing manager","Cosmetics"],["They redesigned our shipping box; it got lighter and damage in delivery dropped.","Operations manager","E-commerce"]]},
 cta:{h2:"Ready to turn your idea into a package?",p:"Send us the product details and sizes, and we’ll reply within one working day with a plan and timeline.",c1:"Request a quote",c2:"See the process"},
 contact:{eyebrow:"Contact",h2:"Let’s start your project",p:"Fill in the form and attach anything you have: product photos, your logo, or an old dieline.",
  info:[["Email","Set in Settings"],["WhatsApp","Set in Settings"],["Location","Palestine · serving the Gulf & region"],["Hours","Sun – Thu · 9:00 – 17:00"]],
  f:{name:"Name",company:"Company",email:"Email",phone:"Phone",type:"Project type",budget:"Approximate budget",msg:"Project details",files:"Attachments",choose:"Choose…",
   types:["Packaging design","Box design","Dieline & die","Branding","3D mockup","Print preparation","Full path"],
   budgets:["Under $500","$500 – 1,500","$1,500 – 5,000","Over $5,000","Not sure"],
   drop:"Drop files here or click to choose",dropSmall:"PDF · AI · PSD · ZIP · JPG · PNG · WEBP — up to 25 MB each, 5 files max",
   send:"Send request",privacy:"Your details are used only to reply to your request.",
   req:"This field is required",badEmail:"Check the email format",badPhone:"Enter a valid number",badType:"File type not supported",tooBig:"Larger than 25 MB",tooMany:"Maximum 5 files",
   ok:"Request prepared. In the full build it’s saved to the dashboard and an email notification is sent."}},
 footer:{about:"A packaging design and engineering studio. From the idea to the production-ready package.",cols:[["Site",[["#about","About"],["#team","Team"],["#work","Work"],["#process","Process"]]],["Services",[["#services","Packaging design"],["#services","Dielines"],["#services","3D mockups"],["#services","Print preparation"]]],["Follow",[["#","Instagram"],["#","Behance"],["#","LinkedIn"],["#","WhatsApp"]]]],rights:"© 2026 Titan Pack. All rights reserved.",made:"Designed & built by Titan Pack"},
 tc:{fab:"Customize",title:"Theme engine",sub:"A live preview of what the owner will control from the dashboard.",primary:"Primary color",accent:"Accent color",font:"Heading font",radius:"Corner radius",motion:"Motion & transitions",theme:"Appearance",light:"Light",dark:"Dark",auto:"Auto",reset:"Reset to default",
  note:"A demo panel inside the prototype. In the full platform, changes save as a draft, then preview, then publish, with version history."}
}};
const PROJ_META={hadaba:{mat:"fbb",fin:["matte","foil"],svc:[0,4,6]},lama:{mat:"sbs",fin:["soft","spot"],svc:[0,5]},sultan:{mat:"rigid",fin:["foil","emboss"],svc:[1,2,5]},naqaa:{mat:"sbs",fin:["gloss","emboss"],svc:[0,6]},waha:{mat:"duplex",fin:["matte","die"],svc:[1,2,3]},reef:{mat:"kraft",fin:["matte"],svc:[0,4]},misk:{mat:"rigid",fin:["soft","foil","deboss"],svc:[1,2,5]},sabah:{mat:"fbb",fin:["gloss","die"],svc:[2,3]},mailer:{mat:"corr",fin:["die"],svc:[2,3,7]},karma:{mat:"fbb",fin:["matte","spot"],svc:[4,0]},origin:{mat:"duplex",fin:["matte"],svc:[0,6]},zaytoun:{mat:"sbs",fin:["gloss","die"],svc:[0,2,3]}};

/* ---------- packaging render generator (isometric SVG) ---------- */
const SHAPES={cube:[1,1,1],tall:[.72,.72,1.75],wide:[1.7,1.2,.42],bar:[1.5,.62,.85],flat:[1.55,1.3,.3]};
function shade(hex,amt){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=v=>Math.max(0,Math.min(255,Math.round(amt<0?v*(1+amt):v+(255-v)*amt)));return"#"+[f(r),f(g),f(b)].map(v=>v.toString(16).padStart(2,"0")).join("")}
let uid=0;
function boxArt(p,W=400,H=300,opt={}){
 const [w,d,h]=SHAPES[p.shape]; const c=.866;
 const P=(x,y,z)=>[(x-z)*c,(x+z)*.5-y];
 const V=[P(0,0,d),P(w,0,d),P(w,0,0),P(0,h,0),P(w,h,0),P(w,h,d),P(0,h,d)];
 const xs=V.map(v=>v[0]),ys=V.map(v=>v[1]);
 const bw=Math.max(...xs)-Math.min(...xs),bh=Math.max(...ys)-Math.min(...ys);
 const s=Math.min(W*.56/bw,H*.64/bh); const ox=W/2-(Math.min(...xs)+bw/2)*s, oy=H*.5-(Math.min(...ys)+bh/2)*s+H*.02;
 const Q=(x,y,z)=>{const q=P(x,y,z);return[(q[0]*s+ox).toFixed(1),(q[1]*s+oy).toFixed(1)]};
 const poly=a=>a.map(q=>q.join(",")).join(" ");
 const A=[Q(0,0,d),Q(w,0,d),Q(w,h,d),Q(0,h,d)], B=[Q(w,0,0),Q(w,0,d),Q(w,h,d),Q(w,h,0)], T=[Q(0,h,0),Q(w,h,0),Q(w,h,d),Q(0,h,d)];
 const mA=`matrix(${(c*s).toFixed(3)},${(.5*s).toFixed(3)},0,${s.toFixed(3)},${Q(0,h,d).join(",")})`;
 const mB=`matrix(${(c*s).toFixed(3)},${(-.5*s).toFixed(3)},0,${s.toFixed(3)},${Q(w,h,d).join(",")})`;
 const mT=`matrix(${(c*s).toFixed(3)},${(.5*s).toFixed(3)},${(-c*s).toFixed(3)},${(.5*s).toFixed(3)},${Q(0,h,0).join(",")})`;
 const id="a"+(++uid);
 // artwork on the front face (local units: u 0..w, v 0..h)
 const fw=w,fh=h,fs=Math.min(fw,fh);
 let art="";
 const lbl=`<text x="${fw/2}" y="${fh*.56}" text-anchor="middle" font-family="Alexandria,sans-serif" font-weight="800" font-size="${(fs*.17).toFixed(3)}" letter-spacing="${(fs*.012).toFixed(3)}" fill="${p.c3}">${esc(p.lbl)}</text>`;
 const sub=`<text x="${fw/2}" y="${fh*.56+fs*.12}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="${(fs*.055).toFixed(3)}" letter-spacing="${(fs*.01).toFixed(3)}" fill="${p.c3}" opacity=".75">${esc(p.sub||"EST. 2026")}</text>`;
 switch(p.pat){
  case"band":art=`<rect width="${fw}" height="${fh}" fill="${p.c1}"/><rect y="${fh*.36}" width="${fw}" height="${fh*.34}" fill="${p.c2}"/>${lbl.replace(p.c3,p.c1)}${sub.replace(p.c3,p.c1)}<circle cx="${fw/2}" cy="${fh*.2}" r="${fs*.07}" fill="none" stroke="${p.c2}" stroke-width="${fs*.012}"/>`;break;
  case"arc":art=`<rect width="${fw}" height="${fh}" fill="${p.c1}"/><circle cx="${fw/2}" cy="${fh*1.02}" r="${fw*.62}" fill="${p.c2}"/><circle cx="${fw*.5}" cy="${fh*.24}" r="${fs*.05}" fill="${p.c2}"/>${lbl}${sub}`;break;
  case"frame":art=`<rect width="${fw}" height="${fh}" fill="${p.c1}"/><rect x="${fs*.07}" y="${fs*.07}" width="${fw-fs*.14}" height="${fh-fs*.14}" fill="none" stroke="${p.c2}" stroke-width="${fs*.012}"/><rect x="${fs*.1}" y="${fs*.1}" width="${fw-fs*.2}" height="${fh-fs*.2}" fill="none" stroke="${p.c2}" stroke-width="${fs*.004}"/>${lbl}${sub}`;break;
  case"split":art=`<rect width="${fw}" height="${fh}" fill="${p.c1}"/><path d="M0 ${fh*.62} L${fw} ${fh*.3} L${fw} ${fh} L0 ${fh}Z" fill="${p.c2}"/><rect x="${fw*.08}" y="${fh*.1}" width="${fs*.14}" height="${fs*.14}" fill="${p.c2}"/><rect x="${fw*.08+fs*.045}" y="${fh*.1+fs*.018}" width="${fs*.05}" height="${fs*.104}" fill="${p.c1}"/><rect x="${fw*.08+fs*.018}" y="${fh*.1+fs*.045}" width="${fs*.104}" height="${fs*.05}" fill="${p.c1}"/>${lbl.replace(`y="${fh*.56}"`,`y="${fh*.4}"`).replace(`text-anchor="middle"`,`text-anchor="start"`).replace(`x="${fw/2}"`,`x="${fw*.08}"`)}`;break;
  case"dots":{let dots="";for(let i=0;i<7;i++)for(let j=0;j<11;j++)dots+=`<circle cx="${(i+.5)*fw/7}" cy="${(j+.5)*fh/11}" r="${fs*.018}" fill="${p.c2}" opacity=".55"/>`;art=`<rect width="${fw}" height="${fh}" fill="${p.c1}"/>${dots}<rect x="${fw*.12}" y="${fh*.4}" width="${fw*.76}" height="${fs*.3}" rx="${fs*.03}" fill="${p.c1}"/>${lbl.replace(`y="${fh*.56}"`,`y="${fh*.4+fs*.2}"`)}`;break}
  case"stripes":{let st="";for(let i=0;i<10;i+=2)st+=`<rect x="${i*fw/10}" width="${fw/10}" height="${fh}" fill="${p.c2}"/>`;art=`<rect width="${fw}" height="${fh}" fill="${p.c1}"/>${st}<ellipse cx="${fw/2}" cy="${fh/2}" rx="${fw*.3}" ry="${fh*.34}" fill="${p.c1}"/>${lbl.replace(`y="${fh*.56}"`,`y="${fh*.56}"`).replace(/fill="[^"]+">/,`fill="${p.c3}">`)}`;break}
  case"kraft":art=`<rect width="${fw}" height="${fh}" fill="${p.c1}"/><circle cx="${fw/2}" cy="${fh/2}" r="${fs*.26}" fill="none" stroke="${p.c2}" stroke-width="${fs*.02}"/><circle cx="${fw/2}" cy="${fh/2}" r="${fs*.21}" fill="none" stroke="${p.c2}" stroke-width="${fs*.006}" stroke-dasharray="${fs*.02} ${fs*.015}"/>${lbl.replace(`y="${fh*.56}"`,`y="${fh/2+fs*.05}"`).replace(/fill="[^"]+">/,`fill="${p.c2}">`).replace(/font-size="[^"]+"/,`font-size="${(fs*.11).toFixed(3)}"`)}`;break;
  default:art=`<rect width="${fw}" height="${fh}" fill="${p.c1}"/><text x="${fw/2}" y="${fh*.52}" text-anchor="middle" font-family="Arial,sans-serif" font-size="${fs*.12}" fill="${p.c3}">${esc(p.lbl)}</text><rect x="${fw*.3}" y="${fh*.6}" width="${fw*.4}" height="${fs*.03}" fill="${p.c3}" opacity=".5"/>`;
 }
 const side=p.pat==="kraft"?`<rect width="${d}" height="${h}" fill="${p.c1}"/><rect y="${h*.8}" width="${d}" height="${h*.2}" fill="${p.c2}" opacity=".85"/>`:
   `<rect width="${d}" height="${h}" fill="${p.pat==="band"||p.pat==="arc"?p.c2:p.c1}"/><text x="${d/2}" y="${h/2}" text-anchor="middle" transform="rotate(90 ${d/2} ${h/2})" font-family="IBM Plex Mono,monospace" font-size="${Math.min(d,h)*.09}" letter-spacing="${Math.min(d,h)*.02}" fill="${p.pat==="band"||p.pat==="arc"?p.c1:p.c2}">${esc(p.lbl)}</text>`;
 const top=`<rect width="${w}" height="${d}" fill="${p.pat==="frame"?p.c1:shade(p.c1,.08)}"/>${p.pat==="frame"?`<rect x="${Math.min(w,d)*.08}" y="${Math.min(w,d)*.08}" width="${w-Math.min(w,d)*.16}" height="${d-Math.min(w,d)*.16}" fill="none" stroke="${p.c2}" stroke-width="${Math.min(w,d)*.01}"/>`:""}`;
 const grid=opt.grid===false?"":`<pattern id="${id}g" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="${shade(p.bg,-.1)}" stroke-width=".6"/></pattern><rect width="${W}" height="${H}" fill="url(#${id}g)" opacity=".7"/>`;
 const floor=Q(w/2,0,d/2);
 return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(opt.alt||p.lbl)}"><defs><clipPath id="${id}a"><rect width="${w}" height="${h}"/></clipPath><clipPath id="${id}b"><rect width="${d}" height="${h}"/></clipPath><linearGradient id="${id}s" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient></defs>
 <rect width="${W}" height="${H}" fill="${p.bg}"/>${grid}
 <ellipse cx="${floor[0]}" cy="${(+floor[1]+s*.06).toFixed(1)}" rx="${(s*(w+d)*.62).toFixed(1)}" ry="${(s*(w+d)*.16).toFixed(1)}" fill="#000" opacity=".16" style="filter:blur(6px)"/>
 <g transform="${mA}" clip-path="url(#${id}a)">${art}</g><polygon points="${poly(A)}" fill="url(#${id}s)"/>
 <g transform="${mB}" clip-path="url(#${id}b)">${side}</g><polygon points="${poly(B)}" fill="#000" opacity=".22"/>
 <g transform="${mT}">${top}</g><polygon points="${poly(T)}" fill="#fff" opacity=".12"/>
 <polyline points="${poly([Q(0,h,d),Q(w,h,d),Q(w,h,0)])}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1"/>
 <line x1="${Q(w,0,d)[0]}" y1="${Q(w,0,d)[1]}" x2="${Q(w,h,d)[0]}" y2="${Q(w,h,d)[1]}" stroke="#fff" stroke-opacity=".25"/>
 </svg>`;
}

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
 setupBG(); setupReveal();
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
 const cases=[[{shape:"tall",pat:"plain",bg:"#DAD8D2",c1:"#C9C6BD",c2:"#aaa",c3:"#5d5d5d",lbl:"COFFEE"},{...PROJECTS[0],bg:"#E9DCC6"}],[{shape:"bar",pat:"plain",bg:"#DADDDD",c1:"#F1F1EE",c2:"#aaa",c3:"#8b8b8b",lbl:"TABLETS 20"},{...PROJECTS[3]}]];
 return boxArt(cases[baIdx][after],640,480,{alt:after?"after":"before"});
}

function renderVideo(){
 const V=C.video;
 $("#video").innerHTML=`<div class="wrap">${secHead(V)}<div class="vid-grid"><div class="player reveal" id="player"><div class="vtitle"><span class="mono" style="color:var(--accent)">${esc(V.items[vidIdx][1])}</span><b>${esc(V.items[vidIdx][0])}</b></div><div class="scene"><div class="box3d">${cubeFaces()}</div></div><button class="play" type="button" id="playBtn"><i>▶</i>${esc(V.play)}</button></div>
 <div class="vlist">${V.items.map((v,i)=>`<button type="button" class="vitem" data-i="${i}" aria-current="${i===vidIdx}"><span class="th">${boxArt(PROJECTS[[2,6,8][i]],160,100,{grid:false,alt:v[0]})}</span><span><b>${esc(v[0])}</b><span>${esc(v[2])} · ${v[1]}</span></span></button>`).join("")}</div></div></div>`;
 $$("#video .vitem").forEach(b=>b.onclick=()=>{vidIdx=+b.dataset.i;renderVideo()});
 $("#playBtn").onclick=()=>{const n=document.createElement("div");n.className="note";n.innerHTML=`<p style="max-width:42ch">${esc(V.note)}</p>`;n.onclick=()=>n.remove();$("#player").appendChild(n)};
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
 $("#cf").onsubmit=e=>{e.preventDefault();if(validate()){const t=document.createElement("div");t.className="toast";t.setAttribute("role","status");t.textContent=f.ok;$("#cf .toast")?.remove();$("#cf").appendChild(t);$("#cf").reset();files=[];drawFiles()}};
 $$("#cf [data-req], #f-email, #f-phone").forEach(el=>el.addEventListener("blur",()=>checkField(el)));
}
function addFiles(list){const f=C.contact.f;$("#fileErr").textContent="";for(const x of list){if(files.length>=5){$("#fileErr").textContent=f.tooMany;break}const ext=x.name.split(".").pop().toLowerCase();files.push({name:x.name,size:x.size,err:!ALLOWED.includes(ext)?f.badType:x.size>MAXB?f.tooBig:""})}drawFiles()}
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
 store.set("tp-theme",JSON.stringify(TH));
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
try{const s=JSON.parse(store.get("tp-bg")||"null");if(s){for(const k in s.cfg)if(BG[k])Object.assign(BG[k],s.cfg[k]);BG_ON=s.on!==false}}catch(e){}
const uploads={}; // section -> objectURL (session only; the real dashboard uploads to the media library)
const saveBG=()=>{const cfg={};for(const k in BG){const{clip,mode,ov}=BG[k];cfg[k]={clip:clip==="upload"?BG_DEF[k].clip:clip,mode,ov}}store.set("tp-bg",JSON.stringify({on:BG_ON,cfg}))};
const bgNodes={}; // section -> {wrap,video,ov,prog,cur}
const reduceMotion=matchMedia("(prefers-reduced-motion: reduce)");
const VEXT=(()=>{const v=document.createElement("video");return v.canPlayType('video/mp4; codecs="avc1.42E01E"')?"mp4":"webm"})();
function srcFor(k){const c=BG[k];return c.clip==="upload"?uploads[k]:c.clip&&CLIPS[c.clip]?`media/${c.clip}.${VEXT}`:""}
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

/* ---------- boot ---------- */
L=store.get("tp-lang")||"ar";
applyTheme(); render();
$("#langBtn").onclick=()=>{L=L==="ar"?"en":"ar";store.set("tp-lang",L);render()};
$("#menuBtn").onclick=()=>{const n=$("#nav");n.classList.toggle("open");$("#menuBtn").setAttribute("aria-expanded",n.classList.contains("open"))};
$("#nav").addEventListener("click",e=>{if(e.target.tagName==="A")$("#nav").classList.remove("open")});
$("#tcFab").onclick=openTC; $("#scrim").onclick=closeTC;
$("#lb").addEventListener("click",e=>{if(e.target.id==="lb")closeLB()});
$("#lb .lb-close").onclick=closeLB;
document.addEventListener("keydown",e=>{if($("#lb").hidden)return;if(e.key==="Escape")closeLB();if(e.key==="ArrowLeft"||e.key==="ArrowRight"){const d=(e.key==="ArrowLeft")===(C.dir==="rtl")?1:-1;lbIndex=(lbIndex+d+lbList.length)%lbList.length;drawLB()}});
})();
