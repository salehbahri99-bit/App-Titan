/* Titan Pack — shared design data: icons, content model, project list and the packaging render.
   Loaded before app.js (public site) and admin.js (dashboard); cms.js overlays published/draft edits on top. */
const tpEsc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
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
let artUid=0;
function boxArt(p,W=400,H=300,opt={}){
 if(p.coverUrl)return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${tpEsc(opt.alt||p.lbl)}"><image href="${p.coverUrl}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/></svg>`;
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
 const id="a"+(++artUid);
 // artwork on the front face (local units: u 0..w, v 0..h)
 const fw=w,fh=h,fs=Math.min(fw,fh);
 let art="";
 const lbl=`<text x="${fw/2}" y="${fh*.56}" text-anchor="middle" font-family="Alexandria,sans-serif" font-weight="800" font-size="${(fs*.17).toFixed(3)}" letter-spacing="${(fs*.012).toFixed(3)}" fill="${p.c3}">${tpEsc(p.lbl)}</text>`;
 const sub=`<text x="${fw/2}" y="${fh*.56+fs*.12}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="${(fs*.055).toFixed(3)}" letter-spacing="${(fs*.01).toFixed(3)}" fill="${p.c3}" opacity=".75">${tpEsc(p.sub||"EST. 2026")}</text>`;
 switch(p.pat){
  case"band":art=`<rect width="${fw}" height="${fh}" fill="${p.c1}"/><rect y="${fh*.36}" width="${fw}" height="${fh*.34}" fill="${p.c2}"/>${lbl.replace(p.c3,p.c1)}${sub.replace(p.c3,p.c1)}<circle cx="${fw/2}" cy="${fh*.2}" r="${fs*.07}" fill="none" stroke="${p.c2}" stroke-width="${fs*.012}"/>`;break;
  case"arc":art=`<rect width="${fw}" height="${fh}" fill="${p.c1}"/><circle cx="${fw/2}" cy="${fh*1.02}" r="${fw*.62}" fill="${p.c2}"/><circle cx="${fw*.5}" cy="${fh*.24}" r="${fs*.05}" fill="${p.c2}"/>${lbl}${sub}`;break;
  case"frame":art=`<rect width="${fw}" height="${fh}" fill="${p.c1}"/><rect x="${fs*.07}" y="${fs*.07}" width="${fw-fs*.14}" height="${fh-fs*.14}" fill="none" stroke="${p.c2}" stroke-width="${fs*.012}"/><rect x="${fs*.1}" y="${fs*.1}" width="${fw-fs*.2}" height="${fh-fs*.2}" fill="none" stroke="${p.c2}" stroke-width="${fs*.004}"/>${lbl}${sub}`;break;
  case"split":art=`<rect width="${fw}" height="${fh}" fill="${p.c1}"/><path d="M0 ${fh*.62} L${fw} ${fh*.3} L${fw} ${fh} L0 ${fh}Z" fill="${p.c2}"/><rect x="${fw*.08}" y="${fh*.1}" width="${fs*.14}" height="${fs*.14}" fill="${p.c2}"/><rect x="${fw*.08+fs*.045}" y="${fh*.1+fs*.018}" width="${fs*.05}" height="${fs*.104}" fill="${p.c1}"/><rect x="${fw*.08+fs*.018}" y="${fh*.1+fs*.045}" width="${fs*.104}" height="${fs*.05}" fill="${p.c1}"/>${lbl.replace(`y="${fh*.56}"`,`y="${fh*.4}"`).replace(`text-anchor="middle"`,`text-anchor="start"`).replace(`x="${fw/2}"`,`x="${fw*.08}"`)}`;break;
  case"dots":{let dots="";for(let i=0;i<7;i++)for(let j=0;j<11;j++)dots+=`<circle cx="${(i+.5)*fw/7}" cy="${(j+.5)*fh/11}" r="${fs*.018}" fill="${p.c2}" opacity=".55"/>`;art=`<rect width="${fw}" height="${fh}" fill="${p.c1}"/>${dots}<rect x="${fw*.12}" y="${fh*.4}" width="${fw*.76}" height="${fs*.3}" rx="${fs*.03}" fill="${p.c1}"/>${lbl.replace(`y="${fh*.56}"`,`y="${fh*.4+fs*.2}"`)}`;break}
  case"stripes":{let st="";for(let i=0;i<10;i+=2)st+=`<rect x="${i*fw/10}" width="${fw/10}" height="${fh}" fill="${p.c2}"/>`;art=`<rect width="${fw}" height="${fh}" fill="${p.c1}"/>${st}<ellipse cx="${fw/2}" cy="${fh/2}" rx="${fw*.3}" ry="${fh*.34}" fill="${p.c1}"/>${lbl.replace(`y="${fh*.56}"`,`y="${fh*.56}"`).replace(/fill="[^"]+">/,`fill="${p.c3}">`)}`;break}
  case"kraft":art=`<rect width="${fw}" height="${fh}" fill="${p.c1}"/><circle cx="${fw/2}" cy="${fh/2}" r="${fs*.26}" fill="none" stroke="${p.c2}" stroke-width="${fs*.02}"/><circle cx="${fw/2}" cy="${fh/2}" r="${fs*.21}" fill="none" stroke="${p.c2}" stroke-width="${fs*.006}" stroke-dasharray="${fs*.02} ${fs*.015}"/>${lbl.replace(`y="${fh*.56}"`,`y="${fh/2+fs*.05}"`).replace(/fill="[^"]+">/,`fill="${p.c2}">`).replace(/font-size="[^"]+"/,`font-size="${(fs*.11).toFixed(3)}"`)}`;break;
  default:art=`<rect width="${fw}" height="${fh}" fill="${p.c1}"/><text x="${fw/2}" y="${fh*.52}" text-anchor="middle" font-family="Arial,sans-serif" font-size="${fs*.12}" fill="${p.c3}">${tpEsc(p.lbl)}</text><rect x="${fw*.3}" y="${fh*.6}" width="${fw*.4}" height="${fs*.03}" fill="${p.c3}" opacity=".5"/>`;
 }
 const side=p.pat==="kraft"?`<rect width="${d}" height="${h}" fill="${p.c1}"/><rect y="${h*.8}" width="${d}" height="${h*.2}" fill="${p.c2}" opacity=".85"/>`:
   `<rect width="${d}" height="${h}" fill="${p.pat==="band"||p.pat==="arc"?p.c2:p.c1}"/><text x="${d/2}" y="${h/2}" text-anchor="middle" transform="rotate(90 ${d/2} ${h/2})" font-family="IBM Plex Mono,monospace" font-size="${Math.min(d,h)*.09}" letter-spacing="${Math.min(d,h)*.02}" fill="${p.pat==="band"||p.pat==="arc"?p.c1:p.c2}">${tpEsc(p.lbl)}</text>`;
 const top=`<rect width="${w}" height="${d}" fill="${p.pat==="frame"?p.c1:shade(p.c1,.08)}"/>${p.pat==="frame"?`<rect x="${Math.min(w,d)*.08}" y="${Math.min(w,d)*.08}" width="${w-Math.min(w,d)*.16}" height="${d-Math.min(w,d)*.16}" fill="none" stroke="${p.c2}" stroke-width="${Math.min(w,d)*.01}"/>`:""}`;
 const grid=opt.grid===false?"":`<pattern id="${id}g" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="${shade(p.bg,-.1)}" stroke-width=".6"/></pattern><rect width="${W}" height="${H}" fill="url(#${id}g)" opacity=".7"/>`;
 const floor=Q(w/2,0,d/2);
 return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${tpEsc(opt.alt||p.lbl)}"><defs><clipPath id="${id}a"><rect width="${w}" height="${h}"/></clipPath><clipPath id="${id}b"><rect width="${d}" height="${h}"/></clipPath><linearGradient id="${id}s" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient></defs>
 <rect width="${W}" height="${H}" fill="${p.bg}"/>${grid}
 <ellipse cx="${floor[0]}" cy="${(+floor[1]+s*.06).toFixed(1)}" rx="${(s*(w+d)*.62).toFixed(1)}" ry="${(s*(w+d)*.16).toFixed(1)}" fill="#000" opacity=".16" style="filter:blur(6px)"/>
 <g transform="${mA}" clip-path="url(#${id}a)">${art}</g><polygon points="${poly(A)}" fill="url(#${id}s)"/>
 <g transform="${mB}" clip-path="url(#${id}b)">${side}</g><polygon points="${poly(B)}" fill="#000" opacity=".22"/>
 <g transform="${mT}">${top}</g><polygon points="${poly(T)}" fill="#fff" opacity=".12"/>
 <polyline points="${poly([Q(0,h,d),Q(w,h,d),Q(w,h,0)])}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1"/>
 <line x1="${Q(w,0,d)[0]}" y1="${Q(w,0,d)[1]}" x2="${Q(w,h,d)[0]}" y2="${Q(w,h,d)[1]}" stroke="#fff" stroke-opacity=".25"/>
 </svg>`;
}
