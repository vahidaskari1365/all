import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Star } from "lucide-react";
import { CategoryIcon, CATEGORY_COLORS } from "@/components/category-icon";
import { ClaimBadges } from "@/components/status-badges";
import { initials, toFa } from "@/lib/utils";
import type { BusinessWithMeta } from "@/lib/queries";

/** مینی‌کارت نتیجه جست‌وجو — متراکم و مناسب موبایل */
export function MiniBusinessCard({ business }: { business: BusinessWithMeta }) {
  const b = business;
  const gradient =
    CATEGORY_COLORS[b.category?.color ?? "primary"] ?? CATEGORY_COLORS.primary;

  return (
    <article className="card card-hover group relative flex gap-3 overflow-hidden p-3">
      <Link
        href={`/business/${b.slug}`}
        className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-bl text-xl font-black text-white shadow-md"
        aria-label={`مشاهده ${b.name}`}
      >
        {b.logoUrl ? (
          <Image
            src={b.logoUrl}
            alt={b.name}
            width={96}
            height={96}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className={`grid h-full w-full place-items-center bg-gradient-to-bl ${gradient}`}>
            {initials(b.name)}
          </span>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <Link href={`/business/${b.slug}`} className="min-w-0">
            <h3 className="truncate text-sm font-extrabold text-ink transition-colors group-hover:text-primary-700">
              {b.name}
            </h3>
          </Link>
          {b.rating > 0 && (
            <span className="flex shrink-0 items-center gap-1 rounded-lg bg-amber-50 px-1.5 py-0.5 text-[11px] font-bold text-amber-700 ring-1 ring-inset ring-amber-100">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {toFa(b.rating.toFixed(1))}
            </span>
          )}
        </div>

        <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
          {b.district ? `${b.district}، ` : ""}
          {b.city?.name ?? "—"}
          <span className="mx-1 text-slate-300">•</span>
          <CategoryIcon
            name={b.category?.icon ?? "store"}
            className="h-3.5 w-3.5 text-slate-400"
          />
          {b.category?.name}
        </p>

        {b.tagline && (
          <p className="mt-1 line-clamp-1 text-xs leading-6 text-slate-600">
            {b.tagline}
          </p>
        )}

        <div className="mt-2 flex items-center justify-between gap-2">
          <ClaimBadges
            size="sm"
            claims={{
              license: b.hasLicense,
              union: b.unionMember,
              guarantee: b.hasGuarantee,
            }}
          />
          {b.phone && (
            <a
              href={`tel:${b.phone}`}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-700 transition-colors hover:bg-primary hover:text-white"
              aria-label={`تماس با ${b.name}`}
            >
              <Phone className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
