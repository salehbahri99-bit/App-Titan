export function buildWhatsAppLink(phoneIntlDigitsOnly: string, message: string): string {
  return `https://wa.me/${phoneIntlDigitsOnly}?text=${encodeURIComponent(message)}`;
}

export function renderTemplate(body: string, ctx: Record<string, string>): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key) => ctx[key] ?? "—");
}
