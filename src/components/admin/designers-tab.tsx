"use client";

import { Check, Megaphone, X } from "lucide-react";
import { ActionButton, AdminBadge, AdminCard, Fa } from "@/components/admin/ui";
import { setDesignerApproved, setPortfolioApproved, toggleDesignerFeatured } from "@/lib/admin-actions";
import type { getAdminDesigners } from "@/lib/admin-queries";

type DesignerRow = Awaited<ReturnType<typeof getAdminDesigners>>[number];

export function DesignersTab({ designers }: { designers: DesignerRow[] }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {designers.map((d) => (
        <AdminCard
          key={d.id}
          title={`${d.name} (${d.referralCode})`}
          action={
            <div className="flex flex-wrap items-center gap-1.5">
              <AdminBadge tone={d.approved ? "green" : "amber"}>
                {d.approved ? "تأییدشده" : "در انتظار تأیید"}
              </AdminBadge>
              <AdminBadge tone="violet">
                <Fa value={d.points} /> امتیاز
              </AdminBadge>
            </div>
          }
        >
          <p className="mb-4 text-xs leading-6 text-slate-500">
            {d.bio ?? "بدون توضیح"}
            <span className="mx-1 text-slate-300">•</span>
            <span dir="ltr">{d.phone}</span>
            <span className="mx-1 text-slate-300">•</span>
            <Fa value={d.referralCount} /> معرفی ثبت‌شده
          </p>

          <div className="mb-4 flex flex-wrap gap-1.5">
            <ActionButton
              className={
                d.approved
                  ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }
              action={() => setDesignerApproved(d.id, !d.approved)}
            >
              <Check className="h-3.5 w-3.5" />
              {d.approved ? "لغو تأیید" : "تأیید طراح"}
            </ActionButton>
            <ActionButton
              className={
                d.featured
                  ? "bg-violet-100 text-violet-700 hover:bg-violet-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }
              action={() => toggleDesignerFeatured(d.id)}
            >
              <Megaphone className="h-3.5 w-3.5" />
              {d.featured ? "ویژه است" : "ویژه کن"}
            </ActionButton>
          </div>

          <h4 className="mb-2 text-xs font-extrabold text-ink">
            نمونه‌کارها ({d.portfolios.length})
          </h4>
          {d.portfolios.length === 0 && (
            <p className="rounded-lg bg-slate-50 p-3 text-center text-xs text-slate-400">
              نمونه‌کاری آپلود نشده است.
            </p>
          )}
          <ul className="space-y-2">
            {d.portfolios.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-ink">{p.title}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400" dir="ltr">
                    {p.imageUrl?.slice(0, 60)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <AdminBadge tone={p.approved ? "green" : "amber"}>
                    {p.approved ? "تأییدشده" : "در انتظار"}
                  </AdminBadge>
                  <ActionButton
                    className={
                      p.approved
                        ? "bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
                        : "bg-emerald-600 p-2 text-white hover:bg-emerald-700"
                    }
                    action={() => setPortfolioApproved(p.id, !p.approved)}
                  >
                    {p.approved ? (
                      <X className="h-3.5 w-3.5" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                  </ActionButton>
                </div>
              </li>
            ))}
          </ul>
        </AdminCard>
      ))}
    </div>
  );
}
