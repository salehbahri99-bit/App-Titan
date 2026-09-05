"use client";
import useSWR from "swr";
import { useState } from "react";
import { fetcher } from "@/lib/crm/fetcher";
import { QuickActions } from "./QuickActions";

const SEGMENT_STYLES: Record<string, string> = {
  VIP: "bg-yellow-100 text-yellow-800",
  REGULAR: "bg-green-100 text-green-800",
  AT_RISK: "bg-gray-100 text-gray-600",
  NEW: "bg-blue-100 text-blue-800",
};
const SEGMENT_LABELS: Record<string, string> = {
  VIP: "VIP",
  REGULAR: "منتظم",
  AT_RISK: "متقطع",
  NEW: "جديد",
};

function relativeDays(dateStr: string | null) {
  if (!dateStr) return "—";
  const days = Math.round((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
  if (days === 0) return "اليوم";
  if (days > 0) return `قبل ${days} يوم`;
  return `خلال ${Math.abs(days)} يوم`;
}

export function CustomerDataGrid({ onOpenProfile }: { onOpenProfile: (id: string) => void }) {
  const [page, setPage] = useState(1);
  const [dueOnly, setDueOnly] = useState(false);
  const [segment, setSegment] = useState("");

  const params = new URLSearchParams({
    page: String(page),
    pageSize: "50",
    ...(dueOnly ? { dueOnly: "true" } : {}),
    ...(segment ? { segment } : {}),
  });
  const { data } = useSWR(`/api/crm/customers?${params}`, fetcher);

  const pageCount = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div dir="rtl">
      <div className="flex items-center gap-3 mb-3">
        <select
          className="border rounded px-2 py-1 text-sm"
          value={segment}
          onChange={(e) => {
            setSegment(e.target.value);
            setPage(1);
          }}
        >
          <option value="">كل التصنيفات</option>
          {Object.entries(SEGMENT_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1 text-sm">
          <input
            type="checkbox"
            checked={dueOnly}
            onChange={(e) => {
              setDueOnly(e.target.checked);
              setPage(1);
            }}
          />
          مستحق اليوم فقط
        </label>
        <a
          href={`/api/crm/customers/export?format=xlsx${dueOnly ? "&dueOnly=true" : ""}${
            segment ? `&segment=${segment}` : ""
          }`}
          className="mr-auto text-sm text-blue-600 hover:underline"
        >
          تصدير Excel ⬇
        </a>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3 text-right sticky right-0 bg-gray-50">اسم الزبون</th>
              <th className="p-3 text-right">التصنيف</th>
              <th className="p-3 text-right">متوسط دورة الشراء</th>
              <th className="p-3 text-right">آخر طلب</th>
              <th className="p-3 text-right">الطلب المتوقع</th>
              <th className="p-3 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {data?.items?.map((row: any) => (
              <tr key={row.customerId} className="border-t hover:bg-gray-50">
                <td
                  className="p-3 sticky right-0 bg-white cursor-pointer font-medium"
                  onClick={() => onOpenProfile(row.customerId)}
                >
                  {row.name ?? row.customerId}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${SEGMENT_STYLES[row.segment]}`}
                  >
                    {SEGMENT_LABELS[row.segment]}
                  </span>
                </td>
                <td className="p-3">
                  {row.avgCycleDays ? `${Math.round(row.avgCycleDays)} يوماً` : "—"}
                </td>
                <td className="p-3">{relativeDays(row.lastOrderDate)}</td>
                <td className={`p-3 ${row.isOverdue ? "bg-red-50 text-red-700 font-medium" : ""}`}>
                  {row.predictedNextOrderDate
                    ? row.isOverdue
                      ? `متأخر ${Math.abs(
                          Math.round(
                            (Date.now() - new Date(row.predictedNextOrderDate).getTime()) /
                              86_400_000
                          )
                        )} يوم`
                      : new Date(row.predictedNextOrderDate).toLocaleDateString("ar")
                    : "—"}
                </td>
                <td className="p-3">
                  <QuickActions
                    customer={{
                      id: row.customerId,
                      name: row.name ?? row.customerId,
                      phone: row.phone ?? "",
                    }}
                    onOpenProfile={onOpenProfile}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
        <span>الإجمالي: {data?.total ?? 0}</span>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-2 py-1 border rounded disabled:opacity-40"
          >
            السابق
          </button>
          <button
            disabled={page >= pageCount}
            onClick={() => setPage((p) => p + 1)}
            className="px-2 py-1 border rounded disabled:opacity-40"
          >
            التالي
          </button>
        </div>
      </div>
    </div>
  );
}
