import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMedusaCustomerOrders } from "@/lib/crm/medusa";

/** ملف الزبون الكامل — يستهلكه CustomerDrawer */
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
