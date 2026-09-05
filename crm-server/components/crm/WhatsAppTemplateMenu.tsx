"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/crm/fetcher";
import { buildWhatsAppLink, renderTemplate } from "@/lib/crm/whatsapp";
import { normalizePhone } from "@/lib/crm/normalize";

export function WhatsAppTemplateMenu({
  customer,
  onClose,
}: {
  customer: { id: string; name: string; phone: string };
  onClose: () => void;
}) {
  const { data } = useSWR("/api/crm/message-templates", fetcher);

  async function send(template: { key: string; body: string }) {
    const message = renderTemplate(template.body, { customerName: customer.name });
    const phone = normalizePhone(customer.phone);
    window.open(buildWhatsAppLink(phone, message), "_blank");

    await fetch(`/api/crm/customers/${customer.id}/contact-log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: "WHATSAPP", templateKey: template.key }),
    });
    onClose();
  }

  return (
    <div className="absolute top-12 z-20 bg-white border rounded-lg shadow-lg p-2 w-72" dir="rtl">
      {data?.templates?.length ? (
        data.templates.map((t: any) => (
          <button
            key={t.key}
            className="block w-full text-right px-3 py-2 hover:bg-gray-50 rounded text-sm"
            onClick={() => send(t)}
          >
            {t.label}
          </button>
        ))
      ) : (
        <div className="text-sm text-gray-400 px-3 py-2">لا توجد قوالب</div>
      )}
    </div>
  );
}
