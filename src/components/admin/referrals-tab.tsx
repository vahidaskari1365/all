"use client";

import { ActionButton, AdminBadge, AdminTable, STATUS_LABEL, STATUS_TONE, Fa } from "@/components/admin/ui";
import { setReferralStatus } from "@/lib/admin-actions";
import type { getAdminReferrals } from "@/lib/admin-queries";

type ReferralRow = Awaited<ReturnType<typeof getAdminReferrals>>[number];

export function ReferralsTab({ referrals }: { referrals: ReferralRow[] }) {
  return (
    <div className="space-y-5">
      <p className="rounded-xl bg-sky-50 px-4 py-3 text-xs leading-6 text-sky-800 ring-1 ring-sky-200">
        ارتباط «طراح ← کسب‌وکار ← اشتراک» از همان ابتدای ثبت اشتراک ذخیره می‌شود؛
        حتی اگر محاسبه خودکار پورسانت در فاز بعدی فعال شود، هیچ داده‌ای از دست
        نمی‌رود.
      </p>
      <AdminTable head={["طراح معرف", "کسب‌وکار", "وضعیت", "نرخ پورسانت", "تاریخ", "عملیات"]}>
        {referrals.map((r) => (
          <tr key={r.id} className="hover:bg-slate-50/60">
            <td className="px-4 py-3 font-bold text-ink">{r.designer?.name ?? "—"}</td>
            <td className="px-4 py-3 text-slate-600">{r.business?.name ?? "—"}</td>
            <td className="px-4 py-3">
              <AdminBadge tone={STATUS_TONE[r.status] ?? "slate"}>
                {STATUS_LABEL[r.status] ?? r.status}
              </AdminBadge>
            </td>
            <td className="px-4 py-3 text-slate-600">
              ٪<Fa value={r.commissionRate} />
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-slate-500">
              {toFaSafe(r.createdAt)}
            </td>
            <td className="px-4 py-3">
              <div className="flex gap-1.5">
                {r.status !== "qualified" && (
                  <ActionButton
                    className="bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700"
                    action={() => setReferralStatus(r.id, "qualified")}
                  >
                    واجد پورسانت
                  </ActionButton>
                )}
                {r.status === "qualified" && (
                  <ActionButton
                    className="bg-violet-600 px-3 py-2 text-white hover:bg-violet-700"
                    action={() => setReferralStatus(r.id, "paid")}
                  >
                    ثبت پرداخت
                  </ActionButton>
                )}
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>
      {referrals.length === 0 && (
        <p className="rounded-xl bg-white p-8 text-center text-sm text-slate-400 ring-1 ring-slate-200">
          هنوز معرفی‌ای ثبت نشده است.
        </p>
      )}
    </div>
  );
}

function toFaSafe(d: Date) {
  return <Fa value={new Date(d).toLocaleDateString("fa-IR")} />;
}
