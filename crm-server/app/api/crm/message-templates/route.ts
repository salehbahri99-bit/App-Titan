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
