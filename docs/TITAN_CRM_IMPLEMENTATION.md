# TITAN CRM — ملف تنفيذ موحّد لوكيل برمجي (Claude Code)

> **إلى الوكيل البرمجي الذي يقرأ هذا الملف:** هذا ملف تنفيذ كامل ومباشر، وليس وثيقة تصميم فقط. مهمتك إنشاء/تعديل كل ملف مذكور أدناه بمحتواه الكامل داخل مستودع Titan Print، بنفس المسار المكتوب في عنوان كل قسم `### FILE:`، بالترتيب الوارد، ثم تنفيذ أوامر الإعداد في القسم الأخير. لا تتوقف لطلب تأكيد بين الخطوات إلا إذا واجهت تعارضاً حقيقياً في الكود الموجود فعلاً (مثلاً: نفس المسار موجود بمحتوى مختلف تماماً) — عندها عدّل بأقل تغيير ممكن ليتوافق مع البنية الحالية واذكر ذلك في النهاية.

## 0. السياق والافتراضات

المشروع: **Titan Print** — منصة طباعة وتغليف حسب الطلب، عربية أولاً (RTL). الحزمة التقنية: **Next.js (App Router) + Medusa.js + PostgreSQL + Prisma**.

هذا الملف يبني ميزة **CRM/واجهة الزبائن** فوق هذه الحزمة، بناءً على خطة من 20 بنداً (شريط KPIs، بحث فوري، جدول ذكي، تنبؤ بدورة الشراء، تكامل واتساب، ملف الزبون، تصدير Excel، أتمتة n8n).

**افتراضات تنفيذية (عدّل الكود إن كانت مختلفة فعلياً في المستودع):**
1. جداول CRM الجديدة تُضاف عبر Prisma في مخطط منفصل عن جداول Medusa الأساسية (`Customer`, `Order`) — الربط بـ `customerId` كنص حر (معرّف Medusa)، وليس مفتاحاً خارجياً حقيقياً عبر قاعدتين.
2. طلبات الزبون (orders) تُجلب مباشرة عبر **Medusa Admin REST API** (`${MEDUSA_BACKEND_URL}/admin/customers/{id}/orders`) وليس من Prisma.
3. لوحة CRM هي مجموعة صفحات ضمن `app/(dashboard)/customers/` في نفس تطبيق Next.js، محمية بمصادقة جلسة موظف موجودة مسبقاً (افتراض: `getCurrentEmployee()` دالة مساعدة موجودة أو تُبنى بشكل بسيط أدناه).
4. يوجد Vercel Cron أو ما يعادله؛ المهمة الليلية تُبنى كنقطة API تُستدعى بجدولة (`vercel.json`).
5. لا يوجد حساب WhatsApp Business API رسمي — التكامل عبر روابط `wa.me` يدوية النقر فقط (بدون مكتبات أتمتة غير رسمية).
6. مكتبة الواجهة: React + Tailwind CSS + SWR لجلب البيانات.

**الحزم المطلوب تثبيتها:**
```bash
npm install swr exceljs date-fns
npm install -D @types/node
```

---

## 1. أوامر الإعداد الأولية (نفّذها بعد إنشاء كل الملفات أدناه)

```bash
# 1. أضف نموذج Prisma (القسم 2) إلى schema.prisma الموجود، ثم:
npx prisma migrate dev --name add_crm_tables
npx prisma generate

# 2. زرع قوالب الرسائل الافتراضية
npx ts-node scripts/seed-message-templates.ts
# أو إن كان المشروع يستخدم tsx:
npx tsx scripts/seed-message-templates.ts

# 3. أضف متغيرات البيئة التالية إلى .env
echo '
MEDUSA_BACKEND_URL=http://localhost:9000
MEDUSA_ADMIN_API_KEY=your_medusa_admin_api_key
N8N_WEBHOOK_URL_OVERDUE=https://your-n8n-instance/webhook/titan-overdue
N8N_WEBHOOK_SECRET=change_me_to_a_random_secret
CRON_SECRET=change_me_to_a_random_secret
' >> .env

# 4. شغّل خادم التطوير وتحقق من الصفحة
npm run dev
# افتح http://localhost:3000/customers
```

---

## 2. طبقة البيانات

### FILE: `prisma/schema.prisma` (أضف هذا المحتوى إلى الملف الموجود — لا تحذف الموديلات الحالية)

```prisma
// ==================== CRM Titan — يُضاف لمخطط Prisma الموجود ====================
// customerId / orderId يشيران لمعرّفات Medusa (نص حر — انظر الافتراض 1 أعلاه)

model CustomerPurchaseStats {
  customerId             String    @id
  totalOrders            Int       @default(0)
  avgCycleDays           Float?
  stdDevCycleDays        Float?
  lastOrderDate          DateTime?
  predictedNextOrderDate DateTime?
  isOverdue              Boolean   @default(false)
  wasOverdueNotified     Boolean   @default(false) // يمنع تكرار إشعار n8n لنفس فترة التأخير
  updatedAt              DateTime  @updatedAt

  @@index([predictedNextOrderDate])
  @@index([isOverdue])
}

model CustomerSegment {
  customerId String   @id
  segment    String   // "VIP" | "REGULAR" | "AT_RISK" | "NEW"
  rScore     Int
  fScore     Int
  mScore     Int
  computedAt DateTime @updatedAt

  @@index([segment])
}

model CustomerNote {
  id         String   @id @default(cuid())
  customerId String
  authorId   String
  authorName String
  body       String
  createdAt  DateTime @default(now())

  @@index([customerId, createdAt])
}

model FollowUpReminder {
  id          String    @id @default(cuid())
  customerId  String
  assignedTo  String
  dueAt       DateTime
  note        String?
  status      String    @default("PENDING") // PENDING | DONE | SNOOZED
  completedAt DateTime?
  createdAt   DateTime  @default(now())

  @@index([customerId])
  @@index([assignedTo, status, dueAt])
}

model ContactLog {
  id          String   @id @default(cuid())
  customerId  String
  channel     String   // "WHATSAPP" | "CALL" | "EMAIL"
  templateKey String?
  performedBy String
  occurredAt  DateTime @default(now())

  @@index([customerId, occurredAt])
}

model MessageTemplate {
  id       String  @id @default(cuid())
  key      String  @unique
  label    String
  body     String
  category String  // "REMINDER" | "OFFER" | "QUALITY_FOLLOWUP"
  isActive Boolean @default(true)
}
```

