"use client";
import useSWR from "swr";
import { useState } from "react";
import { fetcher } from "@/lib/crm/fetcher";

export function CustomerDrawer({
  customerId,
  onClose,
}: {
  customerId: string | null;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"overview" | "orders" | "notes" | "activity">("overview");
  const [newNote, setNewNote] = useState("");

  const { data, mutate } = useSWR(
    customerId ? `/api/crm/customers/${customerId}` : null,
    fetcher
  );

  if (!customerId) return null;

  async function addNote() {
    if (!newNote.trim()) return;
    await fetch(`/api/crm/customers/${customerId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: newNote }),
    });
    setNewNote("");
    mutate();
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end" dir="rtl">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl p-5 overflow-y-auto">
        <button className="absolute left-4 top-4 text-gray-400" onClick={onClose}>
          ✕
        </button>
        <h2 className="text-lg font-bold mb-4">ملف الزبون</h2>

        <div className="flex gap-4 border-b mb-4 text-sm">
          {[
            ["overview", "نظرة عامة"],
            ["orders", "الطلبات"],
            ["notes", "الملاحظات"],
            ["activity", "النشاط والتذكيرات"],
          ].map(([key, label]) => (
            <button
              key={key}
              className={`pb-2 ${
                tab === key ? "border-b-2 border-blue-600 font-medium" : "text-gray-400"
              }`}
              onClick={() => setTab(key as any)}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "overview" && data && (
          <div className="space-y-2 text-sm">
            <div>
              التصنيف: <b>{data.segment?.segment ?? "—"}</b>
            </div>
            <div>عدد الطلبات: {data.stats?.totalOrders ?? 0}</div>
            <div>
              متوسط دورة الشراء:{" "}
              {data.stats?.avgCycleDays ? `${Math.round(data.stats.avgCycleDays)} يوماً` : "—"}
            </div>
            <div>
              الطلب المتوقع:{" "}
              {data.stats?.predictedNextOrderDate
                ? new Date(data.stats.predictedNextOrderDate).toLocaleDateString("ar")
                : "—"}
            </div>
          </div>
        )}

        {tab === "orders" && (
          <ul className="space-y-2 text-sm">
            {data?.recentOrders?.length ? (
              data.recentOrders.map((o: any) => (
                <li key={o.id} className="border rounded p-2 flex justify-between">
                  <span>#{o.display_id}</span>
                  <span>{o.status}</span>
                  <span>{new Date(o.created_at).toLocaleDateString("ar")}</span>
                </li>
              ))
            ) : (
              <li className="text-gray-400">لا توجد طلبات سابقة بعد</li>
            )}
          </ul>
        )}

        {tab === "notes" && (
          <div>
            <div className="flex gap-2 mb-3">
              <input
                className="flex-1 border rounded px-2 py-1 text-sm"
                placeholder="ملاحظة جديدة..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
              <button className="bg-blue-600 text-white rounded px-3 text-sm" onClick={addNote}>
                إضافة
              </button>
            </div>
            <ul className="space-y-2 text-sm">
              {data?.notes?.map((n: any) => (
                <li key={n.id} className="border rounded p-2">
                  <div>{n.body}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {n.authorName} — {new Date(n.createdAt).toLocaleString("ar")}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === "activity" && (
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium mb-2">التذكيرات القادمة</h3>
              <ul className="space-y-1">
                {data?.reminders?.map((r: any) => (
                  <li key={r.id} className="border rounded p-2">
                    {r.note ?? "متابعة"} — {new Date(r.dueAt).toLocaleString("ar")}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">سجل التواصل</h3>
              <ul className="space-y-1">
                {data?.contactLog?.map((c: any) => (
                  <li key={c.id} className="text-gray-500">
                    {c.channel} — {new Date(c.occurredAt).toLocaleString("ar")}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
