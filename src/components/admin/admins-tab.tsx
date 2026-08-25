"use client";

import { useState } from "react";
import { KeyRound, Plus, ShieldAlert, UserPlus } from "lucide-react";
import { ActionButton, AdminBadge, AdminCard, AdminTable, Fa } from "@/components/admin/ui";
import { createAdmin, resetAdminTotp, toggleAdminActive } from "@/lib/admin-actions";

type AdminRow = {
  id: number;
  name: string;
  email: string;
  role: string;
  totpEnabled: boolean;
  active: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
};

export function AdminsManager({
  admins,
  currentRole,
  currentId,
}: {
  admins: AdminRow[];
  currentRole: string;
  currentId: number;
}) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");

  return (
    <AdminCard
      title="مدیران سامانه"
      action={
        currentRole === "superadmin" ? (
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-ink px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"
          >
            <Plus className="h-3.5 w-3.5" />
            مدیر جدید
          </button>
        ) : undefined
      }
    >
      {showForm && (
        <div className="mb-4 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="نام مدیر"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              dir="ltr"
              placeholder="email@kasbyab.ir"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              dir="ltr"
              placeholder="رمز عبور (حداقل ۸ کاراکتر)"
            />
            <select value={role} onChange={(e) => setRole(e.target.value)} className="input cursor-pointer">
              <option value="admin">مدیر</option>
              <option value="operator">اپراتور</option>
            </select>
          </div>
          <div className="mt-3">
            <ActionButton
              className="bg-primary px-4 py-2.5 text-white hover:bg-primary-700"
              action={async () => createAdmin({ name, email, password, role })}
            >
              <UserPlus className="h-4 w-4" />
              ساخت مدیر
            </ActionButton>
          </div>
        </div>
      )}

      <AdminTable head={["مدیر", "نقش", "وضعیت", "2FA", "آخرین ورود", "عملیات"]}>
        {admins.map((a) => (
          <tr key={a.id} className="hover:bg-slate-50/60">
            <td className="px-4 py-2.5">
              <p className="font-bold text-ink">{a.name}</p>
              <p className="text-[10px] text-slate-400" dir="ltr">{a.email}</p>
            </td>
            <td className="px-4 py-2.5">
              <AdminBadge tone={a.role === "superadmin" ? "violet" : "sky"}>
                {a.role === "superadmin" ? "مدیرکل" : a.role === "operator" ? "اپراتور" : "مدیر"}
              </AdminBadge>
            </td>
            <td className="px-4 py-2.5">
              <AdminBadge tone={a.active ? "green" : "rose"}>
                {a.active ? "فعال" : "غیرفعال"}
              </AdminBadge>
            </td>
            <td className="px-4 py-2.5">
              {a.totpEnabled ? (
                <AdminBadge tone="green">
                  <KeyRound className="h-3 w-3" />
                  فعال
                </AdminBadge>
              ) : (
                <AdminBadge tone="slate">خاموش</AdminBadge>
              )}
            </td>
            <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
              {a.lastLoginAt ? (
                <Fa value={new Date(a.lastLoginAt).toLocaleString("fa-IR")} />
              ) : (
                "—"
              )}
            </td>
            <td className="px-4 py-2.5">
              <div className="flex flex-wrap gap-1.5">
                {a.id !== currentId && (
                  <ActionButton
                    className={
                      a.active
                        ? "bg-rose-50 px-3 py-2 text-rose-700 hover:bg-rose-100"
                        : "bg-emerald-50 px-3 py-2 text-emerald-700 hover:bg-emerald-100"
                    }
                    action={() => toggleAdminActive(a.id)}
                  >
                    {a.active ? "غیرفعال" : "فعال"}
                  </ActionButton>
                )}
                {a.totpEnabled && (
                  <ActionButton
                    className="bg-amber-50 px-3 py-2 text-amber-700 hover:bg-amber-100"
                    confirmText={
                      a.id === currentId
                        ? "بازنشانی 2FA حساب خودتان ممکن است دسترسی شما را تا تنظیم مجدد محدود کند. ادامه می‌دهید؟"
                        : "احراز دومرحله‌ای این مدیر بازنشانی شود؟"
                    }
                    action={() => resetAdminTotp(a.id)}
                  >
                    <ShieldAlert className="h-3.5 w-3.5" />
                    بازنشانی 2FA
                  </ActionButton>
                )}
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>
    </AdminCard>
  );
}