### FILE: `scripts/seed-message-templates.ts`

```ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TEMPLATES = [
  {
    key: "order_reminder",
    label: "تذكير بالطلب المعتاد",
    category: "REMINDER",
    body: "مرحباً {{customerName}}، هل حان وقت تجديد طلبكم المعتاد من {{businessName}}؟ 😊",
  },
  {
    key: "new_offer",
    label: "عرض جديد",
    category: "OFFER",
    body: "أهلاً {{customerName}}! لدينا عرض جديد هذا الأسبوع قد يهمّكم.",
  },
  {
    key: "quality_followup",
    label: "متابعة الجودة",
    category: "QUALITY_FOLLOWUP",
    body: "مرحباً {{customerName}}، نتابع معكم بخصوص جودة آخر طلب بتاريخ {{lastOrderDate}}.",
  },
];

async function main() {
  for (const t of TEMPLATES) {
    await prisma.messageTemplate.upsert({
      where: { key: t.key },
      update: t,
      create: t,
    });
  }
  console.log(`Seeded ${TEMPLATES.length} message templates.`);
}

main().finally(() => prisma.$disconnect());
```

### FILE: `lib/crm/normalize.ts`

```ts
/** تطبيع رقم الهاتف: يزيل كل شيء عدا الأرقام، ويوحّد صيغة رمز الدولة */
export function normalizePhone(raw: string, defaultCountryCode = "970"): string {
  let digits = raw.replace(/[^\d]/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = defaultCountryCode + digits.slice(1);
  if (!digits.startsWith(defaultCountryCode) && digits.length <= 10) {
    digits = defaultCountryCode + digits;
  }
  return digits; // مثال: "970599123456" — جاهز لاستخدامه في wa.me
}

/** تطبيع نص عربي للبحث: إزالة التطويل وتوحيد الهمزات */
export function normalizeArabicText(input: string): string {
  return input
    .replace(/[ـ]/g, "") // إزالة التطويل ـ
    .replace(/[إأآا]/g, "ا")
    .replace(/[ة]/g, "ه")
    .replace(/[ى]/g, "ي")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}
```

### FILE: `lib/crm/purchase-cycle.ts`

```ts
export function computePurchaseCycle(
  orderDates: Date[]
): { avg: number | null; stdDev: number | null } {
  if (orderDates.length < 2) return { avg: null, stdDev: null };

  const sorted = [...orderDates].sort((a, b) => a.getTime() - b.getTime());
  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    gaps.push((sorted[i].getTime() - sorted[i - 1].getTime()) / 86_400_000);
  }

  const avg = gaps.reduce((s, g) => s + g, 0) / gaps.length;
  const variance = gaps.reduce((s, g) => s + (g - avg) ** 2, 0) / gaps.length;
  return { avg, stdDev: Math.sqrt(variance) };
}

export function predictNextOrder(lastOrderDate: Date, avgCycleDays: number | null): Date | null {
  if (avgCycleDays === null) return null;
  return new Date(lastOrderDate.getTime() + avgCycleDays * 86_400_000);
}

export function isOverdue(predictedNextOrderDate: Date | null, now = new Date()): boolean {
  return !!predictedNextOrderDate && predictedNextOrderDate.getTime() < now.getTime();
}

export function isDueSoon(
  predictedNextOrderDate: Date | null,
  bufferDays = 3,
  now = new Date()
): boolean {
  if (!predictedNextOrderDate) return false;
  const threshold = new Date(now.getTime() + bufferDays * 86_400_000);
  return predictedNextOrderDate.getTime() <= threshold.getTime();
}

// ---------------- RFM ----------------

export interface RFMRawInput {
  customerId: string;
  recencyDays: number; // أيام منذ آخر طلب
  orderCount: number;
  totalSpend: number;
}

export interface RFMResult {
  customerId: string;
  rScore: number;
  fScore: number;
  mScore: number;
  segment: "VIP" | "REGULAR" | "AT_RISK" | "NEW";
}

function quintileScore(value: number, sortedAsc: number[], reverse = false): number {
  if (sortedAsc.length === 0) return 1;
  const rank = sortedAsc.filter((v) => v <= value).length / sortedAsc.length;
  const score = Math.min(5, Math.max(1, Math.ceil(rank * 5)));
  return reverse ? 6 - score : score;
}

/** يحسب RFM لكل الزبائن دفعة واحدة (يحتاج توزيع القاعدة الكاملة لحساب الأخماس) */
export function computeRFMBatch(inputs: RFMRawInput[]): RFMResult[] {
  const recencies = inputs.map((i) => i.recencyDays).sort((a, b) => a - b);
  const frequencies = inputs.map((i) => i.orderCount).sort((a, b) => a - b);
  const monetary = inputs.map((i) => i.totalSpend).sort((a, b) => a - b);

  return inputs.map((i) => {
    const rScore = quintileScore(i.recencyDays, recencies, true); // أقل أيام = أفضل
    const fScore = quintileScore(i.orderCount, frequencies);
    const mScore = quintileScore(i.totalSpend, monetary);
    const total = rScore + fScore + mScore;

    let segment: RFMResult["segment"] = "REGULAR";
    if (i.orderCount <= 1) segment = "NEW";
    else if (total >= 13) segment = "VIP";
    else if (rScore <= 2 && fScore >= 3) segment = "AT_RISK";

    return { customerId: i.customerId, rScore, fScore, mScore, segment };
  });
}
```

### FILE: `lib/crm/whatsapp.ts`

```ts
export function buildWhatsAppLink(phoneIntlDigitsOnly: string, message: string): string {
  return `https://wa.me/${phoneIntlDigitsOnly}?text=${encodeURIComponent(message)}`;
}

export function renderTemplate(body: string, ctx: Record<string, string>): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key) => ctx[key] ?? "—");
}
```

### FILE: `lib/crm/medusa.ts`

```ts
const MEDUSA_URL = process.env.MEDUSA_BACKEND_URL!;
const MEDUSA_KEY = process.env.MEDUSA_ADMIN_API_KEY!;

