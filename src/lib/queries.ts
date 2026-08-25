import { db } from "@/db";
import {
  businesses,
  blogPosts,
  categories,
  cities,
  designerPortfolios,
  designers,
  plans,
  showcaseItems,
  subscriptions,
  orders,
} from "@/db/schema";
import { and, desc, eq, ilike, or, sql, asc, ne, gte, lte } from "drizzle-orm";

export type CategoryRow = {
  id: number;
  name: string;
  slug: string;
  icon: string;
  color: string;
};

export type CityRow = {
  id: number;
  name: string;
  slug: string;
  province: string | null;
};

export type BusinessRow = {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
  cityId: number;
  district: string | null;
  tagline: string | null;
  description: string | null;
  address: string | null;
  phone: string | null;
  mobile: string | null;
  email: string | null;
  website: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  lat: string | null;
  lng: string | null;
  instagram: string | null;
  telegram: string | null;
  whatsapp: string | null;
  workHours: string | null;
  hasLicense: boolean;
  unionMember: boolean;
  hasGuarantee: boolean;
  hasShowcase: boolean;
  rating: number;
  reviewCount: number;
  featured: boolean;
  verified: boolean;
  status: string;
  reviewNote: string | null;
  ownerId: number | null;
  createdAt: Date;
};

export type BusinessWithMeta = BusinessRow & {
  category: CategoryRow | null;
  city: CityRow | null;
};

export type SubscriptionRow = {
  id: number;
  businessId: number;
  planId: number;
  status: string;
  startedAt: Date | null;
  endsAt: Date | null;
  createdAt: Date;
};

export type PlanRow = {
  id: number;
  name: string;
  slug: string;
  priceMonthly: number;
  features: string | null;
  active: boolean;
  sortOrder: number;
};

export type OrderRow = typeof orders.$inferSelect;

/**
 * خواندن امن برای صفحات عمومی.
 *
 * اگر دیتابیس تنظیم نشده باشد یا موقتاً در دسترس نباشد، صفحه‌های سایت نباید
 * با خطای سراسری «خطایی رخ داد» از کار بیفتند. این helper خطای خواندن را
 * ثبت می‌کند و به‌جای کرش کردن سایت، همان مقادیر خالی را برمی‌گرداند تا
 * سایت باز شود. عملیات نوشتن (ثبت‌نام/ورود/گزارش/…) همچنان خطا می‌دهند.
 */
let degradedLogged = false;
async function safeRead<T>(fallback: T, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (!degradedLogged) {
      degradedLogged = true;
      console.error(
        "[db] database unavailable, falling back to empty public data:",
        err
      );
    }
    return fallback;
  }
}

export async function getCategories(): Promise<CategoryRow[]> {
  const rows = await safeRead<CategoryRow[]>([], async () => {
    return db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        icon: categories.icon,
        color: categories.color,
      })
      .from(categories)
      .orderBy(asc(categories.name));
  });
  // اگر دیتابیس در دسترس نبود یا خالی بود، دسته‌بندی‌های پیش‌فرض
  // (مثل قبل) نمایش داده شوند تا صفحه اول سایت خالی نماند.
  if (rows.length === 0) {
    const { FALLBACK_CATEGORIES } = await import("@/lib/fallback-data");
    return FALLBACK_CATEGORIES;
  }
  return rows;
}

export async function getCities(): Promise<CityRow[]> {
  const rows = await safeRead<CityRow[]>([], async () => {
    return db
      .select({
        id: cities.id,
        name: cities.name,
        slug: cities.slug,
        province: cities.province,
      })
      .from(cities)
      .orderBy(asc(cities.name));
  });
  if (rows.length === 0) {
    const { FALLBACK_CITIES } = await import("@/lib/fallback-data");
    return FALLBACK_CITIES;
  }
  return rows;
}

