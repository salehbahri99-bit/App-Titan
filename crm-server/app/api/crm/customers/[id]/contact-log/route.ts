import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentEmployee } from "@/lib/crm/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  let employee;
  try {
    employee = await getCurrentEmployee();
  } catch {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }

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
