const MEDUSA_URL = process.env.MEDUSA_BACKEND_URL!;
const MEDUSA_KEY = process.env.MEDUSA_ADMIN_API_KEY!;

async function medusaFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${MEDUSA_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MEDUSA_KEY}`,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Medusa API error ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function getMedusaCustomerOrders(customerId: string, page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize;
  return medusaFetch(
    `/admin/orders?customer_id[]=${encodeURIComponent(customerId)}` +
      `&limit=${pageSize}&offset=${offset}&order=-created_at`
  );
}

export async function listAllMedusaCustomersWithOrderDates(): Promise<
  { customerId: string; orderDates: Date[]; totalSpend: number }[]
> {
  // ملاحظة: هذه دالة تجميعية تُستخدم من قِبل جوب الحساب الليلي.
  // إن كانت قاعدة الزبائن كبيرة (>5000)، استبدل هذا بـ SQL مباشر على قاعدة Medusa
  // بدل تصفّح كل الصفحات عبر REST API، لتفادي بطء الجوب الليلي.
  const byCustomer = new Map<string, { orderDates: Date[]; totalSpend: number }>();
  let offset = 0;
  const limit = 200;

  while (true) {
    const { orders } = await medusaFetch(
      `/admin/orders?limit=${limit}&offset=${offset}&order=customer_id&fields=id,customer_id,created_at,total,status`
    );
    if (!orders || orders.length === 0) break;

    for (const o of orders) {
      if (o.status === "canceled" || !o.customer_id) continue;
      const entry = byCustomer.get(o.customer_id) ?? { orderDates: [], totalSpend: 0 };
      entry.orderDates.push(new Date(o.created_at));
      entry.totalSpend += o.total ?? 0;
      byCustomer.set(o.customer_id, entry);
    }

    if (orders.length < limit) break;
    offset += limit;
  }

  return [...byCustomer].map(([customerId, v]) => ({ customerId, ...v }));
}
