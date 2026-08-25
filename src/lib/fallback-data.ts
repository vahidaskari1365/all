import type { CategoryRow, CityRow } from "@/lib/queries";

/**
 * داده‌های ایستای پشتیبان (Fallback).
 *
 * اگر دیتابیس در دسترس نباشد یا هنوز seed نشده باشد، به‌جای اینکه بخش
 * «دسته‌بندی خدمات» و فیلترهای شهر/دسته خالی بمانند، همین فهرست پیش‌فرض
 * (دقیقاً مطابق داده‌های seed اولیه) نمایش داده می‌شود تا سایت مثل قبل
 * کامل دیده شود. به‌محض اتصال دیتابیس، داده‌های واقعی جایگزین می‌شوند.
 */
export const FALLBACK_CATEGORIES: CategoryRow[] = [
  { id: -1, name: "رستوران و کافه", slug: "restaurant", icon: "utensils", color: "amber" },
  { id: -2, name: "آرایشگاه و زیبایی", slug: "beauty", icon: "scissors", color: "rose" },
  { id: -3, name: "کلینیک و دندانپزشکی", slug: "clinic", icon: "stethoscope", color: "sky" },
  { id: -4, name: "دیجیتال و موبایل", slug: "digital", icon: "smartphone", color: "indigo" },
  { id: -5, name: "پوشاک و مد", slug: "fashion", icon: "shirt", color: "violet" },
  { id: -6, name: "بدنسازی و ورزش", slug: "fitness", icon: "dumbbell", color: "emerald" },
  { id: -7, name: "خودرو و خدمات", slug: "automotive", icon: "car", color: "teal" },
  { id: -8, name: "آموزشگاه", slug: "training", icon: "graduation", color: "primary" },
  { id: -9, name: "لوازم خانگی", slug: "home-appliances", icon: "home", color: "primary" },
  { id: -10, name: "عکاسی و استودیو", slug: "studio", icon: "camera", color: "rose" },
];

export const FALLBACK_CITIES: CityRow[] = [
  { id: -1, name: "تهران", slug: "tehran", province: "استان تهران" },
  { id: -2, name: "اصفهان", slug: "isfahan", province: "استان اصفهان" },
  { id: -3, name: "شیراز", slug: "shiraz", province: "استان فارس" },
  { id: -4, name: "مشهد", slug: "mashhad", province: "استان خراسان رضوی" },
  { id: -5, name: "تبریز", slug: "tabriz", province: "استان آذربایجان شرقی" },
  { id: -6, name: "کرج", slug: "karaj", province: "استان البرز" },
  { id: -7, name: "اهواز", slug: "ahvaz", province: "استان خوزستان" },
  { id: -8, name: "قم", slug: "qom", province: "استان قم" },
];
