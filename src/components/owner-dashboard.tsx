"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  X,
  Images,
  Tag,
  Check,
  BadgeCheck,
  Handshake,
  ShieldCheck,
  Store,
  Info,
  ChevronDown,
} from "lucide-react";
import type { BusinessWithMeta, CategoryRow, CityRow } from "@/lib/queries";
import { CategoryIcon, CATEGORY_COLORS } from "@/components/category-icon";
import { toFa } from "@/lib/utils";

type Item = {
  id: number;
  type: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  price: string | null;
  unit: string | null;
};

type Biz = BusinessWithMeta & { items: Item[] };

type FormState = {
  name: string;
  categoryId: string;
  cityId: string;
  district: string;
  tagline: string;
  description: string;
  phone: string;
  mobile: string;
  email: string;
  website: string;
  logoUrl: string;
  coverUrl: string;
  instagram: string;
  telegram: string;
  whatsapp: string;
  workHours: string;
  lat: string;
  lng: string;
  hasLicense: boolean;
  unionMember: boolean;
  hasGuarantee: boolean;
  hasShowcase: boolean;
};

const EMPTY_FORM: FormState = {
  name: "",
  categoryId: "",
  cityId: "",
  district: "",
  tagline: "",
  description: "",
  phone: "",
  mobile: "",
  email: "",
  website: "",
  logoUrl: "",
  coverUrl: "",
  instagram: "",
  telegram: "",
  whatsapp: "",
  workHours: "",
  lat: "",
  lng: "",
  hasLicense: false,
  unionMember: false,
  hasGuarantee: false,
  hasShowcase: false,
};

function toForm(b: Biz): FormState {
  return {
    name: b.name,
    categoryId: String(b.categoryId),
    cityId: String(b.cityId),
    district: b.district ?? "",
    tagline: b.tagline ?? "",
    description: b.description ?? "",
    phone: b.phone ?? "",
    mobile: b.mobile ?? "",
    email: b.email ?? "",
    website: b.website ?? "",
    logoUrl: b.logoUrl ?? "",
    coverUrl: b.coverUrl ?? "",
    instagram: b.instagram ?? "",
    telegram: b.telegram ?? "",
    whatsapp: b.whatsapp ?? "",
    workHours: b.workHours ?? "",
    lat: b.lat ?? "",
    lng: b.lng ?? "",
    hasLicense: b.hasLicense,
    unionMember: b.unionMember,
    hasGuarantee: b.hasGuarantee,
    hasShowcase: b.hasShowcase,
  };
}

const TOGGLES: { key: keyof FormState; label: string; icon: typeof BadgeCheck }[] = [
  { key: "hasLicense", label: "دارای جواز کسب", icon: BadgeCheck },
  { key: "unionMember", label: "عضو اتحادیه", icon: Handshake },
  { key: "hasGuarantee", label: "دارای ضمانت", icon: ShieldCheck },
  { key: "hasShowcase", label: "ویترین حرفه‌ای", icon: Images },
];