/** تعداد کسب‌وکارهای فعال هر شهر برای نقشه‌ی ایران */
export async function getCityBusinessCounts(): Promise<Record<string, number>> {
  const counts = await safeRead<Record<string, number>>({}, async () => {
    const rows = await db
      .select({
        slug: cities.slug,
        count: sql<number>`count(${businesses.id})::int`,
      })
      .from(cities)
      .leftJoin(
        businesses,
        and(eq(businesses.cityId, cities.id), eq(businesses.status, "active"))
      )
      .groupBy(cities.id, cities.slug);
    return Object.fromEntries(rows.map((row) => [row.slug, row.count]));
  });

  // در اولین اجرای پروژه یا زمان قطعی دیتابیس، نقشه همچنان نمونه‌های قابل‌دیدن
  // دارد؛ به‌محض وجود داده‌ی واقعی، همین داده جایگزین می‌شود.
  if (Object.values(counts).reduce((sum, value) => sum + value, 0) === 0) {
    const { FALLBACK_CITIES } = await import("@/lib/fallback-data");
    const sampleCounts: Record<string, number> = {
      tehran: 9,
      isfahan: 4,
      shiraz: 4,
      mashhad: 3,
      tabriz: 3,
      karaj: 3,
      ahvaz: 2,
      qom: 2,
    };
    return Object.fromEntries(
      FALLBACK_CITIES.map((city) => [city.slug, sampleCounts[city.slug] ?? 0])
    );
  }
  return counts;
}

export function enrichBusinesses(
  list: BusinessRow[],
  cats: CategoryRow[],
  cits: CityRow[]
): BusinessWithMeta[] {
  return list.map((b) => ({
    ...b,
    category: cats.find((c) => c.id === b.categoryId) ?? null,
    city: cits.find((c) => c.id === b.cityId) ?? null,
  }));
}

export async function getFeaturedBusinesses(
  limit = 8
): Promise<BusinessWithMeta[]> {
  const rows = await safeRead<BusinessWithMeta[]>([], async () => {
    const [businessRows, cats, cits] = await Promise.all([
      db
        .select()
        .from(businesses)
        .where(and(eq(businesses.featured, true), eq(businesses.status, "active")))
        .orderBy(desc(businesses.rating), desc(businesses.reviewCount))
        .limit(limit),
      getCategories(),
      getCities(),
    ]);
    return enrichBusinesses(businessRows, cats, cits);
  });
  if (rows.length === 0) {
    const { FALLBACK_BUSINESSES } = await import("@/lib/fallback-data");
    return FALLBACK_BUSINESSES.slice(0, limit);
  }
  return rows;
}

export type SearchParams = {
  q?: string;
  citySlug?: string;
  categorySlug?: string;
  limit?: number;
  onlyShowcase?: boolean;
  /** فیلترهای اظهاری: دارای جواز / اتحادیه / ضمانت / ویترین / تأییدشده */
  filters?: {
    license?: boolean;
    union?: boolean;
    guarantee?: boolean;
    showcase?: boolean;
    verified?: boolean;
  };
};

