import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentEmployee } from "@/lib/crm/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const notes = await prisma.customerNote.findMany({
    where: { customerId: params.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ notes });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  let employee;
  try {
    employee = await getCurrentEmployee();
  } catch {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }

  const { body } = await req.json();
  if (!body?.trim()) return NextResponse.json({ error: "الملاحظة فارغة" }, { status: 400 });

  const note = await prisma.customerNote.create({
    data: {
      customerId: params.id,
      authorId: employee.id,
      authorName: employee.name,
      body: body.trim(),
    },
  });
  return NextResponse.json(note, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  let employee;
  try {
    employee = await getCurrentEmployee();
  } catch {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }

  const { noteId } = await req.json();
  const note = await prisma.customerNote.findUnique({ where: { id: noteId } });
  if (!note) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  if (note.authorId !== employee.id) {
    return NextResponse.json({ error: "لا يمكنك حذف ملاحظة زميل آخر" }, { status: 403 });
  }
  await prisma.customerNote.delete({ where: { id: noteId } });
  return NextResponse.json({ ok: true });
}
