"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Star, Megaphone, BadgeCheck } from "lucide-react";
import {
  ActionButton,
  AdminBadge,
  AdminTable,
  STATUS_LABEL,
  STATUS_TONE,
} from "@/components/admin/ui";
import {
  setBusinessStatus,
  toggleBusinessFeatured,
  toggleBusinessVerified,
} from "@/lib/admin-actions";
import { toFa } from "@/lib/utils";
import type { BusinessWithMeta } from "@/lib/queries";

export function BusinessesTab({
  businesses,
}: {
  businesses: BusinessWithMeta[];
}) {
  const [filter, setFilter] = useState("all");
  const counts = businesses.reduce<Record<string, number>>((acc, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1;
    acc.all = (acc.all ?? 0) + 1;
    return acc;
  }, {});

  const list = filter === "all" ? businesses : businesses.filter((b) => b.status === filter);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {["all", "pending", "active", "suspended", "rejected"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`cursor-pointer rounded-full px-4 py-2 text-xs font-bold transition-colors ${
              filter === s
                ? "bg-ink text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {STATUS_LABEL[s] ?? "همه"}
            <span className="mr-1.5 opacity-60">({toFa(counts[s] ?? 0)})</span>
          </button>
        ))}
      </div>

      <AdminTable head={["کسب‌وکار", "دسته / شهر", "وضعیت", "نشان‌ها", "عملیات"]}>
        {list.map((b) => (
          <tr key={b.id} className="transition-colors hover:bg-slate-50/60">
            <td className="px-4 py-3">
              <p className="font-bold text-ink">{b.name}</p>
              <Link
                href={`/business/${b.slug}`}
                className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-primary-700 hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                /business/{b.slug}
              </Link>
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-slate-500">
              {b.category?.name ?? "—"} • {b.city?.name ?? "—"}
              {b.reviewNote && (
                <p className="mt-0.5 max-w-[220px] truncate text-[10px] text-amber-600" title={b.reviewNote}>
                  یادداشت: {b.reviewNote}
                </p>
              )}
            </td>
            <td className="px-4 py-3">
              <AdminBadge tone={STATUS_TONE[b.status] ?? "slate"}>
                {STATUS_LABEL[b.status] ?? b.status}
              </AdminBadge>
            </td>
            <td className="px-4 py-3">
              <div className="flex flex-wrap gap-1">
                {b.verified && <AdminBadge tone="sky">تأیید پلتفرم</AdminBadge>}
                {b.hasLicense && <AdminBadge tone="green">جواز</AdminBadge>}
                {b.unionMember && <AdminBadge tone="green">اتحادیه</AdminBadge>}
                {b.hasShowcase && <AdminBadge tone="violet">ویترین</AdminBadge>}
              </div>
            </td>
            <td className="px-4 py-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {b.status === "pending" && (
                  <ActionButton
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                    action={() => setBusinessStatus(b.id, "active")}
                  >
                    تأیید
                  </ActionButton>
                )}
                {b.status === "active" && (
                  <ActionButton
                    className="bg-amber-500 text-white hover:bg-amber-600"
                    action={() => setBusinessStatus(b.id, "suspended")}
                  >
                    تعلیق
                  </ActionButton>
                )}
                {b.status === "suspended" && (
                  <ActionButton
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                    action={() => setBusinessStatus(b.id, "active")}
                  >
                    بازفعال‌سازی
                  </ActionButton>
                )}
                {(b.status === "pending" || b.status === "suspended") && (
                  <ActionButton
                    className="bg-rose-600 text-white hover:bg-rose-700"
                    action={() => setBusinessStatus(b.id, "rejected", "اطلاعات ناقص است")}
                  >
                    رد
                  </ActionButton>
                )}
                <ActionButton
                  className={
                    b.featured
                      ? "bg-violet-100 text-violet-700 hover:bg-violet-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }
                  action={() => toggleBusinessFeatured(b.id)}
                >
                  <Megaphone className="h-3.5 w-3.5" />
                  {b.featured ? "ویژه است" : "ویژه کن"}
                </ActionButton>
                <ActionButton
                  className={
                    b.verified
                      ? "bg-sky-100 text-sky-700 hover:bg-sky-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }
                  confirmText={
                    b.verified
                      ? undefined
                      : "نشان «تأیید پلتفرم» یعنی احراز هویت توسط کسب‌یاب انجام شده است. ادامه می‌دهید؟"
                  }
                  action={() => toggleBusinessVerified(b.id)}
                >
                  <BadgeCheck className="h-3.5 w-3.5" />
                  {b.verified ? "تأییدشده" : "تأیید پلتفرم"}
                </ActionButton>
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      {list.length === 0 && (
        <p className="rounded-xl bg-white p-8 text-center text-sm text-slate-400 ring-1 ring-slate-200">
          کسب‌وکاری در این وضعیت وجود ندارد.
        </p>
      )}

      <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
        <Star className="h-3.5 w-3.5" />
        کسب‌وکارها فقط پس از تأیید (وضعیت «فعال») در نتایج جست‌وجو نمایش داده
        می‌شوند.
      </p>
    </div>
  );
}
