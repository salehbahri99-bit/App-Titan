"use client";
import { useState } from "react";
import { WhatsAppTemplateMenu } from "./WhatsAppTemplateMenu";

export function QuickActions({
  customer,
  onOpenProfile,
}: {
  customer: { id: string; name: string; phone: string };
  onOpenProfile: (id: string) => void;
}) {
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [reminderDate, setReminderDate] = useState("");

  async function saveNote() {
    if (!noteText.trim()) return;
    await fetch(`/api/crm/customers/${customer.id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: noteText }),
    });
    setNoteText("");
    setShowNote(false);
  }

  async function saveReminder() {
    if (!reminderDate) return;
    await fetch(`/api/crm/customers/${customer.id}/reminders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dueAt: reminderDate }),
    });
    setReminderDate("");
    setShowReminder(false);
  }

  return (
    <div className="flex items-center gap-2 relative" dir="rtl">
      <button
        aria-label="محادثة واتساب"
        className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-green-50 text-green-600 text-lg"
        onClick={() => setShowWhatsApp((v) => !v)}
      >
        💬
      </button>
      {showWhatsApp && (
        <WhatsAppTemplateMenu customer={customer} onClose={() => setShowWhatsApp(false)} />
      )}

      <button
        aria-label="فتح الملف"
        className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-600 text-lg"
        onClick={() => onOpenProfile(customer.id)}
      >
        👤
      </button>

      <button
        aria-label="إضافة ملاحظة"
        className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-yellow-50 text-yellow-600 text-lg"
        onClick={() => setShowNote((v) => !v)}
      >
        📝
      </button>
      {showNote && (
        <div className="absolute top-12 z-20 bg-white border rounded-lg shadow-lg p-3 w-64">
          <textarea
            className="w-full border rounded p-2 text-sm"
            rows={3}
            placeholder="ملاحظة سريعة..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
          <button
            className="mt-2 w-full bg-blue-600 text-white rounded py-1 text-sm"
            onClick={saveNote}
          >
            حفظ
          </button>
        </div>
      )}

      <button
        aria-label="تذكير"
        className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-purple-50 text-purple-600 text-lg"
        onClick={() => setShowReminder((v) => !v)}
      >
        ⏰
      </button>
      {showReminder && (
        <div className="absolute top-12 z-20 bg-white border rounded-lg shadow-lg p-3 w-64">
          <input
            type="datetime-local"
            className="w-full border rounded p-2 text-sm"
            value={reminderDate}
            onChange={(e) => setReminderDate(e.target.value)}
          />
          <button
            className="mt-2 w-full bg-purple-600 text-white rounded py-1 text-sm"
            onClick={saveReminder}
          >
            جدولة التذكير
          </button>
        </div>
      )}
    </div>
  );
}
