/** اعتبارسنجی متمرکز ورودی‌ها — سخت‌گیرانه برای ورودی‌های عمومی */

export const PHONE_RE = /^0?9\d{9}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** URL امن: فقط http/https و بدون اسکریپت */
export function safeUrl(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  try {
    const u = new URL(v);
    if (!["http:", "https:"].includes(u.protocol)) return null;
    return u.toString();
  } catch {
    return null;
  }
}

/** پاک‌سازی متن ورودی: حذف تگ‌ها و محدودسازی طول */
export function cleanText(value: unknown, max = 2000): string {
  const s = String(value ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .trim();
  return s.slice(0, max);
}

/** نام کاربری فارسی/انگلیسی */
export function isValidName(value: string, min = 3): boolean {
  const v = cleanText(value, 120);
  return v.length >= min && /[\u0600-\u06FFa-zA-Z]/.test(v);
}

/** تبدیل اعداد فارسی و عربی به انگلیسی برای ورودی فرم‌ها */
export function normalizeDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

/** شماره موبایل ایرانی */
export function normalizePhone(value: string): string | null {
  const v = normalizeDigits(cleanText(value, 40)).replace(/[\s-]/g, "");
  if (!PHONE_RE.test(v)) return null;
  return v.length === 10 ? `0${v}` : v;
}

/** ایمیل معتبر (اختیاری: خالی مجاز) */
export function isValidEmailOrEmpty(value: string): boolean {
  const v = cleanText(value, 120);
  if (!v) return true;
  return EMAIL_RE.test(v);
}

export function isValidEmail(value: string): boolean {
  const v = cleanText(value, 190);
  if (!v) return false;
  return EMAIL_RE.test(v);
}

/** عرض جغرافیایی معتبر (اختیاری) */
export function isValidLatLng(value: string | null | undefined): boolean {
  if (!value || !value.trim()) return true;
  const n = Number(value);
  return Number.isFinite(n) && Math.abs(n) <= 90;
}

/** longitude معتبر */
export function isValidLng(value: string | null | undefined): boolean {
  if (!value || !value.trim()) return true;
  const n = Number(value);
  return Number.isFinite(n) && Math.abs(n) <= 180;
}

/** آیدی عددی امن */
export function parseId(value: unknown): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 && n < 10_000_000 ? n : null;
}
