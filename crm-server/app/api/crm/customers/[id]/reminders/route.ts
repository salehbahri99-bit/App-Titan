import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentEmployee } from "@/lib/crm/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const reminders = await prisma.followUpReminder.findMany({
    where: { customerId: params.id },
    orderBy: { dueAt: "asc" },
  });
  return NextResponse.json({ reminders });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  let employee;
  try {
    employee = await getCurrentEmployee();
  } catch {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }

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
