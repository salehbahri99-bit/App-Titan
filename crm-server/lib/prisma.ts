// عميل Prisma وحيد مُعاد الاستخدام (يمنع استنزاف اتصالات القاعدة في وضع التطوير).
// عند الدمج في مستودع Titan: احذف هذا الملف واستورد عميل Prisma الموجود هناك،
// وعدّل مسار الاستيراد "@/lib/prisma" في كل ملفات app/api/crm.
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
