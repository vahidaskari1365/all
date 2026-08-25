import Link from "next/link";
import {
  SearchX,
  X,
  BadgeCheck,
  Handshake,
  ShieldCheck,
  Images,
  SlidersHorizontal,
} from "lucide-react";
import { getCategories, getCities, searchBusinesses } from "@/lib/queries";
import { CategoryIcon } from "@/components/category-icon";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { MiniBusinessCard } from "@/components/mini-business-card";
import { SearchBar } from "@/components/search-bar";
import { toFa } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SP = {
  q?: string;
  city?: string;
  cat?: string;
  license?: string;
  union?: string;
  guarantee?: string;
  showcase?: string;
  verified?: string;
};

function buildQuery(base: SP, patch: Partial<SP>): string {
  const next = { ...base, ...patch };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.city) params.set("city", next.city);
  if (next.cat) params.set("cat", next.cat);
  if (next.license) params.set("license", "1");
  if (next.union) params.set("union", "1");
  if (next.guarantee) params.set("guarantee", "1");
  if (next.showcase) params.set("showcase", "1");
  if (next.verified) params.set("verified", "1");
  const s = params.toString();
  return s ? `/search?${s}` : "/search";
}

const FILTER_CHIPS: {
  key: keyof SP;
  param: "license" | "union" | "guarantee" | "showcase" | "verified";
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "license",
    param: "license",
    label: "دارای جواز",
    icon: <BadgeCheck className="h-3.5 w-3.5" />,
  },
  {
    key: "union",
    param: "union",
    label: "عضو اتحادیه",
    icon: <Handshake className="h-3.5 w-3.5" />,
  },
  {
    key: "guarantee",
    param: "guarantee",
    label: "دارای ضمانت",
    icon: <ShieldCheck className="h-3.5 w-3.5" />,
  },
  {
    key: "showcase",
    param: "showcase",
    label: "ویترین حرفه‌ای",
    icon: <Images className="h-3.5 w-3.5" />,
  },
];

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
      limit: 60,
      filters: {
        license: Boolean(sp.license),
        union: Boolean(sp.union),
        guarantee: Boolean(sp.guarantee),
        showcase: Boolean(sp.showcase),
        verified: Boolean(sp.verified),
      },
    }),
    getCategories(),
    getCities(),
  ]);

  const activeCat = categories.find((c) => c.slug === sp.cat) ?? null;
  const activeCity = cities.find((c) => c.slug === sp.city) ?? null;
  const hasFilters = Boolean(
    sp.q || sp.cat || sp.city || sp.license || sp.union || sp.guarantee || sp.showcase || sp.verified
  );
  const topCities = cities.slice(0, 10);

  const activeBadgeCount =
    [sp.license, sp.union, sp.guarantee, sp.showcase, sp.verified].filter(
      Boolean
    ).length;

  return (
    <div className="container-px mx-auto max-w-5xl py-6 sm:py-10">
      {/* عنوان */}
      <Reveal>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-black text-ink sm:text-2xl">
              {activeCat ? activeCat.name : "جست‌وجوی کسب‌وکار"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {toFa(results.length)} نتیجه
              {activeCity ? ` در ${activeCity.name}` : ""}
              {sp.q ? ` برای «${sp.q}»` : ""}
              {activeBadgeCount > 0 ? ` با ${toFa(activeBadgeCount)} فیلتر فعال` : ""}
            </p>
          </div>
          {hasFilters && (
            <Link
              href="/search"
              className="inline-flex min-h-11 items-center gap-1.5 self-start rounded-xl bg-slate-100 px-4 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200"
            >
              <X className="h-3.5 w-3.5" />
              حذف همه فیلترها
            </Link>
          )}
        </div>
      </Reveal>

      {/* باکس جست‌وجوی فعال در صفحه نتایج */}
      <Reveal delay={0.04}>
        <SearchBar
          cities={cities}
          categories={categories}
          variant="results"
          initial={{ q: sp.q, city: sp.city, cat: sp.cat }}
        />
      </Reveal>

      {/* فیلترهای اظهاری */}
      <Reveal delay={0.06}>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
          <div className="mb-2.5 flex items-center gap-2 px-1 text-xs font-bold text-ink">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            فیلترهای وضعیت
            <span className="font-normal text-slate-400">
              (بر اساس اظهار خود کسب‌وکار)
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTER_CHIPS.map((f) => {
              const active = Boolean(sp[f.key]);
              return (
                <Link
                  key={f.param}
                  href={buildQuery(sp, { [f.key]: active ? undefined : "1" })}
                  aria-pressed={active}
                  className={`inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all active:scale-95 ${
                    active
                      ? "bg-ink text-white shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {f.icon}
                  {f.label}
                  {active && <X className="h-3 w-3 opacity-70" />}
                </Link>
              );
            })}
            <Link
              href={buildQuery(sp, { verified: sp.verified ? undefined : "1" })}
              aria-pressed={Boolean(sp.verified)}
              className={`inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all active:scale-95 ${
                sp.verified
                  ? "bg-primary text-white shadow-md"
                  : "bg-primary-50 text-primary-700 ring-1 ring-primary-100 hover:bg-primary-100"
              }`}
            >
              <BadgeCheck className="h-3.5 w-3.5" />
              تأییدشده توسط کسب‌یاب
              {sp.verified && <X className="h-3 w-3 opacity-70" />}
            </Link>
          </div>
        </div>
      </Reveal>

      {/* دسته‌ها */}
      <Reveal delay={0.08}>
        <div className="mt-4">
          <p className="mb-2 px-1 text-xs font-bold text-slate-400">
            دسته‌بندی خدمات
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]">
            <FilterChip
              href={buildQuery(sp, { cat: undefined })}
              active={!sp.cat}
            >
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
        </div>
      </Reveal>

      {/* شهرها */}
      <Reveal delay={0.1}>
        <div className="mt-3">
          <p className="mb-2 px-1 text-xs font-bold text-slate-400">شهر</p>
          <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]">
            <FilterChip
              href={buildQuery(sp, { city: undefined })}
              active={!sp.city}
            >
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
        <Stagger className="mt-6 grid gap-3 sm:grid-cols-2">
          {results.map((b) => (
            <StaggerItem key={b.id}>
              <MiniBusinessCard business={b} />
            </StaggerItem>
          ))}
        </Stagger>
      ) : (
        <Reveal>
          <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
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
      className={`inline-flex min-h-10 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all active:scale-95 ${
        active
          ? "bg-primary text-white shadow-md shadow-primary-600/25"
          : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
      }`}
    >
      {children}
    </Link>
  );
}
