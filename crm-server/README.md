# TITAN CRM — الطبقة الخلفية (Next.js + Prisma + Medusa)

هذا المجلد هو التنفيذ الكامل لوثيقة `../docs/TITAN_CRM_IMPLEMENTATION.md`: جداول Prisma، مسارات
API، المهمة الليلية، ومكوّنات الواجهة بـ React + Tailwind + SWR.

> **مهم:** مستودع `App-Titan` الحالي هو صفحة HTML ساكنة تُنشر على GitHub Pages — لا يوجد فيه
> Next.js ولا Prisma ولا Medusa. لذلك بُني هذا المجلد كتطبيق **مستقل قابل للتثبيت**، جاهز
> للنقل كما هو إلى مستودع Titan Print الفعلي عند توفّره. لا يؤثر على الموقع الساكن ولا على
> نشر Pages.
>
> النسخة العاملة اليوم بلا خادم موجودة في `customers.html` بجذر المستودع (بيانات تجريبية +
> تخزين محلي)، وتستخدم نفس معادلات دورة الشراء وتصنيف RFM الموجودة هنا.

## التشغيل

```bash
cd crm-server
npm install
cp .env.example .env      # ثم عبّئ القيم
npx prisma migrate dev --name add_crm_tables
npx prisma generate
npm run seed:templates    # يزرع قوالب الرسائل الثلاثة
npm run dev               # http://localhost:3000/customers
```

المهمة الليلية يدوياً:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/recompute-customer-stats
```

## البنية

| المسار | الدور |
|---|---|
| `prisma/schema.prisma` | جداول CRM الستة (انسخ الموديلات فقط إلى مخطط Titan عند الدمج) |
| `prisma/manual-sql/001_customer_search_columns.sql` | أعمدة البحث المُطبَّعة + فهارس `pg_trgm` على جدول `customer` في Medusa |
| `lib/crm/*` | تطبيع النصوص/الهواتف، دورة الشراء، RFM، روابط واتساب، عميل Medusa، المصادقة |
| `app/api/crm/*` | قائمة الزبائن، KPIs، البحث، المستحقون، التصدير، ملف الزبون، الملاحظات، التذكيرات، سجل التواصل، القوالب |
| `app/api/cron/recompute-customer-stats` | الحساب الليلي + إشعار n8n |
| `components/crm/*` | شريط KPIs، البحث الفوري، الجدول، الإجراءات السريعة، قائمة قوالب واتساب، ملف الزبون |
| `app/(dashboard)/customers/page.tsx` | الصفحة التي تجمع المكوّنات |
| `vercel.json` | جدولة الجوب الليلي 23:00 UTC (≈ 02:00 بتوقيت فلسطين) |

## ما يحتاج قراراً منك عند الدمج

| # | النقطة | المطلوب |
|---|---|---|
| 1 | `@/lib/prisma` | `lib/prisma.ts` هنا عميل جديد — احذفه واستورد عميل Prisma الموجود في Titan إن وُجد |
| 2 | `lib/crm/auth.ts` | `getCurrentEmployee()` مؤقتة (كوكيز `employee_id`) — استبدلها بمصادقة الموظفين الفعلية |
| 3 | البحث | يتطلب تنفيذ `prisma/manual-sql/001_customer_search_columns.sql` على قاعدة Medusa أولاً |
| 4 | الاسم والهاتف في الجدول | `CustomerPurchaseStats` لا يخزّن الاسم/الهاتف؛ الجدول يعرض `row.name ?? row.customerId`. أضف `JOIN` مع جدول `customer` في `app/api/crm/customers/route.ts` إن كانت القاعدتان واحدة (تحقق من `DATABASE_URL`)، أو استدعاءً دفعياً لـ Medusa Admin API |
| 5 | Medusa v1 مقابل v2 | شكل استجابة `/admin/orders` يختلف بين النسختين — تحقق قبل التشغيل |
| 6 | حماية `/customers` | لم يُضف middleware عمداً — أضفه حسب نظام الأدوار (مدير/مبيعات/إنتاج) |

## فروقات مقصودة عن نص الوثيقة

- `CustomerDrawer` كان يستدعي `/api/crm/customers/{id}/full` وهو مسار غير موجود — صُحّح إلى
  `/api/crm/customers/{id}` (وهو المسار الذي تنشئه الوثيقة فعلاً).
- `sortBy` في `app/api/crm/customers/route.ts` صار محصوراً بقائمة حقول مسموحة، بدل تمريره
  مباشرة إلى `orderBy` (اسم عمود خاطئ من الـ query string كان يُسقط الطلب بخطأ 500).
- مسارات الكتابة (ملاحظات/تذكيرات/سجل تواصل) تُعيد **401** عند غياب الجلسة بدل 500.
- `listAllMedusaCustomersWithOrderDates` كانت تُنشئ صفاً مكرراً لكل زبون في كل صفحة نتائج
  (تجميع داخل الحلقة) — صار التجميع عبر `Map` واحدة خارج الحلقة.
- زر «التالي» في الجدول صار يتعطّل عند آخر صفحة.
- أضيفت `package.json` / `tsconfig.json` / `next.config.mjs` / `lib/prisma.ts` ليكون المجلد
  قابلاً للتثبيت والفحص فعلياً — احذفها عند الدمج في مستودع فيه نظائرها.