async function medusaFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${MEDUSA_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MEDUSA_KEY}`,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Medusa API error ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function getMedusaCustomerOrders(customerId: string, page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize;
  return medusaFetch(
    `/admin/orders?customer_id[]=${customerId}&limit=${pageSize}&offset=${offset}&order=-created_at`
  );
}

export async function listAllMedusaCustomersWithOrderDates(): Promise<
  { customerId: string; orderDates: Date[]; totalSpend: number }[]
> {
  // ملاحظة للوكيل المنفّذ: هذه دالة تجميعية تُستخدم من قِبل جوب الحساب الليلي (القسم 4).
  // إن كانت قاعدة الزبائن كبيرة (>5000)، استبدل هذا بـ SQL مباشر على قاعدة Medusa
  // بدل تصفّح كل الصفحات عبر REST API، لتفادي بطء الجوب الليلي.
  const results: { customerId: string; orderDates: Date[]; totalSpend: number }[] = [];
  let offset = 0;
  const limit = 200;
  while (true) {
    const { orders } = await medusaFetch(
      `/admin/orders?limit=${limit}&offset=${offset}&order=customer_id&fields=id,customer_id,created_at,total,status`
    );
    if (!orders || orders.length === 0) break;

    const byCustomer = new Map<string, { orderDates: Date[]; totalSpend: number }>();
    for (const o of orders) {
      if (o.status === "canceled") continue;
      const entry = byCustomer.get(o.customer_id) ?? { orderDates: [], totalSpend: 0 };
      entry.orderDates.push(new Date(o.created_at));
      entry.totalSpend += o.total ?? 0;
      byCustomer.set(o.customer_id, entry);
    }
    for (const [customerId, v] of byCustomer) {
      results.push({ customerId, ...v });
    }
    if (orders.length < limit) break;
    offset += limit;
  }
  return results;
}
```

### FILE: `lib/crm/auth.ts`

```ts
// ملاحظة للوكيل المنفّذ: هذه دالة مؤقتة (stub) — استبدلها بآلية المصادقة الفعلية
// الموجودة في مشروع Titan (جلسة NextAuth أو JWT الموظفين) إن وُجدت مسبقاً.
// الغرض هنا فقط توحيد نقطة استدعاء واحدة تستخدمها كل مسارات API أدناه.
import { cookies } from "next/headers";

export interface CurrentEmployee {
  id: string;
  name: string;
}

export async function getCurrentEmployee(): Promise<CurrentEmployee> {
  const employeeId = cookies().get("employee_id")?.value;
  const employeeName = cookies().get("employee_name")?.value;
  if (!employeeId) throw new Error("UNAUTHENTICATED");
  return { id: employeeId, name: employeeName ?? "موظف" };
}
```

---

## 3. نقاط الـ API (Next.js App Router route handlers)

### FILE: `app/api/crm/customers/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // افتراض: عميل Prisma مُصدَّر من هنا في المشروع الحالي

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const page = Number(sp.get("page") ?? "1");
  const pageSize = Math.min(Number(sp.get("pageSize") ?? "50"), 200);
  const segment = sp.get("segment");
  const dueOnly = sp.get("dueOnly") === "true";
  const sortBy = sp.get("sortBy") ?? "predictedNextOrderDate";
  const sortDir = sp.get("sortDir") === "desc" ? "desc" : "asc";

  const where: any = {};
  if (dueOnly) {
    where.predictedNextOrderDate = {
      lte: new Date(Date.now() + 3 * 86_400_000),
      not: null,
    };
  }

  let customerIdsBySegment: string[] | undefined;
  if (segment) {
    const rows = await prisma.customerSegment.findMany({
      where: { segment },
      select: { customerId: true },
    });
    customerIdsBySegment = rows.map((r) => r.customerId);
    where.customerId = { in: customerIdsBySegment };
  }

  const [stats, total] = await Promise.all([
    prisma.customerPurchaseStats.findMany({
      where,
      orderBy: { [sortBy]: sortDir },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.customerPurchaseStats.count({ where }),
  ]);

  const segments = await prisma.customerSegment.findMany({
    where: { customerId: { in: stats.map((s) => s.customerId) } },
  });
  const segmentMap = new Map(segments.map((s) => [s.customerId, s.segment]));

  return NextResponse.json({
    items: stats.map((s) => ({ ...s, segment: segmentMap.get(s.customerId) ?? "NEW" })),
    page,
    pageSize,
    total,
  });
}
```

### FILE: `app/api/crm/customers/kpis/route.ts`

```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [totalCustomers, activeCustomers, vipCustomers, dueTodayCount] = await Promise.all([
      prisma.customerPurchaseStats.count(),
      prisma.customerPurchaseStats.count({
        where: { lastOrderDate: { gte: new Date(Date.now() - 90 * 86_400_000) } },
      }),
      prisma.customerSegment.count({ where: { segment: "VIP" } }),
      prisma.customerPurchaseStats.count({
        where: {
          predictedNextOrderDate: { lte: new Date(Date.now() + 3 * 86_400_000), not: null },
        },
      }),
    ]);
    return NextResponse.json({ totalCustomers, activeCustomers, vipCustomers, dueTodayCount });
  } catch (e) {
    return NextResponse.json(
      { totalCustomers: null, activeCustomers: null, vipCustomers: null, dueTodayCount: null },
      { status: 200 }
    );
  }
}
```

### FILE: `app/api/crm/customers/search/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeArabicText, normalizePhone } from "@/lib/crm/normalize";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  const normalizedQuery = normalizeArabicText(q);
  const phoneQuery = normalizePhone(q);

  // ملاحظة: هذا الاستعلام يفترض جدول `customers` مُدار عبر Medusa بامتداد pg_trgm مُفعّل
  // (انظر فهارس البند 2 في وثيقة المواصفات) — عدّله ليطابق اسم الجدول/الأعمدة الفعلية.
  const results = await prisma.$queryRawUnsafe(
    `
    SELECT id, name, phone, business_name as "businessName"
    FROM customer
    WHERE name_normalized ILIKE '%' || $1 || '%'
       OR business_name_normalized ILIKE '%' || $1 || '%'
       OR phone_normalized LIKE '%' || $2 || '%'
    LIMIT 20
    `,
    normalizedQuery,
    phoneQuery
  );

  return NextResponse.json({ results });
}
```

### FILE: `app/api/crm/customers/due-today/route.ts`

```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.customerPurchaseStats.findMany({
    where: {
      predictedNextOrderDate: { lte: new Date(Date.now() + 3 * 86_400_000), not: null },
    },
    orderBy: { predictedNextOrderDate: "asc" },
  });
  return NextResponse.json({ items });
}
```

### FILE: `app/api/crm/customers/export/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";

