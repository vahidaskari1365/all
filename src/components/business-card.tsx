import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { CategoryIcon, CATEGORY_COLORS } from "@/components/category-icon";
import { StarRating } from "@/components/star-rating";
import { ClaimBadges, StatusBadge } from "@/components/status-badges";
import { initials } from "@/lib/utils";
import type { BusinessWithMeta } from "@/lib/queries";

export function BusinessCard({ business }: { business: BusinessWithMeta }) {
  const b = business;
  const color = b.category?.color ?? "primary";
  const gradient = CATEGORY_COLORS[color] ?? CATEGORY_COLORS.primary;

  return (
    <article className="card card-hover group overflow-hidden">
      {/* تصویر کاور — کلیک روی تصویر ورود به طرح معرفی */}
      <Link
        href={`/business/${b.slug}`}
        className="relative block aspect-[16/10] overflow-hidden"
        aria-label={`مشاهده طرح معرفی ${b.name}`}
      >
        {b.coverUrl ? (
          <Image
            src={b.coverUrl}
            alt={b.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-110"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-bl ${gradient}`} />
        )}
        {/* گرادینت پایین برای خوانایی */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/65 via-ink/10 to-transparent" />
        {/* لایه‌ی نوری هنگام هاور */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* نشان‌های وضعیت روی تصویر */}
        <div className="absolute right-3 top-3 flex max-w-[78%] flex-wrap justify-end gap-1.5">
          {b.verified && <StatusBadge claimKey="verified" size="sm" />}
          {b.hasShowcase && <StatusBadge claimKey="showcase" size="sm" />}
        </div>

        {/* راهنمای کلیک هنگام هاور */}
        <div className="absolute inset-0 grid place-items-center">
          <span className="translate-y-3 rounded-full bg-white/95 px-5 py-2.5 text-sm font-bold text-ink opacity-0 shadow-xl ring-1 ring-black/5 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            مشاهده طرح معرفی
          </span>
        </div>

        {/* دسته روی تصویر (پایین) */}
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm ring-1 ring-inset ring-white/20">
          <CategoryIcon name={b.category?.icon ?? "store"} className="h-3.5 w-3.5" />
          {b.category?.name ?? "کسب‌وکار"}
        </span>
      </Link>

      <div className="p-4">
        <div className="flex items-start gap-3">
          <span
            className={`grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-bl ${gradient} text-base font-extrabold text-white shadow-md ring-2 ring-white`}
          >
            {b.logoUrl ? (
              <Image
                src={b.logoUrl}
                alt={b.name}
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            ) : (
              initials(b.name)
            )}
          </span>

          <div className="min-w-0 flex-1">
            <Link href={`/business/${b.slug}`} className="block">
              <h3 className="truncate text-base font-extrabold text-ink transition-colors group-hover:text-primary-700">
                {b.name}
              </h3>
            </Link>
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span className="truncate">
                {b.district ? `${b.district}، ` : ""}
                {b.city?.name ?? "—"}
              </span>
            </p>
          </div>

          {b.rating > 0 && (
            <span className="flex shrink-0 items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-100">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-amber-400" aria-hidden>
                <path d="M12 17.3l-6.2 3.7 1.6-7L2 9.2l7.1-.6L12 2l2.9 6.6 7.1.6-5.4 4.8 1.6 7z" />
              </svg>
              {b.rating.toFixed(1)}
            </span>
          )}
        </div>

        {b.tagline && (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
            {b.tagline}
          </p>
        )}

        <div className="mt-3">
          <ClaimBadges
            size="sm"
            claims={{
              license: b.hasLicense,
              union: b.unionMember,
              guarantee: b.hasGuarantee,
            }}
          />
        </div>
      </div>
    </article>
  );
}
