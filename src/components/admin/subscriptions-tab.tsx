"use client";

import { useState } from "react";
import Link from "next/link";
import { XCircle, Zap } from "lucide-react";
import { ActionButton, AdminBadge, AdminTable, STATUS_LABEL, STATUS_TONE, Fa } from "@/components/admin/ui";
import { activateSubscription, cancelSubscription } from "@/lib/admin-actions";
import { toFa } from "@/lib/utils";
import type { getAdminSubscriptions } from "@/lib/admin-queries";

type SubRow = Awaited<ReturnType<typeof getAdminSubscriptions>>[number];

function Activate({ sub }: { sub: SubRow }) {
  const [months, setMonths] = useState(1);
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <input
        type="number"
        min={1}
        max={24}
        value={months}
        onChange={(e) => setMonths(Number(e.target.value))}
        className="input h-10 w-20 text-center"
        dir="ltr"
        aria-label="مدت اشتراک به ماه"
      />
      <ActionButton
        className="bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700"
        action={() => activateSubscription(sub.id, months)}
      >
        فعال‌سازی (ماه)
      </ActionButton>
    </span>
  );
}

export function SubscriptionsTab({ subscriptions }: { subscriptions: SubRow[] }) {
  return (
    <AdminTable head={["کسب‌وکار", "پلن", "وضعیت", "شروع", "پایان", "عملیات"]}>
      {subscriptions.map((s) => (
        <tr key={s.id} className="hover:bg-slate-50/60">
          <td className="px-4 py-3">
            {s.business ? (
              <Link
                href={`/business/${s.business.slug}`}
                className="font-bold text-ink hover:text-primary-700 hover:underline"
              >
                {s.business.name}
              </Link>
            ) : (
              <span className="text-slate-400">کسب‌وکار #{s.businessId}</span>
            )}
          </td>
          <td className="px-4 py-3 font-bold text-slate-600">{s.plan?.name ?? "—"}</td>
          <td className="px-4 py-3">
            <AdminBadge tone={STATUS_TONE[s.status] ?? "slate"}>
              {STATUS_LABEL[s.status] ?? s.status}
            </AdminBadge>
          </td>
          <td className="whitespace-nowrap px-4 py-3 text-slate-500">
            {s.startedAt ? toFa(new Date(s.startedAt).toLocaleDateString("fa-IR")) : "—"}
          </td>
          <td className="whitespace-nowrap px-4 py-3 text-slate-500">
            {s.endsAt ? toFa(new Date(s.endsAt).toLocaleDateString("fa-IR")) : "—"}
          </td>
          <td className="px-4 py-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {s.status === "pending" && <Activate sub={s} />}
              {s.status === "active" && (
                <ActionButton
                  className="bg-rose-50 px-3 py-2 text-rose-700 hover:bg-rose-100"
                  confirmText="اشتراک لغو شود؟"
                  action={() => cancelSubscription(s.id)}
                >
                  <XCircle className="h-3.5 w-3.5" />
                  لغو
                </ActionButton>
              )}
            </div>
          </td>
        </tr>
      ))}
      {subscriptions.length === 0 && (
        <tr>
          <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
            اشتراکی ثبت نشده است.
          </td>
        </tr>
      )}
    </AdminTable>
  );
}