const MAX_ROWS = 10_000;

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const segment = sp.get("segment");
  const dueOnly = sp.get("dueOnly") === "true";

  const where: any = {};
  if (dueOnly) {
    where.predictedNextOrderDate = { lte: new Date(Date.now() + 3 * 86_400_000), not: null };
  }
  if (segment) {
    const rows = await prisma.customerSegment.findMany({
      where: { segment },
      select: { customerId: true },
    });
    where.customerId = { in: rows.map((r) => r.customerId) };
  }

  const count = await prisma.customerPurchaseStats.count({ where });
  if (count > MAX_ROWS) {
    return NextResponse.json(
      { error: `عدد النتائج (${count}) يتجاوز الحد الأقصى (${MAX_ROWS}). يرجى تضييق الفلتر.` },
      { status: 400 }
    );
  }

  const stats = await prisma.customerPurchaseStats.findMany({ where });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("الزبائن", { views: [{ rightToLeft: true }] });
  sheet.columns = [
    { header: "معرّف الزبون", key: "customerId", width: 22 },
    { header: "عدد الطلبات", key: "totalOrders", width: 14 },
    { header: "متوسط دورة الشراء (يوم)", key: "avgCycleDays", width: 22 },
    { header: "آخر طلب", key: "lastOrderDate", width: 16 },
    { header: "الطلب المتوقع", key: "predictedNextOrderDate", width: 16 },
    { header: "متأخر؟", key: "isOverdue", width: 10 },
  ];
  sheet.addRows(
    stats.map((s) => ({
      ...s,
      lastOrderDate: s.lastOrderDate?.toISOString().slice(0, 10) ?? "",
      predictedNextOrderDate: s.predictedNextOrderDate?.toISOString().slice(0, 10) ?? "",
      isOverdue: s.isOverdue ? "نعم" : "لا",
    }))
  );

  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(buffer as any, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="customers-export-${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx"`,
    },
  });
}
```

### FILE: `app/api/crm/customers/[id]/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMedusaCustomerOrders } from "@/lib/crm/medusa";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const customerId = params.id;

  const [stats, segment, notes, reminders, contactLog, ordersResp] = await Promise.all([
    prisma.customerPurchaseStats.findUnique({ where: { customerId } }),
    prisma.customerSegment.findUnique({ where: { customerId } }),
    prisma.customerNote.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.followUpReminder.findMany({
      where: { customerId, status: "PENDING" },
      orderBy: { dueAt: "asc" },
    }),
    prisma.contactLog.findMany({
      where: { customerId },
      orderBy: { occurredAt: "desc" },
      take: 10,
    }),
    getMedusaCustomerOrders(customerId, 1, 10).catch(() => ({ orders: [] })),
  ]);

  return NextResponse.json({
    customerId,
    stats,
    segment,
    notes,
    reminders,
    contactLog,
    recentOrders: ordersResp.orders ?? [],
  });
}
```

### FILE: `app/api/crm/customers/[id]/orders/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { getMedusaCustomerOrders } from "@/lib/crm/medusa";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const page = Number(req.nextUrl.searchParams.get("page") ?? "1");
  const pageSize = Number(req.nextUrl.searchParams.get("pageSize") ?? "20");
  const data = await getMedusaCustomerOrders(params.id, page, pageSize);
  return NextResponse.json(data);
}
```

### FILE: `app/api/crm/customers/[id]/segment/route.ts`

```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const segment = await prisma.customerSegment.findUnique({ where: { customerId: params.id } });
  if (!segment) return NextResponse.json({ error: "لا يوجد تصنيف بعد لهذا الزبون" }, { status: 404 });
  return NextResponse.json(segment);
}
```

### FILE: `app/api/crm/customers/[id]/notes/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentEmployee } from "@/lib/crm/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const notes = await prisma.customerNote.findMany({
    where: { customerId: params.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ notes });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const employee = await getCurrentEmployee();
  const { body } = await req.json();
  if (!body?.trim()) return NextResponse.json({ error: "الملاحظة فارغة" }, { status: 400 });

  const note = await prisma.customerNote.create({
    data: {
      customerId: params.id,
      authorId: employee.id,
      authorName: employee.name,
      body: body.trim(),
    },
  });
  return NextResponse.json(note, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const employee = await getCurrentEmployee();
  const { noteId } = await req.json();
  const note = await prisma.customerNote.findUnique({ where: { id: noteId } });
  if (!note) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  if (note.authorId !== employee.id) {
    return NextResponse.json({ error: "لا يمكنك حذف ملاحظة زميل آخر" }, { status: 403 });
  }
  await prisma.customerNote.delete({ where: { id: noteId } });
  return NextResponse.json({ ok: true });
}
```

### FILE: `app/api/crm/customers/[id]/reminders/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentEmployee } from "@/lib/crm/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const employee = await getCurrentEmployee();
  const { dueAt, note, assignedTo } = await req.json();
  if (!dueAt) return NextResponse.json({ error: "التاريخ مطلوب" }, { status: 400 });

  const reminder = await prisma.followUpReminder.create({
    data: {
      customerId: params.id,
      dueAt: new Date(dueAt),
      note,
      assignedTo: assignedTo ?? employee.id,
    },
  });
  return NextResponse.json(reminder, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const { reminderId, status } = await req.json();
  const reminder = await prisma.followUpReminder.update({
    where: { id: reminderId },
    data: { status, completedAt: status === "DONE" ? new Date() : null },
  });
  return NextResponse.json(reminder);
}
```

### FILE: `app/api/crm/customers/[id]/contact-log/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentEmployee } from "@/lib/crm/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const employee = await getCurrentEmployee();
  const { channel, templateKey } = await req.json();

  const log = await prisma.contactLog.create({
    data: {
      customerId: params.id,
      channel,
      templateKey,
      performedBy: employee.id,
    },
  });
  return NextResponse.json(log, { status: 201 });
}
```

### FILE: `app/api/crm/message-templates/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category");
  const templates = await prisma.messageTemplate.findMany({
    where: { isActive: true, ...(category ? { category } : {}) },
    orderBy: { label: "asc" },
  });
  return NextResponse.json({ templates });
}
```

---

## 4. المهمة الليلية (recompute job) وربط n8n

### FILE: `app/api/cron/recompute-customer-stats/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { listAllMedusaCustomersWithOrderDates } from "@/lib/crm/medusa";
import {
  computePurchaseCycle,
  predictNextOrder,
  isOverdue,
  computeRFMBatch,
} from "@/lib/crm/purchase-cycle";

