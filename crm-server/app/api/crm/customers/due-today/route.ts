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
