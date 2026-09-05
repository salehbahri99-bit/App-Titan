/** تطبيع رقم الهاتف: يزيل كل شيء عدا الأرقام، ويوحّد صيغة رمز الدولة */
export function normalizePhone(raw: string, defaultCountryCode = "970"): string {
  let digits = raw.replace(/[^\d]/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = defaultCountryCode + digits.slice(1);
  if (!digits.startsWith(defaultCountryCode) && digits.length <= 10) {
    digits = defaultCountryCode + digits;
  }
  return digits; // مثال: "970599123456" — جاهز لاستخدامه في wa.me
}

/** تطبيع نص عربي للبحث: إزالة التطويل وتوحيد الهمزات */
export function normalizeArabicText(input: string): string {
  return input
    .replace(/[ـ]/g, "") // إزالة التطويل ـ
    .replace(/[إأآا]/g, "ا")
    .replace(/[ة]/g, "ه")
    .replace(/[ى]/g, "ي")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}
