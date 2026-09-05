import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { listAllMedusaCustomersWithOrderDates } from "@/lib/crm/medusa";
import {
  computePurchaseCycle,
  predictNextOrder,
  isOverdue,
  computeRFMBatch,
} from "@/lib/crm/purchase-cycle";

export const maxDuration = 300; // ثوانٍ — مهلة أطول من الافتراضي لقاعدة زبائن كبيرة

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
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
    (
      await prisma.customerPurchaseStats.findMany({
        where: { isOverdue: true },
        select: { customerId: true },
      })
    ).map((s) => s.customerId)
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
          // إعادة تصفير علم الإشعار فقط إن لم يعد متأخراً (يسمح بإشعار جديد لاحقاً)
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
