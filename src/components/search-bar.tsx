"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Locate, ChevronDown } from "lucide-react";
import type { CategoryRow, CityRow } from "@/lib/queries";

export function SearchBar({
  cities,
  categories,
}: {
  cities: CityRow[];
  categories: CategoryRow[];
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [located, setLocated] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (city) params.set("city", city);
    if (category) params.set("cat", category);
    router.push(`/search?${params.toString()}`);
  }

  function useLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      () => setLocated(true),
      () => setLocated(false)
    );
  }

  return (
    <form
      onSubmit={submit}
      className="card w-full p-2.5 shadow-2xl shadow-primary-900/10 sm:p-3"
    >
      <div className="flex flex-col gap-2.5 md:flex-row md:items-center">
        {/* شهر */}
        <label className="relative flex-1">
          <span className="sr-only">انتخاب شهر</span>
          <MapPin className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="h-12 w-full cursor-pointer appearance-none rounded-xl bg-slate-50 pr-11 pl-8 text-sm font-medium text-ink outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-primary"
          >
            <option value="">همه شهرها</option>
            {cities.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
                {c.province ? ` — ${c.province}` : ""}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </label>

        <span className="hidden h-8 w-px bg-slate-200 md:block" />

        {/* نوع خدمت */}
        <label className="relative flex-1">
          <span className="sr-only">نوع خدمت</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-12 w-full cursor-pointer appearance-none rounded-xl bg-slate-50 px-4 text-sm font-medium text-ink outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-primary"
          >
            <option value="">همه خدمات</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </label>

        <span className="hidden h-8 w-px bg-slate-200 md:block" />

        {/* متن جست‌وجو */}
        <label className="relative flex-[1.6]">
          <span className="sr-only">جست‌وجوی کسب‌وکار</span>
          <Search className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="نام کسب‌وکار، خدمت یا محله…"
            className="h-12 w-full rounded-xl bg-slate-50 pr-11 pl-4 text-sm text-ink placeholder:text-slate-400 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-primary"
          />
        </label>

        <button
          type="submit"
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-lg shadow-primary-600/30 transition-transform hover:scale-[1.02] active:scale-95"
        >
          <Search className="h-5 w-5" />
          جست‌وجو
        </button>
      </div>

      <div className="mt-2.5 flex items-center justify-between px-1">
        <button
          type="button"
          onClick={useLocation}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
            located
              ? "bg-primary-50 text-primary-700"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <Locate className="h-3.5 w-3.5" />
          {located ? "موقعیت شما فعال شد" : "بر اساس موقعیت من"}
        </button>
        <span className="text-xs text-slate-400">
          جست‌وجوی سریع در میان کسب‌وکارها
        </span>
      </div>
    </form>
  );
}
