import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeArabicText, normalizePhone } from "@/lib/crm/normalize";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  const normalizedQuery = normalizeArabicText(q);
  const phoneQuery = normalizePhone(q);

  // ملاحظة: هذا الاستعلام يفترض جدول `customer` مُدار عبر Medusa مع أعمدة مُطبَّعة
  // (name_normalized / business_name_normalized / phone_normalized) وفهارس pg_trgm.
  // إن لم تكن موجودة، أنشئها بترحيل SQL منفصل على قاعدة Medusa — انظر README.
  const results = await prisma.$queryRawUnsafe(
    `
    SELECT id, name, phone, business_name as "businessName"
    FROM customer
    WHERE name_normalized ILIKE '%' || $1 || '%'
       OR business_name_normalized ILIKE '%' || $1 || '%'
       OR phone_normalized LIKE '%' || $2 || '%'
    LIMIT 20
    `,
    normalizedQuery,
    phoneQuery
  );

  return NextResponse.json({ results });
}
