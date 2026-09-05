"use client";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/crm/fetcher";

export function GlobalSearch({ onSelect }: { onSelect: (customerId: string) => void }) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  const { data } = useSWR(
    debounced.length >= 2 ? `/api/crm/customers/search?q=${encodeURIComponent(debounced)}` : null,
    fetcher
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("crm-global-search")?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative w-full max-w-md" dir="rtl">
      <input
        id="crm-global-search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        placeholder="ابحث بالاسم، الهاتف، أو اسم النشاط... (Ctrl+K)"
        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      {open && data?.results?.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-80 overflow-y-auto">
          {data.results.map((r: any) => (
            <li
              key={r.id}
              className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm"
              onClick={() => {
                onSelect(r.id);
                setOpen(false);
                setQuery("");
              }}
            >
              <div className="font-medium">{r.name}</div>
              <div className="text-gray-500 text-xs">
                {r.businessName} · {r.phone}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
