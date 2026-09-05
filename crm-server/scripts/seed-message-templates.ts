import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TEMPLATES = [
  {
    key: "order_reminder",
    label: "تذكير بالطلب المعتاد",
    category: "REMINDER",
    body: "مرحباً {{customerName}}، هل حان وقت تجديد طلبكم المعتاد من {{businessName}}؟ 😊",
  },
  {
    key: "new_offer",
    label: "عرض جديد",
    category: "OFFER",
    body: "أهلاً {{customerName}}! لدينا عرض جديد هذا الأسبوع قد يهمّكم.",
  },
  {
    key: "quality_followup",
    label: "متابعة الجودة",
    category: "QUALITY_FOLLOWUP",
    body: "مرحباً {{customerName}}، نتابع معكم بخصوص جودة آخر طلب بتاريخ {{lastOrderDate}}.",
  },
];

async function main() {
  for (const t of TEMPLATES) {
    await prisma.messageTemplate.upsert({
      where: { key: t.key },
      update: t,
      create: t,
    });
  }
  console.log(`Seeded ${TEMPLATES.length} message templates.`);
}

main().finally(() => prisma.$disconnect());
