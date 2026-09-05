"use client";
import { useState } from "react";
import { KpiBar } from "@/components/crm/KpiBar";
import { GlobalSearch } from "@/components/crm/GlobalSearch";
import { CustomerDataGrid } from "@/components/crm/CustomerDataGrid";
import { CustomerDrawer } from "@/components/crm/CustomerDrawer";

export default function CustomersPage() {
  const [openCustomerId, setOpenCustomerId] = useState<string | null>(null);

  return (
    <div className="p-6 max-w-7xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">إدارة الزبائن</h1>
        <GlobalSearch onSelect={setOpenCustomerId} />
      </div>

      <KpiBar />
      <CustomerDataGrid onOpenProfile={setOpenCustomerId} />

      <CustomerDrawer customerId={openCustomerId} onClose={() => setOpenCustomerId(null)} />
    </div>
  );
}