export function OwnerDashboard({
  ownerName,
  businesses,
  categories,
  cities,
}: {
  ownerName: string;
  businesses: Biz[];
  categories: CategoryRow[];
  cities: CityRow[];
}) {
  const [list, setList] = useState<Biz[]>(businesses);
  const [editing, setEditing] = useState<Biz | "new" | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showcaseFor, setShowcaseFor] = useState<number | null>(null);

  function openCreate() {
    setForm(EMPTY_FORM);
    setError(null);
    setEditing("new");
  }
  function openEdit(b: Biz) {
    setForm(toForm(b));
    setError(null);
    setEditing(b);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (!form.name.trim() || !form.categoryId || !form.cityId) {
        setError("نام، دسته و شهر الزامی هستند.");
        return;
      }
      const payload = { ...form, categoryId: Number(form.categoryId), cityId: Number(form.cityId) };

      if (editing === "new") {
        const res = await fetch("/api/business", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        const j = await res.json();
        if (!res.ok) {
          setError(j.error ?? "خطا در ثبت.");
          return;
        }
        const cat = categories.find((c) => c.id === payload.categoryId) ?? null;
        const cit = cities.find((c) => c.id === payload.cityId) ?? null;
        const nb: Biz = {
          id: j.business.id,
          name: form.name,
          slug: j.business.slug,
          categoryId: payload.categoryId,
          cityId: payload.cityId,
          district: form.district || null,
          tagline: form.tagline || null,
          description: form.description || null,
          address: null,
          phone: form.phone || null,
          mobile: form.mobile || null,
          email: form.email || null,
          website: form.website || null,
          logoUrl: form.logoUrl || null,
          coverUrl: form.coverUrl || null,
          lat: form.lat || null,
          lng: form.lng || null,
          instagram: form.instagram || null,
          telegram: form.telegram || null,
          whatsapp: form.whatsapp || null,
          workHours: form.workHours || null,
          hasLicense: form.hasLicense,
          unionMember: form.unionMember,
          hasGuarantee: form.hasGuarantee,
          hasShowcase: form.hasShowcase,
          rating: 0,
          reviewCount: 0,
          featured: false,
          verified: false,
          ownerId: null,
          category: cat,
          city: cit,
          items: [],
        };
        setList((prev) => [nb, ...prev]);
      } else if (editing) {
        const res = await fetch(`/api/business/${editing.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        const j = await res.json();
        if (!res.ok) {
          setError(j.error ?? "خطا در به‌روزرسانی.");
          return;
        }
        const cat = categories.find((c) => c.id === payload.categoryId) ?? null;
        const cit = cities.find((c) => c.id === payload.cityId) ?? null;
        setList((prev) =>
          prev.map((b) =>
            b.id === editing.id
              ? {
                  ...b,
                  ...payload,
                  district: payload.district || null,
                  tagline: payload.tagline || null,
                  description: payload.description || null,
                  phone: payload.phone || null,
                  mobile: payload.mobile || null,
                  email: payload.email || null,
                  website: payload.website || null,
                  logoUrl: payload.logoUrl || null,
                  coverUrl: payload.coverUrl || null,
                  instagram: payload.instagram || null,
                  telegram: payload.telegram || null,
                  whatsapp: payload.whatsapp || null,
                  workHours: payload.workHours || null,
                  lat: payload.lat || null,
                  lng: payload.lng || null,
                  category: cat,
                  city: cit,
                }
              : b
          )
        );
      }
      setEditing(null);
    } finally {
      setSaving(false);
    }
  }

  async function addShowcase(businessId: number, data: Record<string, string>) {
    const res = await fetch("/api/showcase", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...data, businessId }),
    });
    const j = await res.json();
    if (res.ok && j.item) {
      setList((prev) =>
        prev.map((b) =>
          b.id === businessId
            ? {
                ...b,
                items: [
                  ...b.items,
                  {
                    id: j.item.id,
                    type: data.type === "product" ? "product" : "photo",
                    title: data.title,
                    description: data.description || null,
                    imageUrl: data.imageUrl || null,
                    price: data.price || null,
                    unit: data.type === "product" ? data.unit || "تومان" : null,
                  },
                ],
              }
            : b
        )
      );
      return true;
    }
    return false;
  }

  async function removeShowcase(businessId: number, itemId: number) {
    const res = await fetch(`/api/showcase/${itemId}`, { method: "DELETE" });
    if (res.ok) {
      setList((prev) =>
        prev.map((b) =>
          b.id === businessId
            ? { ...b, items: b.items.filter((it) => it.id !== itemId) }
            : b
        )
      );
    }
  }



  return (
    <div className="container-px mx-auto max-w-6xl py-8 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">پنل مدیریت صاحبان کسب‌وکار</p>
          <h1 className="mt-1 text-2xl font-black text-ink sm:text-3xl">
            سلام، {ownerName} 👋
          </h1>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary-600/25 transition-transform hover:scale-[1.03]"
        >
          <Plus className="h-4 w-4" />
          افزودن کسب‌وکار جدید
        </button>
      </div>

      {/* فهرست کسب‌وکارها */}
      <div className="mt-8 space-y-4">
        {list.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary-50 text-primary-700">
              <Store className="h-7 w-7" />
            </span>
            <h3 className="mt-4 font-bold text-ink">هنوز کسب‌وکاری ثبت نکرده‌اید</h3>
            <p className="mt-1 text-sm text-slate-500">
              اولین کسب‌وکار خود را برای نمایش در کسب‌یاب اضافه کنید.
            </p>
            <button
              onClick={openCreate}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white"
            >
              <Plus className="h-4 w-4" /> شروع کنید
            </button>
          </div>
        )}

        {list.map((b) => {
          const open = showcaseFor === b.id;
          const grad = CATEGORY_COLORS[b.category?.color ?? "primary"];
          return (
            <div key={b.id} className="card overflow-hidden">
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-bl ${grad} text-white`}>
                    <CategoryIcon name={b.category?.icon ?? "store"} className="h-6 w-6" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate font-extrabold text-ink">{b.name}</h3>
                    <p className="text-xs text-slate-500">
                      {b.category?.name} • {b.city?.name}
                      {b.district ? ` • ${b.district}` : ""}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {b.verified && <MiniTag tone="primary">تأیید پلتفرم</MiniTag>}
                      {b.hasLicense && <MiniTag tone="emerald">جواز</MiniTag>}
                      {b.unionMember && <MiniTag tone="sky">اتحادیه</MiniTag>}
                      {b.hasGuarantee && <MiniTag tone="amber">ضمانت</MiniTag>}
                      {b.hasShowcase && <MiniTag tone="violet">ویترین</MiniTag>}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Link
                    href={`/business/${b.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-ink transition-colors hover:bg-slate-50"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    صفحه عمومی
                  </Link>
                  <button
                    onClick={() => openEdit(b)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-700"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    ویرایش
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowcaseFor(open ? null : b.id)}
                className="flex w-full items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
              >
                <span className="flex items-center gap-2">
                  <Images className="h-4 w-4 text-primary" />
                  مدیریت ویترین
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] text-slate-500 ring-1 ring-slate-200">
                    {toFa(b.items.length)} آیتم
                  </span>
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-slate-100 p-5">
                      <ShowcasePanel
                        businessId={b.id}
                        items={b.items}
                        onAdd={addShowcase}
                        onRemove={removeShowcase}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* مودال فرم کسب‌وکار */}
      <AnimatePresence>
        {editing && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-ink/50 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditing(null)}
          >
            <motion.div
              className="my-8 w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={save}>
                <div className="flex items-center justify-between border-b border-slate-100 p-5">
                  <h2 className="flex items-center gap-2 font-extrabold text-ink">
                    <Store className="h-5 w-5 text-primary" />
                    {editing === "new" ? "ثبت کسب‌وکار جدید" : "ویرایش کسب‌وکار"}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500"
                    aria-label="بستن"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="max-h-[65vh] space-y-4 overflow-y-auto p-5">
                  {error && (
                    <div className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 ring-1 ring-red-200">
                      {error}
                    </div>
                  )}

                  <Field label="نام کسب‌وکار *">
                    <input
                      className="input"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="مثلاً رستوران سنتی اصغر"
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="نوع خدمت (دسته) *">
                      <select
                        className="input"
                        value={form.categoryId}
                        onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                      >
                        <option value="">انتخاب کنید</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="شهر *">
                      <select
                        className="input"
                        value={form.cityId}
                        onChange={(e) => setForm({ ...form, cityId: e.target.value })}
                      >
                        <option value="">انتخاب کنید</option>
                        {cities.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <Field label="محله">
                    <input
                      className="input"
                      value={form.district}
                      onChange={(e) => setForm({ ...form, district: e.target.value })}
                      placeholder="مثلاً سعادت‌آباد"
                    />
                  </Field>

                  <Field label="معرفی کوتاه (تگ‌لاین)">
                    <input
                      className="input"
                      value={form.tagline}
                      onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                      placeholder="یک جمله جذاب درباره کسب‌وکار"
                    />
                  </Field>

                  <Field label="طرح معرفی کامل (هر خط یک ویژگی)">
                    <textarea
                      className="input min-h-28"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder={"بیش از ۱۵ سال سابقه\nمحصولات ارگانیک و تازه\nفضای دنج و خانوادگی"}
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="تلفن ثابت">
                      <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="02112345678" />
                    </Field>
                    <Field label="موبایل">
                      <input className="input" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="09123456789" />
                    </Field>
                    <Field label="ایمیل">
                      <input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="info@example.com" />
                    </Field>
                    <Field label="وب‌سایت">
                      <input className="input" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://example.com" />
                    </Field>
                    <Field label="آدرس تصویر لوگو (URL)">
                      <input className="input" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://..." />
                    </Field>
                    <Field label="آدرس تصویر کاور (URL)">
                      <input className="input" value={form.coverUrl} onChange={(e) => setForm({ ...form, coverUrl: e.target.value })} placeholder="https://..." />
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="اینستاگرام (آیدی)">
                      <input className="input" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="mybusiness" />
                    </Field>
                    <Field label="تلگرام (آیدی)">
                      <input className="input" value={form.telegram} onChange={(e) => setForm({ ...form, telegram: e.target.value })} placeholder="mybusiness" />
                    </Field>
                    <Field label="واتساپ (شماره)">
                      <input className="input" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="989123456789" />
                    </Field>
                  </div>

                  <Field label="ساعات کاری">
                    <input className="input" value={form.workHours} onChange={(e) => setForm({ ...form, workHours: e.target.value })} placeholder="شنبه تا پنجشنبه ۹ تا ۲۲" />
                  </Field>

                  {/* وضعیت‌های اظهاری */}
                  <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <p className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                      <Info className="h-3.5 w-3.5 text-primary" />
                      وضعیت‌های زیر صرفاً بر اساس اظهار شما ثبت می‌شوند.
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {TOGGLES.map(({ key, label, icon: Icon }) => (
                        <label
                          key={key}
                          className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors ${
                            form[key]
                              ? "border-primary bg-primary-50 text-primary-700"
                              : "border-slate-200 bg-white text-slate-600"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={form[key] as boolean}
                            onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                          />
                          <span
                            className={`grid h-4 w-4 place-items-center rounded ${
                              form[key] ? "bg-primary text-white" : "bg-slate-200"
                            }`}
                          >
                            {form[key] ? <Check className="h-3 w-3" /> : null}
                          </span>
                          <Icon className="h-3.5 w-3.5" />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-slate-100 p-5">
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary-600/25 transition-transform hover:scale-[1.02] disabled:opacity-60"
                  >
                    <Check className="h-4 w-4" />
                    {editing === "new" ? "ثبت کسب‌وکار" : "ذخیره تغییرات"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function MiniTag({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "primary" | "emerald" | "sky" | "amber" | "violet";
}) {
  const tones: Record<string, string> = {
    primary: "bg-primary-50 text-primary-700 ring-primary-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    sky: "bg-sky-50 text-sky-700 ring-sky-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    violet: "bg-violet-50 text-violet-700 ring-violet-200",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${tones[tone]}`}>
      {children}
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-600">{label}</span>
      {children}
    </label>
  );
}

function ShowcasePanel({
  businessId,
  items,
  onAdd,
  onRemove,
}: {
  businessId: number;
  items: Item[];
  onAdd: (id: number, data: Record<string, string>) => Promise<boolean>;
  onRemove: (bid: number, iid: number) => void;
}) {
  const [type, setType] = useState("photo");
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    const ok = await onAdd(businessId, { type, title, imageUrl, description, price, unit });
    setBusy(false);
    if (ok) {
      setTitle("");
      setImageUrl("");
      setDescription("");
      setPrice("");
      setUnit("");
    }
  }

  return (
    <div>
      <div className="mb-4">
        <h4 className="flex items-center gap-2 text-sm font-bold text-ink">
          <Tag className="h-4 w-4 text-primary" />
          افزودن آیتم به ویترین
        </h4>
        <form onSubmit={submit} className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-[11px] font-bold text-slate-500">نوع</span>
            <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="photo">عکس (گالری)</option>
              <option value="product">محصول با قیمت</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-bold text-slate-500">عنوان *</span>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثلاً چلوکباب مخصوص" />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-[11px] font-bold text-slate-500">آدرس تصویر (URL)</span>
            <input className="input" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
          </label>
          {type === "product" && (
            <div className="grid grid-cols-2 gap-3 sm:col-span-2">
              <label className="block">
                <span className="mb-1 block text-[11px] font-bold text-slate-500">قیمت (تومان)</span>
                <input className="input" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="۱۲۰۰۰۰" />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-bold text-slate-500">واحد</span>
                <input className="input" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="تومان / نفر / کیلو" />
              </label>
            </div>
          )}
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-[11px] font-bold text-slate-500">توضیحات</span>
            <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="توضیح کوتاه (اختیاری)" />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            <Plus className="h-3.5 w-3.5" />
            افزودن به ویترین
          </button>
        </form>
      </div>

      {items.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-bold text-slate-500">آیتم‌های موجود</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {items.map((it) => (
              <div key={it.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5">
                <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-100">
                  {it.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.imageUrl} alt={it.title} className="h-full w-full object-cover" />
                  ) : (
                    <Images className="h-5 w-5 text-slate-300" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-ink">{it.title}</p>
                  <p className="text-[11px] text-slate-500">
                    {it.type === "product" ? "محصول" : "عکس"}
                    {it.price ? ` • ${toFa(it.price)}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => onRemove(businessId, it.id)}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-red-500 transition-colors hover:bg-red-50"
                  aria-label="حذف"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
