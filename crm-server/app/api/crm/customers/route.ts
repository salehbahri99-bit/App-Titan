import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// حقول الترتيب المسموح بها — يمنع تمرير اسم عمود غير موجود من الـ query string
const SORTABLE = [
  "predictedNextOrderDate",
  "lastOrderDate",
  "totalOrders",
  "avgCycleDays",
  "updatedAt",
] as const;

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, Number(sp.get("page") ?? "1") || 1);
  const pageSize = Math.min(Number(sp.get("pageSize") ?? "50") || 50, 200);
  const segment = sp.get("segment");
  const dueOnly = sp.get("dueOnly") === "true";
  const requestedSort = sp.get("sortBy") ?? "predictedNextOrderDate";
  const sortBy = (SORTABLE as readonly string[]).includes(requestedSort)
    ? requestedSort
    : "predictedNextOrderDate";
  const sortDir = sp.get("sortDir") === "desc" ? "desc" : "asc";

  const where: any = {};
  if (dueOnly) {
    where.predictedNextOrderDate = {
      lte: new Date(Date.now() + 3 * 86_400_000),
      not: null,
    };
  }

  if (segment) {
    const rows = await prisma.customerSegment.findMany({
      where: { segment },
      select: { customerId: true },
    });
    where.customerId = { in: rows.map((r) => r.customerId) };
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
