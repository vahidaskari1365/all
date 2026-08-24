"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  X,
  Store,
  LayoutDashboard,
  LogIn,
  MapPin,
  ShieldCheck,
} from "lucide-react";

const NAV = [
  { href: "/", label: "خانه" },
  { href: "/search", label: "کسب‌وکارها" },
  { href: "/#categories", label: "دسته‌بندی‌ها" },
  { href: "/#how", label: "چطور کار می‌کند" },
];

export function HeaderNav({
  isAuthed,
  ownerName,
}: {
  isAuthed: boolean;
  ownerName?: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      {/* نوار شفافیت اطلاعات */}
      <div className="bg-primary-950 text-primary-100 text-[11px] sm:text-xs">
        <div className="container-px mx-auto flex max-w-7xl items-center justify-center gap-2 py-1.5 text-center">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
          <span>
            وضعیت جواز، اتحادیه و ضمانت هر کسب‌وکار، صرفاً بر اساس{" "}
            <span className="font-semibold">اظهار خود آن کسب‌وکار</span> است.
          </span>
        </div>
      </div>

      {/* نوار اصلی */}
      <div className="glass border-b border-slate-200/70">
        <div className="container-px mx-auto flex h-16 max-w-7xl items-center justify-between gap-4">
          <Link
            href="/"
            className="group flex items-center gap-2.5"
            aria-label="کسب‌یاب — خانه"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-bl from-primary to-primary-700 text-white shadow-lg shadow-primary-600/25 transition-transform group-hover:-rotate-6">
              <Store className="h-5 w-5" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-lg font-extrabold tracking-tight text-ink">
                کسب‌یاب
              </span>
              <span className="text-[10px] text-slate-500">مرجع معرفی کسب‌وکار</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-primary-50 hover:text-primary-700"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {isAuthed ? (
              <Link
                href="/owner/dashboard"
                className="hidden items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03] sm:flex"
              >
                <LayoutDashboard className="h-4 w-4" />
                پنل مدیریت
              </Link>
            ) : (
              <Link
                href="/owner"
                className="hidden items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03] sm:flex"
              >
                <LogIn className="h-4 w-4" />
                ورود صاحبان کسب‌وکار
              </Link>
            )}

            <Link
              href="/search"
              className="hidden items-center gap-2 rounded-xl bg-accent-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-accent-600/25 transition-transform hover:scale-[1.03] md:flex"
            >
              <MapPin className="h-4 w-4" />
              شروع جست‌وجو
            </Link>

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-ink lg:hidden"
              aria-label="باز کردن منو"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* کشوی موبایل */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="absolute inset-y-0 left-0 flex w-[82%] max-w-sm flex-col bg-white shadow-2xl"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
            >
              <div className="flex items-center justify-between border-b border-slate-100 p-4">
                <span className="flex items-center gap-2 font-extrabold">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-bl from-primary to-primary-700 text-white">
                    <Store className="h-5 w-5" />
                  </span>
                  کسب‌یاب
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200"
                  aria-label="بستن منو"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-1 p-4">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-4 py-3 text-base font-medium text-slate-700 transition-colors hover:bg-primary-50 hover:text-primary-700"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-2 border-t border-slate-100 p-4">
                <Link
                  href="/search"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-accent-600 px-4 py-3 font-bold text-white"
                >
                  <MapPin className="h-4 w-4" />
                  شروع جست‌وجو
                </Link>
                {isAuthed ? (
                  <Link
                    href="/owner/dashboard"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 font-semibold text-white"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    پنل مدیریت{ownerName ? ` (${ownerName})` : ""}
                  </Link>
                ) : (
                  <Link
                    href="/owner"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 font-semibold text-ink"
                  >
                    <LogIn className="h-4 w-4" />
                    ورود صاحبان کسب‌وکار
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