export async function searchBusinesses(
  params: SearchParams
): Promise<BusinessWithMeta[]> {
  const { q, citySlug, categorySlug, limit = 40, onlyShowcase, filters } =
    params;

  const rows = await safeRead<BusinessWithMeta[]>([], async () => {
    const [cats, cits] = await Promise.all([getCategories(), getCities()]);
    const city = citySlug ? cits.find((c) => c.slug === citySlug) : undefined;
    const cat = categorySlug
      ? cats.find((c) => c.slug === categorySlug)
      : undefined;

    const conds = [eq(businesses.status, "active")];
    if (city) conds.push(eq(businesses.cityId, city.id));
    if (cat) conds.push(eq(businesses.categoryId, cat.id));
    if (onlyShowcase) conds.push(eq(businesses.hasShowcase, true));
    if (filters?.license) conds.push(eq(businesses.hasLicense, true));
    if (filters?.union) conds.push(eq(businesses.unionMember, true));
    if (filters?.guarantee) conds.push(eq(businesses.hasGuarantee, true));
    if (filters?.showcase) conds.push(eq(businesses.hasShowcase, true));
    if (filters?.verified) conds.push(eq(businesses.verified, true));
    if (q && q.trim()) {
      const term = `%${q.trim()}%`;
      conds.push(
        or(
          ilike(businesses.name, term),
          ilike(businesses.tagline, term),
          ilike(businesses.district, term),
          ilike(businesses.description, term)
        )!
      );
    }

    const businessRows = await db
      .select()
      .from(businesses)
      .where(and(...conds))
      .orderBy(desc(businesses.featured), desc(businesses.rating))
      .limit(limit);

    return enrichBusinesses(businessRows, cats, cits);
  });

  // جست‌وجوی آزاد در صورت نبود دیتابیس هنوز چند نمونه برای تست UI نشان می‌دهد؛
  // برای عبارت متنی ناموجود، نتیجه‌ی خالی واقعی حفظ می‌شود.
  if (rows.length === 0 && !q?.trim()) {
    const { FALLBACK_BUSINESSES } = await import("@/lib/fallback-data");
    return FALLBACK_BUSINESSES.filter((business) => {
      if (citySlug && business.city?.slug !== citySlug) return false;
      if (categorySlug && business.category?.slug !== categorySlug) return false;
      if (onlyShowcase && !business.hasShowcase) return false;
      if (filters?.license && !business.hasLicense) return false;
      if (filters?.union && !business.unionMember) return false;
      if (filters?.guarantee && !business.hasGuarantee) return false;
      if (filters?.showcase && !business.hasShowcase) return false;
      if (filters?.verified && !business.verified) return false;
      return true;
    }).slice(0, limit);
  }
  return rows;
}

export async function getBusinessBySlug(
  slug: string,
  { includePending = false } = {}
): Promise<BusinessWithMeta | null> {
  const result = await safeRead<BusinessWithMeta | null>(null, async () => {
    const conds = [eq(businesses.slug, slug)];
    if (!includePending) conds.push(eq(businesses.status, "active"));
    const [row] = await db
      .select()
      .from(businesses)
      .where(and(...conds))
      .limit(1);
    if (!row) return null;
    const [cats, cits] = await Promise.all([getCategories(), getCities()]);
    return enrichBusinesses([row], cats, cits)[0];
  });
  if (!result) {
    const { FALLBACK_BUSINESSES } = await import("@/lib/fallback-data");
    return FALLBACK_BUSINESSES.find((business) => business.slug === slug) ?? null;
  }
  return result;
}

export async function getShowcaseItems(businessId: number) {
  return safeRead<typeof showcaseItems.$inferSelect[]>([], async () => {
    return db
      .select()
      .from(showcaseItems)
      .where(eq(showcaseItems.businessId, businessId))
      .orderBy(desc(showcaseItems.createdAt));
  });
}

export async function getRelatedBusinesses(
  business: BusinessWithMeta,
  limit = 4
): Promise<BusinessWithMeta[]> {
  return safeRead<BusinessWithMeta[]>([], async () => {
    const [rows, cats, cits] = await Promise.all([
      db
        .select()
        .from(businesses)
        .where(
          and(
            eq(businesses.categoryId, business.categoryId),
            ne(businesses.id, business.id),
            eq(businesses.status, "active")
          )
        )
        .orderBy(desc(businesses.rating))
        .limit(limit),
      getCategories(),
      getCities(),
    ]);
    return enrichBusinesses(rows, cats, cits);
  });
}

export async function getStats() {
  return safeRead(
    { businesses: 0, cities: 0, categories: 0 },
    async () => {
      const [b] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(businesses)
        .where(eq(businesses.status, "active"));
      const [c] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(cities);
      const [cat] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(categories);
      return {
        businesses: b?.count ?? 0,
        cities: c?.count ?? 0,
        categories: cat?.count ?? 0,
      };
    }
  ).then(async (s) => {
    // هماهنگ با فهرست‌های پشتیبان: آمار صفر نمایش داده نشود.
    if (s.businesses === 0 || s.categories === 0 || s.cities === 0) {
      const { FALLBACK_BUSINESSES, FALLBACK_CATEGORIES, FALLBACK_CITIES } = await import(
        "@/lib/fallback-data"
      );
      return {
        businesses: s.businesses || FALLBACK_BUSINESSES.length,
        categories: s.categories || FALLBACK_CATEGORIES.length,
        cities: s.cities || FALLBACK_CITIES.length,
      };
    }
    return s;
  });
}

