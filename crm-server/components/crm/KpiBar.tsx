"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/crm/fetcher";

export function KpiBar() {
  const { data } = useSWR("/api/crm/customers/kpis", fetcher, { refreshInterval: 60_000 });

  const cards = [
    { label: "إجمالي الزبائن", value: data?.totalCustomers },
    { label: "الزبائن النشطون", value: data?.activeCustomers },
    { label: "زبائن VIP", value: data?.vipCustomers },
    { label: "يحتاجون متابعة اليوم", value: data?.dueTodayCount, highlight: true },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6" dir="rtl">
      {cards.map((c) => (
        <div
          key={c.label}
          className={`rounded-xl border p-4 shadow-sm ${
            c.highlight ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"
          }`}
        >
          <div className="text-sm text-gray-500">{c.label}</div>
          <div className="text-2xl font-bold mt-1">{c.value ?? "—"}</div>
        </div>
      ))}
    </div>
  );
}