export const maxDuration = 300; // ثوانٍ — يحتاج مهلة أطول من الافتراضي لقاعدة زبائن كبيرة

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const customers = await listAllMedusaCustomersWithOrderDates();

  // 1) دورة الشراء + الطلب المتوقع لكل زبون
  const statsUpdates = customers.map((c) => {
    const { avg, stdDev } = computePurchaseCycle(c.orderDates);
    const lastOrderDate = c.orderDates.length
      ? new Date(Math.max(...c.orderDates.map((d) => d.getTime())))
      : null;
    const predictedNextOrderDate = lastOrderDate ? predictNextOrder(lastOrderDate, avg) : null;
    return {
      customerId: c.customerId,
      totalOrders: c.orderDates.length,
      avgCycleDays: avg,
      stdDevCycleDays: stdDev,
      lastOrderDate,
      predictedNextOrderDate,
      overdue: isOverdue(predictedNextOrderDate),
    };
  });

  const previousOverdueIds = new Set(
    (await prisma.customerPurchaseStats.findMany({ where: { isOverdue: true } })).map(
      (s) => s.customerId
    )
  );

  await prisma.$transaction(
    statsUpdates.map((s) =>
      prisma.customerPurchaseStats.upsert({
        where: { customerId: s.customerId },
        create: {
          customerId: s.customerId,
          totalOrders: s.totalOrders,
          avgCycleDays: s.avgCycleDays,
          stdDevCycleDays: s.stdDevCycleDays,
          lastOrderDate: s.lastOrderDate,
          predictedNextOrderDate: s.predictedNextOrderDate,
          isOverdue: s.overdue,
          wasOverdueNotified: false,
        },
        update: {
          totalOrders: s.totalOrders,
          avgCycleDays: s.avgCycleDays,
          stdDevCycleDays: s.stdDevCycleDays,
          lastOrderDate: s.lastOrderDate,
          predictedNextOrderDate: s.predictedNextOrderDate,
          isOverdue: s.overdue,
          // إعادة تصفير علم الإشعار فقط إن لم يعد متأخراً (يسمح بإشعار جديد في المرة القادمة)
          ...(s.overdue ? {} : { wasOverdueNotified: false }),
        },
      })
    )
  );

  // 2) RFM لكل الزبائن دفعة واحدة (يحتاج توزيع القاعدة الكاملة)
  const rfmInputs = customers.map((c) => ({
    customerId: c.customerId,
    recencyDays: c.orderDates.length
      ? (Date.now() - Math.max(...c.orderDates.map((d) => d.getTime()))) / 86_400_000
      : 9999,
    orderCount: c.orderDates.length,
    totalSpend: c.totalSpend,
  }));
  const rfmResults = computeRFMBatch(rfmInputs);

  await prisma.$transaction(
    rfmResults.map((r) =>
      prisma.customerSegment.upsert({
        where: { customerId: r.customerId },
        create: { ...r },
        update: { ...r },
      })
    )
  );

  // 3) إشعار n8n بالزبائن الذين دخلوا حالة "متأخر" لأول مرة فقط
  const newlyOverdue = statsUpdates.filter(
    (s) => s.overdue && !previousOverdueIds.has(s.customerId)
  );
  if (newlyOverdue.length > 0 && process.env.N8N_WEBHOOK_URL_OVERDUE) {
    await notifyOverdueCustomers(newlyOverdue);
    await prisma.customerPurchaseStats.updateMany({
      where: { customerId: { in: newlyOverdue.map((s) => s.customerId) } },
      data: { wasOverdueNotified: true },
    });
  }

  return NextResponse.json({
    processed: customers.length,
    newlyOverdue: newlyOverdue.length,
  });
}

async function notifyOverdueCustomers(
  newlyOverdue: { customerId: string; predictedNextOrderDate: Date | null }[]
) {
  try {
    await fetch(process.env.N8N_WEBHOOK_URL_OVERDUE!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": process.env.N8N_WEBHOOK_SECRET ?? "",
      },
      body: JSON.stringify({
        event: "customer.overdue",
        timestamp: new Date().toISOString(),
        customers: newlyOverdue.map((c) => ({
          customerId: c.customerId,
          predictedNextOrderDate: c.predictedNextOrderDate,
          daysOverdue: c.predictedNextOrderDate
            ? Math.floor((Date.now() - c.predictedNextOrderDate.getTime()) / 86_400_000)
            : null,
        })),
      }),
    });
  } catch (err) {
    console.error("[n8n webhook] فشل إرسال إشعار المتأخرين:", err);
  }
}
```

### FILE: `vercel.json` (أضف أو ادمج مع الملف الموجود)

```json
{
  "crons": [
    {
      "path": "/api/cron/recompute-customer-stats",
      "schedule": "0 23 * * *"
    }
  ]
}
```
> ملاحظة: `0 23 * * *` بتوقيت UTC ≈ الساعة 2:00 صباحاً بتوقيت فلسطين/الرياض (UTC+3). عدّل حسب توقيت الخادم الفعلي. إن لم يكن Vercel Cron متاحاً، استبدله بـ `node-cron` داخل عملية خادم دائمة، أو باستدعاء يدوي مجدول عبر أي منصة CI تدعم cron (GitHub Actions مثلاً) تستدعي نفس المسار بترويسة `Authorization: Bearer $CRON_SECRET`.

---

## 5. مكوّنات الواجهة (React + Tailwind + SWR)

### FILE: `lib/crm/fetcher.ts`

```ts
export const fetcher = (url: string) => fetch(url).then((r) => r.json());
```

### FILE: `components/crm/KpiBar.tsx`

```tsx
"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/crm/fetcher";

