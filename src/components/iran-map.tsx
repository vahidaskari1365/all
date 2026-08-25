"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, MapPin, Navigation, Store } from "lucide-react";
import type { CityRow } from "@/lib/queries";
import { toFa } from "@/lib/utils";

/**
 * جای تقریبی شهرهای نمونه روی نقشه؛ این نقشه برای انتخاب شهر و نمایش پراکندگی
 * است و برای مسیریابی دقیق، لینک نقشه‌ی هر کسب‌وکار استفاده می‌شود.
 */
const CITY_POSITIONS: Record<string, { x: number; y: number }> = {
  tabriz: { x: 176, y: 144 },
  tehran: { x: 305, y: 157 },
  karaj: { x: 275, y: 178 },
  qom: { x: 326, y: 242 },
  isfahan: { x: 310, y: 306 },
  shiraz: { x: 294, y: 405 },
  ahvaz: { x: 164, y: 382 },
  mashhad: { x: 557, y: 185 },
};

const SAMPLE_COUNTS: Record<string, number> = {
  tehran: 9,
  isfahan: 4,
  shiraz: 4,
  mashhad: 3,
  tabriz: 3,
  karaj: 3,
  ahvaz: 2,
  qom: 2,
};

type CityCount = Record<string, number>;

export function IranMap({
  cities,
  counts,
}: {
  cities: CityRow[];
  counts: CityCount;
}) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const cityData = useMemo(
    () =>
      cities
        .filter((city) => CITY_POSITIONS[city.slug])
        .map((city) => ({
          ...city,
          position: CITY_POSITIONS[city.slug],
          count: counts[city.slug] ?? SAMPLE_COUNTS[city.slug] ?? 0,
        })),
    [cities, counts]
  );

  const selected = cityData.find((city) => city.slug === selectedSlug) ?? cityData[0] ?? null;
  const total = cityData.reduce((sum, city) => sum + city.count, 0);

  return (
    <section id="iran-map" className="container-px mx-auto max-w-7xl py-16">
      <div className="overflow-hidden rounded-[2rem] bg-ink text-white shadow-2xl shadow-primary-950/15">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative min-h-[28rem] overflow-hidden bg-gradient-to-bl from-primary-950 via-ink to-[#073b31] p-5 sm:p-8">
            <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-primary-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 right-0 h-56 w-56 rounded-full bg-accent-500/15 blur-3xl" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold text-primary-100 ring-1 ring-inset ring-white/10">
                  <Navigation className="h-3.5 w-3.5" />
                  پوشش سراسری ایران
                </span>
                <h2 className="mt-4 text-2xl font-black sm:text-3xl">کسب‌وکارهای نزدیک شما</h2>
                <p className="mt-2 max-w-md text-sm leading-7 text-primary-100/75">
                  روی هر شهر بزنید تا کسب‌وکارهای همان شهر را ببینید. نمونه‌های اولیه در
                  نقشه قرار گرفته‌اند تا مسیر انتخاب برای شما روشن باشد.
                </p>
              </div>
              <span className="hidden rounded-2xl bg-white/10 px-4 py-3 text-center ring-1 ring-inset ring-white/10 sm:block">
                <strong className="block text-2xl font-black text-white">{toFa(total)}+</strong>
                <span className="mt-1 block text-[10px] text-primary-100/70">نمونه فعال</span>
              </span>
            </div>

            <div className="relative mx-auto mt-5 max-w-2xl">
              <svg
                viewBox="0 0 700 520"
                className="h-auto w-full overflow-visible"
                role="img"
                aria-label="نقشه پراکندگی نمونه‌های کسب‌وکار در ایران"
              >
                <defs>
                  <linearGradient id="iran-land" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity="0.9" />
                    <stop offset="52%" stopColor="#059669" stopOpacity="0.82" />
                    <stop offset="100%" stopColor="#047857" stopOpacity="0.92" />
                  </linearGradient>
                  <filter id="iran-glow" x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <path
                  d="M124 93 169 67 219 74 258 52 301 67 347 45 389 70 437 58 469 86 519 91 552 116 603 127 626 164 614 196 652 224 626 263 643 299 611 327 624 364 592 389 563 424 518 435 492 468 446 459 411 480 371 456 332 474 295 447 250 452 218 429 174 438 149 405 113 389 117 354 83 327 98 289 73 253 105 217 83 185 111 153 Z"
                  fill="url(#iran-land)"
                  stroke="#a7f3d0"
                  strokeOpacity="0.65"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  className="drop-shadow-[0_16px_24px_rgba(0,0,0,0.22)]"
                />
                <path
                  d="M112 153c42 19 71 21 102 3m-115 97c56 9 88 32 124 42m-73 110c55-22 91-14 138 12m34-344c-9 55 18 83 8 126m161-152c-9 51-2 76 33 101m-123 49c-19 49-9 89 19 133m-165-11c55-18 79-15 122 16m-46-201c38 9 74 5 111-17"
                  fill="none"
                  stroke="#d1fae5"
                  strokeOpacity="0.18"
                  strokeWidth="2"
                  strokeDasharray="5 8"
                />
                <text
                  x="421"
                  y="352"
                  textAnchor="middle"
                  className="pointer-events-none fill-white/20 text-[42px] font-black tracking-[0.12em]"
                >
                  ایران
                </text>
                {cityData.map((city) => {
                  const active = city.slug === selected?.slug;
                  return (
                    <a
                      key={city.id}
                      href={`/search?city=${city.slug}`}
                      onClick={() => setSelectedSlug(city.slug)}
                      aria-label={`${city.name}: ${toFa(city.count)} کسب‌وکار`}
                    >
                      <g className="cursor-pointer">
                        <circle
                          cx={city.position.x}
                          cy={city.position.y}
                          r={active ? 19 : 14}
                          fill="#fbbf24"
                          fillOpacity="0.22"
                          className="transition-all"
                        />
                        <circle
                          cx={city.position.x}
                          cy={city.position.y}
                          r={active ? 9 : 7}
                          fill="#fbbf24"
                          stroke="#fff7ed"
                          strokeWidth="3"
                          filter="url(#iran-glow)"
                          className="transition-all"
                        />
                        <text
                          x={city.position.x}
                          y={city.position.y - 22}
                          textAnchor="middle"
                          className="pointer-events-none fill-white text-[14px] font-bold"
                        >
                          {city.name}
                        </text>
                        <text
                          x={city.position.x}
                          y={city.position.y + 31}
                          textAnchor="middle"
                          className="pointer-events-none fill-primary-100 text-[11px] font-medium"
                        >
                          {toFa(city.count)} نمونه
                        </text>
                      </g>
                    </a>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="bg-white p-5 text-ink sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-primary-700">انتخاب شهر</p>
                <h3 className="mt-1 text-xl font-black">از کجا شروع کنیم؟</h3>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-50 text-primary-700">
                <MapPin className="h-5 w-5" />
              </span>
            </div>

            {selected && (
              <div className="mt-6 rounded-2xl bg-primary-50 p-4 ring-1 ring-primary-100">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-primary-700">شهر انتخاب‌شده</p>
                    <p className="mt-1 text-lg font-black text-ink">{selected.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{selected.province ?? "استان ایران"}</p>
                  </div>
                  <span className="rounded-xl bg-white px-3 py-2 text-center ring-1 ring-primary-100">
                    <strong className="block text-lg font-black text-primary-700">{toFa(selected.count)}</strong>
                    <span className="text-[10px] text-slate-400">نمونه</span>
                  </span>
                </div>
                <Link
                  href={`/search?city=${selected.slug}`}
                  className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
                >
                  مشاهده کسب‌وکارهای {selected.name}
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </div>
            )}

            <div className="mt-5 grid grid-cols-2 gap-2">
              {cityData.map((city) => (
                <Link
                  key={city.id}
                  href={`/search?city=${city.slug}`}
                  onClick={() => setSelectedSlug(city.slug)}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-xs font-bold transition-colors ${
                    city.slug === selected?.slug
                      ? "border-primary bg-primary-50 text-primary-700"
                      : "border-slate-200 text-slate-600 hover:border-primary-200 hover:bg-primary-50/60"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    <Store className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="truncate">{city.name}</span>
                  </span>
                  <span className="shrink-0 text-[11px] text-slate-400">{toFa(city.count)}</span>
                </Link>
              ))}
            </div>

            <p className="mt-5 flex items-start gap-2 text-[11px] leading-5 text-slate-400">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent-400" />
              تعدادهای روی نقشه با داده‌های ثبت‌شده در سامانه به‌روزرسانی می‌شوند.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
