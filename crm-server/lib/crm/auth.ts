// ملاحظة: هذه دالة مؤقتة (stub) — استبدلها بآلية المصادقة الفعلية
// الموجودة في مشروع Titan (جلسة NextAuth أو JWT الموظفين) إن وُجدت مسبقاً.
// الغرض هنا فقط توحيد نقطة استدعاء واحدة تستخدمها كل مسارات API.
import { cookies } from "next/headers";

export interface CurrentEmployee {
  id: string;
  name: string;
}

export async function getCurrentEmployee(): Promise<CurrentEmployee> {
  const jar = cookies();
  const employeeId = jar.get("employee_id")?.value;
  const employeeName = jar.get("employee_name")?.value;
  if (!employeeId) throw new Error("UNAUTHENTICATED");
  return { id: employeeId, name: employeeName ?? "موظف" };
}

/** يحوّل خطأ المصادقة إلى استجابة 401 بدل 500 في مسارات API */
export function unauthenticatedResponse() {
  return Response.json({ error: "غير مصرّح" }, { status: 401 });
}
