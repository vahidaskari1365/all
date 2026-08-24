/** ادغام نام کلاس‌ها (cn ساده بدون وابستگی خارجی) */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** تبدیل اعداد انگلیسی به فارسی */
const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
export function toFa(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

/** قالب‌بندی قیمت به تومان */
export function formatPrice(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";
  const num = typeof value === "number" ? value : Number(String(value).replace(/[^\d]/g, ""));
  if (Number.isNaN(num)) return String(value);
  return toFa(num.toLocaleString("en-US"));
}

/** ساخت slug امن از متن */
export function slugify(text: string): string {
  return (
    text
      .trim()
      .replace(/[\s_]+/g, "-")
      .replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase() || `b-${Math.random().toString(36).slice(2, 8)}`
  );
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2);
  return (parts[0][0] ?? "") + (parts[1][0] ?? "");
}
