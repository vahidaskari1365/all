"use client";

import { ActionButton, AdminBadge, AdminTable, Fa } from "@/components/admin/ui";
import { setOwnerApproved, setOwnerActive } from "@/lib/admin-actions";
import type { owners } from "@/db/schema";

type Owner = typeof owners.$inferSelect;

export function OwnersTab({ owners }: { owners: Owner[] }) {
  return (
    <AdminTable head={["نام", "موبایل", "وضعیت تأیید", "وضعیت حساب", "عضویت", "عملیات"]}>
      {owners.map((o) => (
        <tr key={o.id} className="transition-colors hover:bg-slate-50/60">
          <td className="px-4 py-3 font-bold text-ink">{o.name}</td>
          <td className="px-4 py-3 text-slate-500" dir="ltr">
            {o.phone}
          </td>
          <td className="px-4 py-3">
            {o.approved ? (
              <AdminBadge tone="green">تأییدشده</AdminBadge>
            ) : (
              <AdminBadge tone="amber">در انتظار تأیید</AdminBadge>
            )}
          </td>
          <td className="px-4 py-3">
            {o.active ? (
              <AdminBadge tone="sky">فعال</AdminBadge>
            ) : (
              <AdminBadge tone="rose">غیرفعال</AdminBadge>
            )}
          </td>
          <td className="px-4 py-3 text-slate-500">
            <Fa value={new Date(o.createdAt).toLocaleDateString("fa-IR")} />
          </td>
          <td className="px-4 py-3">
            <div className="flex flex-wrap gap-1.5">
              {!o.approved ? (
                <ActionButton
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                  action={() => setOwnerApproved(o.id, true)}
                >
                  تأیید حساب
                </ActionButton>
              ) : (
                <ActionButton
                  className="bg-slate-100 text-slate-600 hover:bg-slate-200"
                  confirmText="با لغو تأیید، این کاربر نمی‌تواند کسب‌وکار جدید ثبت کند."
                  action={() => setOwnerApproved(o.id, false)}
                >
                  لغو تأیید
                </ActionButton>
              )}
              <ActionButton
                className={
                  o.active
                    ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }
                confirmText={
                  o.active
                    ? "حساب غیرفعال شود و دسترسی کاربر قطع گردد؟"
                    : undefined
                }
                action={() => setOwnerActive(o.id, !o.active)}
              >
                {o.active ? "غیرفعال‌سازی" : "فعال‌سازی"}
              </ActionButton>
            </div>
          </td>
        </tr>
      ))}
    </AdminTable>
  );
}
