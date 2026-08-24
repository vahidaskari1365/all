import Link from "next/link";
import { SearchX, SlidersHorizontal, X, ArrowLeft } from "lucide-react";
import {
  getCategories,
  getCities,
  searchBusinesses,
} from "@/lib/queries";
import { BusinessCard } from "@/components/business-card";
import { CategoryIcon } from "@/components/category-icon";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { toFa } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SP = { q?: string; city?: string; cat?: string };

function buildQuery(base: SP, patch: Partial<SP>): string {
  const next = { ...base, ...patch };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.city) params.set("city", next.city);
  if (next.cat) params.set("cat", next.cat);
  const s = params.toString();
  return s ? `/search?${s}` : "/search";
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const [results, categories, cities] = await Promise.all([
    searchBusinesses({
      q: sp.q,
      citySlug: sp.city,
      categorySlug: sp.cat,
      limit: 24,
    }),
    getCategories(),
    getCities(),
  ]);

  const activeCat = categories.find((c) => c.slug === sp.cat) ?? null;
  const activeCity = cities.find((c) => c.slug === sp.city) ?? null;
  const hasFilters = Boolean(sp.q || sp.cat || sp.city);
  const topCities = cities.slice(0, 8);

  return (
    <div className="container-px mx-auto max-w-7xl py-8 sm:py-12">
      {/* عنوان نتایج */}
      <Reveal>
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-black text-ink sm:text-3xl">
              {activeCat ? activeCat.name : "همه کسب‌وکارها"}
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              {toFa(results.length)} نتیجه
              {activeCity ? ` در ${activeCity.name}` : ""}
              {sp.q ? ` برای «${sp.q}»` : ""}
            </p>
          </div>
          {hasFilters && (
            <Link
              href="/search"
              className="inline-flex items-center gap-1.5 self-start rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200"
            >
              <X className="h-3.5 w-3.5" />
              حذف همه فیلترها
            </Link>
          )}
        </div>
      </Reveal>

      {/* فیلترها */}
      <Reveal delay={0.05}>
        <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-ink">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            فیلتر بر اساس نوع خدمت
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterChip href={buildQuery(sp, { cat: undefined })} active={!sp.cat}>
              همه
            </FilterChip>
            {categories.map((c) => (
              <FilterChip
                key={c.id}
                href={buildQuery(sp, { cat: c.slug })}
                active={sp.cat === c.slug}
              >
                <CategoryIcon name={c.icon} className="h-3.5 w-3.5" />
                {c.name}
              </FilterChip>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2 text-sm font-bold text-ink">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            فیلتر بر اساس شهر
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterChip href={buildQuery(sp, { city: undefined })} active={!sp.city}>
              همه شهرها
            </FilterChip>
            {topCities.map((c) => (
              <FilterChip
                key={c.id}
                href={buildQuery(sp, { city: c.slug })}
                active={sp.city === c.slug}
              >
                {c.name}
              </FilterChip>
            ))}
          </div>
        </div>
      </Reveal>

      {/* نتایج */}
      {results.length > 0 ? (
        <Stagger className="mt-8 grid gap-5 md:grid-cols-2">
          {results.map((b) => (
            <StaggerItem key={b.id}>
              <BusinessCard business={b} />
            </StaggerItem>
          ))}
        </Stagger>
      ) : (
        <Reveal>
          <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-slate-400">
              <SearchX className="h-8 w-8" />
            </span>
            <h2 className="mt-5 text-lg font-extrabold text-ink">
              نتیجه‌ای پیدا نشد
            </h2>
            <p className="mt-2 max-w-md text-sm leading-7 text-slate-500">
              با فیلترهای انتخاب‌شده کسب‌وکاری یافت نشد. می‌توانید فیلترها را تغییر
              دهید یا دسته‌های پرطرفدار را امتحان کنید.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {categories.slice(0, 5).map((c) => (
                <Link
                  key={c.id}
                  href={`/search?cat=${c.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3.5 py-2 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-100"
                >
                  <CategoryIcon name={c.icon} className="h-3.5 w-3.5" />
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      <div className="mt-10 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-primary-700"
        >
          بازگشت به خانه
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-medium transition-all ${
        active
          ? "bg-primary text-white shadow-md shadow-primary-600/25"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {children}
    </Link>
  );
}
