"use client";

import { useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { ActionButton, AdminBadge, AdminCard, AdminTable, Fa } from "@/components/admin/ui";
import { createPlan, deletePlan, updatePlan } from "@/lib/admin-actions";
import { formatPrice } from "@/lib/utils";
import type { getAdminPlans } from "@/lib/admin-queries";

type PlanRow = Awaited<ReturnType<typeof getAdminPlans>>[number];

function parseFeatures(features: string | null): string[] {
  try {
    const parsed = features ? JSON.parse(features) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function PlanForm({ initial, onDone }: { initial?: PlanRow; onDone: () => void }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [price, setPrice] = useState(String(initial?.priceMonthly ?? 0));
  const [features, setFeatures] = useState(
    (initial ? parseFeatures(initial.features) : ["پروفایل و کارت معرفی"]).join("\n")
  );

  return (
    <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
      <div className="grid gap-3 md:grid-cols-2">
        <label>
          <span className="mb-1 block text-[11px] font-bold text-slate-500">نام پلن</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="مثلاً نقره‌ای" />
        </label>
        <label>
          <span className="mb-1 block text-[11px] font-bold text-slate-500">قیمت ماهانه (تومان)</span>
          <input
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="input"
            dir="ltr"
          />
        </label>
        <label className="md:col-span-2">
          <span className="mb-1 block text-[11px] font-bold text-slate-500">
            امکانات (هر خط یک مورد)
          </span>
          <textarea
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
            rows={5}
            className="input resize-y leading-7"
          />
        </label>
      </div>
      <div className="mt-3 flex gap-2">
        <ActionButton
          className="bg-primary px-4 py-2.5 text-white hover:bg-primary-700"
          action={async () =>
            initial
              ? updatePlan(initial.id, {
                  name,
                  priceMonthly: Number(price),
                  features: features.split("\n"),
                  active: initial.active,
                })
              : createPlan({
                  name,
                  priceMonthly: Number(price),
                  features: features.split("\n"),
                  sortOrder: 99,
                })
          }
        >
          <Check className="h-4 w-4" />
          ذخیره
        </ActionButton>
        <button
          type="button"
          onClick={onDone}
          className="cursor-pointer rounded-lg px-3 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function PlansTab({ plans }: { plans: PlanRow[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PlanRow | null>(null);

  return (
    <AdminCard
      title="پلن‌های اشتراک ویترین حرفه‌ای"
      action={
        <button
          type="button"
          onClick={() => {
            setShowForm(true);
            setEditing(null);
          }}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-ink px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"
        >
          <Plus className="h-3.5 w-3.5" />
          پلن جدید
        </button>
      }
    >
      {(showForm || editing) && (
        <div className="mb-4">
          <PlanForm
            initial={editing ?? undefined}
            onDone={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
        </div>
      )}
      <AdminTable head={["پلن", "قیمت ماهانه", "امکانات", "وضعیت", "عملیات"]}>
        {plans.map((p) => (
          <tr key={p.id} className="align-top hover:bg-slate-50/60">
            <td className="px-4 py-3 font-bold text-ink">{p.name}</td>
            <td className="whitespace-nowrap px-4 py-3">
              {p.priceMonthly === 0 ? (
                <AdminBadge tone="green">رایگان</AdminBadge>
              ) : (
                <span className="font-bold text-ink">
                  <Fa value={formatPrice(p.priceMonthly)} /> تومان
                </span>
              )}
            </td>
            <td className="max-w-[280px] px-4 py-3">
              <ul className="space-y-1 text-xs leading-5 text-slate-500">
                {parseFeatures(p.features).map((f) => (
                  <li key={f} className="flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-primary" />
                    {f}
                  </li>
                ))}
              </ul>
            </td>
            <td className="px-4 py-3">
              {p.active ? (
                <AdminBadge tone="green">فعال</AdminBadge>
              ) : (
                <AdminBadge tone="slate">غیرفعال</AdminBadge>
              )}
            </td>
            <td className="px-4 py-3">
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(p);
                    setShowForm(false);
                  }}
                  className="cursor-pointer rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                  aria-label={`ویرایش ${p.name}`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <ActionButton
                  className="p-2 text-slate-500 hover:bg-slate-100"
                  action={() =>
                    updatePlan(p.id, {
                      name: p.name,
                      priceMonthly: p.priceMonthly,
                      features: parseFeatures(p.features),
                      active: !p.active,
                    })
                  }
                >
                  {p.active ? "غیرفعال کن" : "فعال کن"}
                </ActionButton>
                <ActionButton
                  className="p-2 text-rose-600 hover:bg-rose-50"
                  confirmText={`پلن «${p.name}» حذف شود؟`}
                  action={() => deletePlan(p.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </ActionButton>
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>
    </AdminCard>
  );
}
