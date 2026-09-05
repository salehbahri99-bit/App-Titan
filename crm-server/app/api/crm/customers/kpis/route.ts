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
    console.error("[crm/kpis]", e);
    return NextResponse.json(
      { totalCustomers: null, activeCustomers: null, vipCustomers: null, dueTodayCount: null },
      { status: 200 }
    );
  }
}
