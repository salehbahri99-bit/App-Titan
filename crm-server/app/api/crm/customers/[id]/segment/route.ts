import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const segment = await prisma.customerSegment.findUnique({ where: { customerId: params.id } });
  if (!segment)
    return NextResponse.json({ error: "لا يوجد تصنيف بعد لهذا الزبون" }, { status: 404 });
  return NextResponse.json(segment);
}