export function KpiBar() {
  const { data } = useSWR("/api/crm/customers/kpis", fetcher, { refreshInterval: 60_000 });

  const cards = [
    { label: "إجمالي الزبائن", value: data?.totalCustomers },
    { label: "الزبائن النشطون", value: data?.activeCustomers },
    { label: "زبائن VIP", value: data?.vipCustomers },
    { label: "يحتاجون متابعة اليوم", value: data?.dueTodayCount, highlight: true },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6" dir="rtl">
      {cards.map((c) => (
        <div
          key={c.label}
          className={`rounded-xl border p-4 shadow-sm ${
            c.highlight ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"
          }`}
        >
          <div className="text-sm text-gray-500">{c.label}</div>
          <div className="text-2xl font-bold mt-1">{c.value ?? "—"}</div>
        </div>
      ))}
    </div>
  );
}
```

### FILE: `components/crm/GlobalSearch.tsx`

```tsx
"use client";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/crm/fetcher";

export function GlobalSearch({ onSelect }: { onSelect: (customerId: string) => void }) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  const { data } = useSWR(
    debounced.length >= 2 ? `/api/crm/customers/search?q=${encodeURIComponent(debounced)}` : null,
    fetcher
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("crm-global-search")?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative w-full max-w-md" dir="rtl">
      <input
        id="crm-global-search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        placeholder="ابحث بالاسم، الهاتف، أو اسم النشاط... (Ctrl+K)"
        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      {open && data?.results?.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-80 overflow-y-auto">
          {data.results.map((r: any) => (
            <li
              key={r.id}
              className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm"
              onClick={() => {
                onSelect(r.id);
                setOpen(false);
                setQuery("");
              }}
            >
              <div className="font-medium">{r.name}</div>
              <div className="text-gray-500 text-xs">
                {r.businessName} · {r.phone}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### FILE: `components/crm/QuickActions.tsx`

```tsx
"use client";
import { useState } from "react";
import { WhatsAppTemplateMenu } from "./WhatsAppTemplateMenu";

export function QuickActions({
  customer,
  onOpenProfile,
}: {
  customer: { id: string; name: string; phone: string };
  onOpenProfile: (id: string) => void;
}) {
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [reminderDate, setReminderDate] = useState("");

  async function saveNote() {
    if (!noteText.trim()) return;
    await fetch(`/api/crm/customers/${customer.id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: noteText }),
    });
    setNoteText("");
    setShowNote(false);
  }

  async function saveReminder() {
    if (!reminderDate) return;
    await fetch(`/api/crm/customers/${customer.id}/reminders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dueAt: reminderDate }),
    });
    setReminderDate("");
    setShowReminder(false);
  }

  return (
    <div className="flex items-center gap-2 relative" dir="rtl">
      <button
        aria-label="محادثة واتساب"
        className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-green-50 text-green-600 text-lg"
        onClick={() => setShowWhatsApp((v) => !v)}
      >
        💬
      </button>
      {showWhatsApp && (
        <WhatsAppTemplateMenu customer={customer} onClose={() => setShowWhatsApp(false)} />
      )}

      <button
        aria-label="فتح الملف"
        className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-600 text-lg"
        onClick={() => onOpenProfile(customer.id)}
      >
        👤
      </button>

      <button
        aria-label="إضافة ملاحظة"
        className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-yellow-50 text-yellow-600 text-lg"
        onClick={() => setShowNote((v) => !v)}
      >
        📝
      </button>
      {showNote && (
        <div className="absolute top-12 z-20 bg-white border rounded-lg shadow-lg p-3 w-64">
          <textarea
            className="w-full border rounded p-2 text-sm"
            rows={3}
            placeholder="ملاحظة سريعة..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
          <button
            className="mt-2 w-full bg-blue-600 text-white rounded py-1 text-sm"
            onClick={saveNote}
          >
            حفظ
          </button>
        </div>
      )}

      <button
        aria-label="تذكير"
        className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-purple-50 text-purple-600 text-lg"
        onClick={() => setShowReminder((v) => !v)}
      >
        ⏰
      </button>
      {showReminder && (
        <div className="absolute top-12 z-20 bg-white border rounded-lg shadow-lg p-3 w-64">
          <input
            type="datetime-local"
            className="w-full border rounded p-2 text-sm"
            value={reminderDate}
            onChange={(e) => setReminderDate(e.target.value)}
          />
          <button
            className="mt-2 w-full bg-purple-600 text-white rounded py-1 text-sm"
            onClick={saveReminder}
          >
            جدولة التذكير
          </button>
        </div>
      )}
    </div>
  );
}
```

### FILE: `components/crm/WhatsAppTemplateMenu.tsx`

```tsx
"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/crm/fetcher";
import { buildWhatsAppLink, renderTemplate } from "@/lib/crm/whatsapp";
import { normalizePhone } from "@/lib/crm/normalize";

export function WhatsAppTemplateMenu({
  customer,
  onClose,
}: {
  customer: { id: string; name: string; phone: string };
  onClose: () => void;
}) {
  const { data } = useSWR("/api/crm/message-templates", fetcher);

  async function send(template: { key: string; body: string }) {
    const message = renderTemplate(template.body, { customerName: customer.name });
    const phone = normalizePhone(customer.phone);
    window.open(buildWhatsAppLink(phone, message), "_blank");

    await fetch(`/api/crm/customers/${customer.id}/contact-log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: "WHATSAPP", templateKey: template.key }),
    });
    onClose();
  }

  return (
    <div className="absolute top-12 z-20 bg-white border rounded-lg shadow-lg p-2 w-72" dir="rtl">
      {data?.templates?.length ? (
        data.templates.map((t: any) => (
          <button
            key={t.key}
            className="block w-full text-right px-3 py-2 hover:bg-gray-50 rounded text-sm"
            onClick={() => send(t)}
          >
            {t.label}
          </button>
        ))
      ) : (
        <div className="text-sm text-gray-400 px-3 py-2">لا توجد قوالب</div>
      )}
    </div>
  );
}
```

### FILE: `components/crm/CustomerDataGrid.tsx`

```tsx
"use client";
import useSWR from "swr";
import { useState } from "react";
import { fetcher } from "@/lib/crm/fetcher";
import { QuickActions } from "./QuickActions";

const SEGMENT_STYLES: Record<string, string> = {
  VIP: "bg-yellow-100 text-yellow-800",
  REGULAR: "bg-green-100 text-green-800",
  AT_RISK: "bg-gray-100 text-gray-600",
  NEW: "bg-blue-100 text-blue-800",
};
const SEGMENT_LABELS: Record<string, string> = {
  VIP: "VIP",
  REGULAR: "منتظم",
  AT_RISK: "متقطع",
  NEW: "جديد",
};