// ────────────────────────────────────────────────────────────
// اشتراک‌ها (ویترین حرفه‌ای)
// ────────────────────────────────────────────────────────────
export async function getActiveSubscription(
  businessId: number
): Promise<(SubscriptionRow & { plan: PlanRow | null }) | null> {
  return safeRead<SubscriptionRow & { plan: PlanRow | null } | null>(
    null,
    async () => {
      const [row] = await db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.businessId, businessId),
            eq(subscriptions.status, "active"),
            gte(
              sql`coalesce(${subscriptions.endsAt}, now() + interval '1 day')`,
              sql`now()`
            )
          )
        )
        .orderBy(desc(subscriptions.createdAt))
        .limit(1);

      if (!row) return null;
      const [plan] = await db
        .select()
        .from(plans)
        .where(eq(plans.id, row.planId))
        .limit(1);
      return { ...row, plan: plan ?? null };
    }
  );
}

export async function getLatestSubscription(businessId: number) {
  return safeRead<typeof subscriptions.$inferSelect | null>(null, async () => {
    const [row] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.businessId, businessId))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);
    return row ?? null;
  });
}

export async function getPlans(): Promise<PlanRow[]> {
  return safeRead<PlanRow[]>([], async () => {
    return db
      .select()
      .from(plans)
      .where(eq(plans.active, true))
      .orderBy(asc(plans.sortOrder));
  });
}

export async function getPlanById(id: number): Promise<PlanRow | null> {
  return safeRead<PlanRow | null>(null, async () => {
    const [row] = await db.select().from(plans).where(eq(plans.id, id)).limit(1);
    return row ?? null;
  });
}

// ────────────────────────────────────────────────────────────
// طراحان کارت‌ویزیت
// ────────────────────────────────────────────────────────────
export type PublicDesigner = typeof designers.$inferSelect & {
  portfolios: (typeof designerPortfolios.$inferSelect)[];
};

export async function getPublicDesigners(): Promise<PublicDesigner[]> {
  return safeRead<PublicDesigner[]>([], async () => {
    const rows = await db
      .select()
      .from(designers)
      .where(and(eq(designers.approved, true), eq(designers.active, true)))
      .orderBy(desc(designers.featured), desc(designers.points));

    const portfolios = await db
      .select()
      .from(designerPortfolios)
      .where(eq(designerPortfolios.approved, true))
      .orderBy(desc(designerPortfolios.createdAt));

    return rows.map((d) => ({
      ...d,
      portfolios: portfolios.filter((p) => p.designerId === d.id),
    }));
  });
}

// ────────────────────────────────────────────────────────────
// بلاگ
// ────────────────────────────────────────────────────────────
export type PublicPost = Pick<
  typeof blogPosts.$inferSelect,
  "id" | "title" | "slug" | "excerpt" | "coverUrl" | "createdAt"
>;

export async function getPublishedPosts(limit = 12): Promise<PublicPost[]> {
  return safeRead<PublicPost[]>([], async () => {
    return db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        coverUrl: blogPosts.coverUrl,
        createdAt: blogPosts.createdAt,
      })
      .from(blogPosts)
      .where(eq(blogPosts.published, true))
      .orderBy(desc(blogPosts.createdAt))
      .limit(limit);
  });
}

export async function getPostBySlug(slug: string) {
  return safeRead<typeof blogPosts.$inferSelect | null>(null, async () => {
    const [row] = await db
      .select()
      .from(blogPosts)
      .where(and(eq(blogPosts.slug, slug), eq(blogPosts.published, true)))
      .limit(1);
    return row ?? null;
  });
}
