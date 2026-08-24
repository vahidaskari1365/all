import { db } from "@/db";
import {
  businesses,
  categories,
  cities,
  showcaseItems,
} from "@/db/schema";
import { and, desc, eq, ilike, or, sql, asc, ne } from "drizzle-orm";

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
  ownerId: number | null;
};

export type BusinessWithMeta = BusinessRow & {
  category: CategoryRow | null;
  city: CityRow | null;
};

export async function getCategories(): Promise<CategoryRow[]> {
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      icon: categories.icon,
      color: categories.color,
    })
    .from(categories)
    .orderBy(asc(categories.name));
  return rows;
}

export async function getCities(): Promise<CityRow[]> {
  const rows = await db
    .select({
      id: cities.id,
      name: cities.name,
      slug: cities.slug,
      province: cities.province,
    })
    .from(cities)
    .orderBy(asc(cities.name));
  return rows;
}

function enrich(
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
  const [rows, cats, cits] = await Promise.all([
    db
      .select()
      .from(businesses)
      .where(eq(businesses.featured, true))
      .orderBy(desc(businesses.rating), desc(businesses.reviewCount))
      .limit(limit),
    getCategories(),
    getCities(),
  ]);
  return enrich(rows, cats, cits);
}

export type SearchParams = {
  q?: string;
  citySlug?: string;
  categorySlug?: string;
  limit?: number;
  onlyShowcase?: boolean;
};

export async function searchBusinesses(
  params: SearchParams
): Promise<BusinessWithMeta[]> {
  const { q, citySlug, categorySlug, limit = 40, onlyShowcase } = params;

  const [cats, cits] = await Promise.all([getCategories(), getCities()]);
  const city = citySlug ? cits.find((c) => c.slug === citySlug) : undefined;
  const cat = categorySlug ? cats.find((c) => c.slug === categorySlug) : undefined;

  const conds = [];
  if (city) conds.push(eq(businesses.cityId, city.id));
  if (cat) conds.push(eq(businesses.categoryId, cat.id));
  if (onlyShowcase) conds.push(eq(businesses.hasShowcase, true));
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

  const rows = await db
    .select()
    .from(businesses)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(businesses.featured), desc(businesses.rating))
    .limit(limit);

  return enrich(rows, cats, cits);
}

export async function getBusinessBySlug(
  slug: string
): Promise<BusinessWithMeta | null> {
  const [row] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.slug, slug))
    .limit(1);
  if (!row) return null;
  const [cats, cits] = await Promise.all([getCategories(), getCities()]);
  return enrich([row], cats, cits)[0];
}

export async function getShowcaseItems(businessId: number) {
  return db
    .select()
    .from(showcaseItems)
    .where(eq(showcaseItems.businessId, businessId))
    .orderBy(desc(showcaseItems.createdAt));
}

export async function getRelatedBusinesses(
  business: BusinessWithMeta,
  limit = 4
): Promise<BusinessWithMeta[]> {
  const [rows, cats, cits] = await Promise.all([
    db
      .select()
      .from(businesses)
      .where(
        and(
          eq(businesses.categoryId, business.categoryId),
          ne(businesses.id, business.id)
        )
      )
      .orderBy(desc(businesses.rating))
      .limit(limit),
    getCategories(),
    getCities(),
  ]);
  return enrich(rows, cats, cits);
}

export async function getStats() {
  const [b] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(businesses);
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
