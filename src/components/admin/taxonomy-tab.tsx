"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, X, Check } from "lucide-react";
import { ActionButton, AdminBadge, AdminCard, AdminTable } from "@/components/admin/ui";
import {
  createCategory,
  deleteCategory,
  updateCategory,
  createCity,
  deleteCity,
  updateCity,
} from "@/lib/admin-actions";
import type { CategoryRow, CityRow } from "@/lib/queries";

const ICON_OPTIONS = ["store", "utensils", "scissors", "stethoscope", "smartphone", "shirt", "car", "dumbbell", "graduation", "wrench", "home", "camera", "health"];
const COLOR_OPTIONS = ["primary", "emerald", "sky", "violet", "rose", "amber", "indigo", "teal"];

function CategoryForm({
  initial,
  onDone,
}: {
  initial?: CategoryRow;
  onDone: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "store");
  const [color, setColor] = useState(initial?.color ?? "primary");

  return (
    <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-[160px] flex-1">
          <span className="mb-1 block text-[11px] font-bold text-slate-500">نام دسته</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            placeholder="مثلاً خدمات ساختمانی"
          />
        </label>
        <label>
          <span className="mb-1 block text-[11px] font-bold text-slate-500">آیکن</span>
          <select value={icon} onChange={(e) => setIcon(e.target.value)} className="input cursor-pointer">
            {ICON_OPTIONS.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-1 block text-[11px] font-bold text-slate-500">رنگ</span>
          <select value={color} onChange={(e) => setColor(e.target.value)} className="input cursor-pointer">
            {COLOR_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <div className="flex gap-2">
          <ActionButton
            className="bg-primary px-4 py-2.5 text-white hover:bg-primary-700"
            action={async () =>
              initial
                ? updateCategory(initial.id, { name, icon, color })
                : createCategory({ name, icon, color })
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
    </div>
  );
}

function CityForm({
  initial,
  onDone,
}: {
  initial?: CityRow;
  onDone: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [province, setProvince] = useState(initial?.province ?? "");

  return (
    <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-[140px] flex-1">
          <span className="mb-1 block text-[11px] font-bold text-slate-500">نام شهر</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="مثلاً رشت" />
        </label>
        <label className="min-w-[140px] flex-1">
          <span className="mb-1 block text-[11px] font-bold text-slate-500">استان</span>
          <input value={province} onChange={(e) => setProvince(e.target.value)} className="input" placeholder="مثلاً گیلان" />
        </label>
        <div className="flex gap-2">
          <ActionButton
            className="bg-primary px-4 py-2.5 text-white hover:bg-primary-700"
            action={async () =>
              initial ? updateCity(initial.id, { name, province }) : createCity({ name, province })
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
    </div>
  );
}

export function TaxonomyTab({
  categories,
  cities,
}: {
  categories: CategoryRow[];
  cities: CityRow[];
}) {
  const [showCatForm, setShowCatForm] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoryRow | null>(null);
  const [showCityForm, setShowCityForm] = useState(false);
  const [editingCity, setEditingCity] = useState<CityRow | null>(null);

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <AdminCard
        title={`دسته‌بندی خدمات (${categories.length})`}
        action={
          <button
            type="button"
            onClick={() => {
              setShowCatForm(true);
              setEditingCat(null);
            }}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-ink px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"
          >
            <Plus className="h-3.5 w-3.5" />
            دسته جدید
          </button>
        }
      >
        {(showCatForm || editingCat) && (
          <div className="mb-4">
            <CategoryForm
              initial={editingCat ?? undefined}
              onDone={() => {
                setShowCatForm(false);
                setEditingCat(null);
              }}
            />
          </div>
        )}
        <AdminTable head={["نام", "آیکن", "رنگ", "عملیات"]}>
          {categories.map((c) => (
            <tr key={c.id} className="hover:bg-slate-50/60">
              <td className="px-4 py-2.5 font-bold text-ink">{c.name}</td>
              <td className="px-4 py-2.5">
                <AdminBadge>{c.icon}</AdminBadge>
              </td>
              <td className="px-4 py-2.5">
                <AdminBadge tone="sky">{c.color}</AdminBadge>
              </td>
              <td className="px-4 py-2.5">
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCat(c);
                      setShowCatForm(false);
                    }}
                    className="cursor-pointer rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                    aria-label={`ویرایش ${c.name}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <ActionButton
                    className="p-2 text-rose-600 hover:bg-rose-50"
                    confirmText={`دسته «${c.name}» حذف شود؟`}
                    action={() => deleteCategory(c.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </ActionButton>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      </AdminCard>

      <AdminCard
        title={`شهرها (${cities.length})`}
        action={
          <button
            type="button"
            onClick={() => {
              setShowCityForm(true);
              setEditingCity(null);
            }}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-ink px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"
          >
            <Plus className="h-3.5 w-3.5" />
            شهر جدید
          </button>
        }
      >
        {(showCityForm || editingCity) && (
          <div className="mb-4">
            <CityForm
              initial={editingCity ?? undefined}
              onDone={() => {
                setShowCityForm(false);
                setEditingCity(null);
              }}
            />
          </div>
        )}
        <AdminTable head={["نام", "استان", "عملیات"]}>
          {cities.map((c) => (
            <tr key={c.id} className="hover:bg-slate-50/60">
              <td className="px-4 py-2.5 font-bold text-ink">{c.name}</td>
              <td className="px-4 py-2.5 text-slate-500">{c.province ?? "—"}</td>
              <td className="px-4 py-2.5">
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCity(c);
                      setShowCityForm(false);
                    }}
                    className="cursor-pointer rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                    aria-label={`ویرایش ${c.name}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <ActionButton
                    className="p-2 text-rose-600 hover:bg-rose-50"
                    confirmText={`شهر «${c.name}» حذف شود؟`}
                    action={() => deleteCity(c.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </ActionButton>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      </AdminCard>
    </div>
  );
}
