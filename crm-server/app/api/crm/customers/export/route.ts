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
      customerId: s.customerId,
      totalOrders: s.totalOrders,
      avgCycleDays: s.avgCycleDays === null ? "" : Math.round(s.avgCycleDays),
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
