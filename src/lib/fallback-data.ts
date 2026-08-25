import type { BusinessWithMeta, CategoryRow, CityRow } from "@/lib/queries";

/**
 * داده‌های ایستای پشتیبان (Fallback).
 *
 * اگر دیتابیس در دسترس نباشد یا هنوز seed نشده باشد، به‌جای اینکه بخش
 * «دسته‌بندی خدمات» و فیلترهای شهر/دسته خالی بمانند، همین فهرست پیش‌فرض
 * (مطابق داده‌های seed اولیه) نمایش داده می‌شود تا سایت مثل قبل کامل دیده شود.
 * به‌محض اتصال دیتابیس، داده‌های واقعی جایگزین می‌شوند.
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

const FALLBACK_COVERS = {
  restaurant:
    "https://images.pexels.com/photos/31125216/pexels-photo-31125216.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  beauty:
    "https://images.pexels.com/photos/7195805/pexels-photo-7195805.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  clinic:
    "https://images.pexels.com/photos/6502543/pexels-photo-6502543.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  digital:
    "https://images.pexels.com/photos/12968298/pexels-photo-12968298.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  fitness:
    "https://images.pexels.com/photos/38882512/pexels-photo-38882512.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  automotive:
    "https://images.pexels.com/photos/33814734/pexels-photo-33814734.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
};

function fallbackBusiness({
  id,
  name,
  slug,
  categorySlug,
  citySlug,
  district,
  tagline,
  rating,
  reviewCount,
  coverUrl,
  featured = true,
}: {
  id: number;
  name: string;
  slug: string;
  categorySlug: string;
  citySlug: string;
  district: string;
  tagline: string;
  rating: number;
  reviewCount: number;
  coverUrl: string;
  featured?: boolean;
}): BusinessWithMeta {
  const category = FALLBACK_CATEGORIES.find((item) => item.slug === categorySlug) ?? null;
  const city = FALLBACK_CITIES.find((item) => item.slug === citySlug) ?? null;
  return {
    id,
    name,
    slug,
    categoryId: category?.id ?? -1,
    cityId: city?.id ?? -1,
    district,
    tagline,
    description: "اطلاعات نمونه برای نمایش قابلیت‌های کسب‌یاب.",
    address: `${district}، ${city?.name ?? "ایران"}`,
    phone: "02100000000",
    mobile: "09120000000",
    email: null,
    website: null,
    logoUrl: null,
    coverUrl,
    lat: null,
    lng: null,
    instagram: null,
    telegram: null,
    whatsapp: null,
    workHours: "شنبه تا پنجشنبه ۹ تا ۲۲",
    hasLicense: true,
    unionMember: true,
    hasGuarantee: false,
    hasShowcase: false,
    rating,
    reviewCount,
    featured,
    verified: true,
    status: "active",
    reviewNote: null,
    ownerId: null,
    createdAt: new Date(0),
    category,
    city,
  };
}

/** چند نمونه‌ی قابل مشاهده برای زمانی که دیتابیس هنوز seed نشده است */
export const FALLBACK_BUSINESSES: BusinessWithMeta[] = [
  fallbackBusiness({
    id: -101,
    name: "رستوران سنتی اصغر",
    slug: "asghar-traditional-restaurant",
    categorySlug: "restaurant",
    citySlug: "tehran",
    district: "سعادت‌آباد",
    tagline: "ذائقه اصیل ایرانی با بیش از ۲۰ سال سابقه",
    rating: 5,
    reviewCount: 248,
    coverUrl: FALLBACK_COVERS.restaurant,
  }),
  fallbackBusiness({
    id: -102,
    name: "سالن زیبایی رویال",
    slug: "royal-beauty-salon",
    categorySlug: "beauty",
    citySlug: "tehran",
    district: "میرداماد",
    tagline: "خدمات آرایشی و پوستی با تیمی متخصص",
    rating: 5,
    reviewCount: 189,
    coverUrl: FALLBACK_COVERS.beauty,
  }),
  fallbackBusiness({
    id: -103,
    name: "کلینیک لبخند",
    slug: "labsand-dental-clinic",
    categorySlug: "clinic",
    citySlug: "shiraz",
    district: "معالی‌آباد",
    tagline: "دندانپزشکی تخصصی با تکنولوژی روز",
    rating: 5,
    reviewCount: 145,
    coverUrl: FALLBACK_COVERS.clinic,
  }),
  fallbackBusiness({
    id: -104,
    name: "موبایل‌سنتر پارس",
    slug: "pars-mobile-center",
    categorySlug: "digital",
    citySlug: "tehran",
    district: "علاءالدین",
    tagline: "فروش و تعمیر تخصصی موبایل",
    rating: 4,
    reviewCount: 210,
    coverUrl: FALLBACK_COVERS.digital,
  }),
  fallbackBusiness({
    id: -105,
    name: "مرکز تندرستی آریا",
    slug: "aria-fitness-center",
    categorySlug: "fitness",
    citySlug: "isfahan",
    district: "جردن",
    tagline: "باشگاهی مجهز با مربیان حرفه‌ای",
    rating: 4,
    reviewCount: 98,
    coverUrl: FALLBACK_COVERS.fitness,
  }),
  fallbackBusiness({
    id: -106,
    name: "مرکز خدماتی خودرو آسا",
    slug: "asa-auto-service",
    categorySlug: "automotive",
    citySlug: "karaj",
    district: "گوهردشت",
    tagline: "تعمیرگاه تخصصی و عیب‌یابی کامپیوتری",
    rating: 5,
    reviewCount: 87,
    coverUrl: FALLBACK_COVERS.automotive,
  }),
];