function relativeDays(dateStr: string | null) {
  if (!dateStr) return "—";
  const days = Math.round((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
  if (days === 0) return "اليوم";
  if (days > 0) return `قبل ${days} يوم`;
  return `خلال ${Math.abs(days)} يوم`;
}

export function CustomerDataGrid({ onOpenProfile }: { onOpenProfile: (id: string) => void }) {
  const [page, setPage] = useState(1);
  const [dueOnly, setDueOnly] = useState(false);
  const [segment, setSegment] = useState("");

  const params = new URLSearchParams({
    page: String(page),
    pageSize: "50",
    ...(dueOnly ? { dueOnly: "true" } : {}),
    ...(segment ? { segment } : {}),
  });
  const { data, mutate } = useSWR(`/api/crm/customers?${params}`, fetcher);

  return (
    <div dir="rtl">
      <div className="flex items-center gap-3 mb-3">
        <select
          className="border rounded px-2 py-1 text-sm"
          value={segment}
          onChange={(e) => setSegment(e.target.value)}
        >
          <option value="">كل التصنيفات</option>
          {Object.entries(SEGMENT_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1 text-sm">
          <input type="checkbox" checked={dueOnly} onChange={(e) => setDueOnly(e.target.checked)} />
          مستحق اليوم فقط
        </label>
        <a
          href={`/api/crm/customers/export?format=xlsx${dueOnly ? "&dueOnly=true" : ""}${
            segment ? `&segment=${segment}` : ""
          }`}
          className="mr-auto text-sm text-blue-600 hover:underline"
        >
          تصدير Excel ⬇
        </a>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3 text-right sticky right-0 bg-gray-50">اسم الزبون</th>
              <th className="p-3 text-right">التصنيف</th>
              <th className="p-3 text-right">متوسط دورة الشراء</th>
              <th className="p-3 text-right">آخر طلب</th>
              <th className="p-3 text-right">الطلب المتوقع</th>
              <th className="p-3 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {data?.items?.map((row: any) => (
              <tr key={row.customerId} className="border-t hover:bg-gray-50">
                <td
                  className="p-3 sticky right-0 bg-white cursor-pointer font-medium"
                  onClick={() => onOpenProfile(row.customerId)}
                >
                  {row.customerId}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${SEGMENT_STYLES[row.segment]}`}
                  >
                    {SEGMENT_LABELS[row.segment]}
                  </span>
                </td>
                <td className="p-3">
                  {row.avgCycleDays ? `${Math.round(row.avgCycleDays)} يوماً` : "—"}
                </td>
                <td className="p-3">{relativeDays(row.lastOrderDate)}</td>
                <td className={`p-3 ${row.isOverdue ? "bg-red-50 text-red-700 font-medium" : ""}`}>
                  {row.predictedNextOrderDate
                    ? row.isOverdue
                      ? `متأخر ${Math.abs(
                          Math.round((Date.now() - new Date(row.predictedNextOrderDate).getTime()) / 86_400_000)
                        )} يوم`
                      : new Date(row.predictedNextOrderDate).toLocaleDateString("ar")
                    : "—"}
                </td>
                <td className="p-3">
                  <QuickActions
                    customer={{ id: row.customerId, name: row.customerId, phone: "" }}
                    onOpenProfile={onOpenProfile}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
        <span>الإجمالي: {data?.total ?? 0}</span>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-2 py-1 border rounded disabled:opacity-40">
            السابق
          </button>
          <button onClick={() => setPage((p) => p + 1)} className="px-2 py-1 border rounded">
            التالي
          </button>
        </div>
      </div>
    </div>
  );
}
```

> **ملاحظة مهمة للوكيل المنفّذ:** المكوّن أعلاه يعرض `customerId` كاسم مؤقت لأن `customer_purchase_stats` لا يخزّن اسم/هاتف الزبون (تُبقيهما Medusa). عليك دمج بيانات الاسم/الهاتف الفعلية عبر أحد خيارين: (أ) إضافة `JOIN` باستعلام SQL مباشر في `app/api/crm/customers/route.ts` يجلب `name`/`phone`/`business_name` من جدول Medusa `customer`، أو (ب) إضافة استدعاء دفعي لـ Medusa Admin API لجلب تفاصيل كل زبون بمعرّفاته. الخيار (أ) أفضل أداءً — نفّذه إن كانت قاعدة Medusa وPostgres الخاصة بـ Prisma هي نفس قاعدة البيانات فعلياً (تحقق من `DATABASE_URL` في كليهما).

### FILE: `components/crm/CustomerDrawer.tsx`

```tsx
"use client";
import useSWR from "swr";
import { useState } from "react";
import { fetcher } from "@/lib/crm/fetcher";

export function CustomerDrawer({
  customerId,
  onClose,
}: {
  customerId: string | null;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"overview" | "orders" | "notes" | "activity">("overview");
  const { data, mutate } = useSWR(
    customerId ? `/api/crm/customers/${customerId}/full` : null,
    fetcher
  );
  const [newNote, setNewNote] = useState("");

  if (!customerId) return null;

  async function addNote() {
    if (!newNote.trim()) return;
    await fetch(`/api/crm/customers/${customerId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: newNote }),
    });
    setNewNote("");
    mutate();
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end" dir="rtl">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl p-5 overflow-y-auto">
        <button className="absolute left-4 top-4 text-gray-400" onClick={onClose}>
          ✕
        </button>
        <h2 className="text-lg font-bold mb-4">ملف الزبون</h2>

        <div className="flex gap-4 border-b mb-4 text-sm">
          {[
            ["overview", "نظرة عامة"],
            ["orders", "الطلبات"],
            ["notes", "الملاحظات"],
            ["activity", "النشاط والتذكيرات"],
          ].map(([key, label]) => (
            <button
              key={key}
              className={`pb-2 ${tab === key ? "border-b-2 border-blue-600 font-medium" : "text-gray-400"}`}
              onClick={() => setTab(key as any)}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "overview" && data && (
          <div className="space-y-2 text-sm">
            <div>التصنيف: <b>{data.segment?.segment ?? "—"}</b></div>
            <div>عدد الطلبات: {data.stats?.totalOrders ?? 0}</div>
            <div>متوسط دورة الشراء: {data.stats?.avgCycleDays ? `${Math.round(data.stats.avgCycleDays)} يوماً` : "—"}</div>
            <div>الطلب المتوقع: {data.stats?.predictedNextOrderDate ? new Date(data.stats.predictedNextOrderDate).toLocaleDateString("ar") : "—"}</div>
          </div>
        )}

        {tab === "orders" && (
          <ul className="space-y-2 text-sm">
            {data?.recentOrders?.length ? (
              data.recentOrders.map((o: any) => (
                <li key={o.id} className="border rounded p-2 flex justify-between">
                  <span>#{o.display_id}</span>
                  <span>{o.status}</span>
                  <span>{new Date(o.created_at).toLocaleDateString("ar")}</span>
                </li>
              ))
            ) : (
              <li className="text-gray-400">لا توجد طلبات سابقة بعد</li>
            )}
          </ul>
        )}

        {tab === "notes" && (
          <div>
            <div className="flex gap-2 mb-3">
              <input
                className="flex-1 border rounded px-2 py-1 text-sm"
                placeholder="ملاحظة جديدة..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
              <button className="bg-blue-600 text-white rounded px-3 text-sm" onClick={addNote}>
                إضافة
              </button>
            </div>
            <ul className="space-y-2 text-sm">
              {data?.notes?.map((n: any) => (
                <li key={n.id} className="border rounded p-2">
                  <div>{n.body}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {n.authorName} — {new Date(n.createdAt).toLocaleString("ar")}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === "activity" && (
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium mb-2">التذكيرات القادمة</h3>
              <ul className="space-y-1">
                {data?.reminders?.map((r: any) => (
                  <li key={r.id} className="border rounded p-2">
                    {r.note ?? "متابعة"} — {new Date(r.dueAt).toLocaleString("ar")}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">سجل التواصل</h3>
              <ul className="space-y-1">
                {data?.contactLog?.map((c: any) => (
                  <li key={c.id} className="text-gray-500">
                    {c.channel} — {new Date(c.occurredAt).toLocaleString("ar")}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

### FILE: `app/(dashboard)/customers/page.tsx`

```tsx
"use client";
import { useState } from "react";
import { KpiBar } from "@/components/crm/KpiBar";
import { GlobalSearch } from "@/components/crm/GlobalSearch";
import { CustomerDataGrid } from "@/components/crm/CustomerDataGrid";
import { CustomerDrawer } from "@/components/crm/CustomerDrawer";

export default function CustomersPage() {
  const [openCustomerId, setOpenCustomerId] = useState<string | null>(null);

  return (
    <div className="p-6 max-w-7xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">إدارة الزبائن</h1>
        <GlobalSearch onSelect={setOpenCustomerId} />
      </div>

      <KpiBar />
      <CustomerDataGrid onOpenProfile={setOpenCustomerId} />

      <CustomerDrawer customerId={openCustomerId} onClose={() => setOpenCustomerId(null)} />
    </div>
  );
}
```

---

## 6. نقاط تحتاج تعديلاً يدوياً حسب واقع المستودع (لا تتخطاها بصمت)

| # | النقطة | لماذا يحتاج تدخّلاً |
|---|---|---|
| 1 | مسار `@/lib/prisma` | تأكد أن هذا هو المسار الفعلي لعميل Prisma المُصدَّر في المشروع؛ إن كان مختلفاً (`@/server/db` مثلاً) عدّل كل الاستيرادات |
| 2 | `lib/crm/auth.ts` | دالة `getCurrentEmployee()` هنا مؤقتة (stub بكوكيز)؛ استبدلها بآلية المصادقة الحقيقية للموظفين في Titan |
| 3 | استعلام `search/route.ts` | يفترض أعمدة `name_normalized`, `phone_normalized`, `business_name_normalized` على جدول `customer` في Medusa — إن لم تكن موجودة، أنشئها بترحيل SQL منفصل (migration) على قاعدة Medusa نفسها، مع الفهارس الموضّحة في `crm-technical-specs.md` (القسم 2 من مستند المشروع) |
| 4 | ربط اسم/هاتف الزبون بالجدول | كما ذُكر أعلى مكوّن `CustomerDataGrid` — يحتاج JOIN فعلي مع بيانات Medusa |
| 5 | `getMedusaCustomerOrders` / `listAllMedusaCustomersWithOrderDates` | تفترض Medusa Admin REST API القياسي؛ تحقق من نسخة Medusa الفعلية (v1 مقابل v2) لأن شكل استجابة `/admin/orders` قد يختلف |
| 6 | صلاحيات الوصول لصفحة `/customers` | لم يُضف middleware حماية هنا عمداً — أضفه حسب نظام الأدوار الموجود (مدير/مبيعات/إنتاج) |

---

## 7. قائمة تحقق نهائية (نفّذها بعد الانتهاء، ولا تعتبر المهمة منتهية قبلها)

- [ ] `npx prisma migrate dev` يعمل بدون أخطاء ويُنشئ الجداول الستة
- [ ] `npx tsx scripts/seed-message-templates.ts` يُدخل 3 قوالب في قاعدة البيانات
- [ ] `GET /api/crm/customers/kpis` يُعيد أرقاماً (أو أصفاراً إن كانت القاعدة فارغة) وليس خطأ 500
- [ ] فتح `/customers` يعرض شريط KPIs والجدول دون أخطاء في console المتصفح
- [ ] البحث عن اسم أو رقم هاتف تجريبي يُعيد نتيجة (بعد التأكد من تنفيذ نقطة 3 في الجدول أعلاه)
- [ ] النقر على زر واتساب يفتح `wa.me` برسالة مُعبّأة صحيحة
- [ ] إضافة ملاحظة وتذكير من الإجراءات السريعة يظهران فوراً في تبويبات ملف الزبون
- [ ] استدعاء `GET /api/cron/recompute-customer-stats` يدوياً (بترويسة `Authorization: Bearer $CRON_SECRET`) يُحدّث جداول `CustomerPurchaseStats` و`CustomerSegment` دون أخطاء
- [ ] تصدير Excel ينزّل ملفاً صالحاً للفتح بترتيب أعمدة RTL صحيح

**عند الانتهاء، لخّص للمستخدم:** أي بند من القسم 6 تطلّب قراراً أو تعديلاً يدوياً فعلياً، وأي جزء من الميزات العشرين لم يُستكمل لسبب تقني (بيانات ناقصة، API غير متوفر، إلخ).


