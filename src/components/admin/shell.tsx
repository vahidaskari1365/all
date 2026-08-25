"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Users,
  Shapes,
  Flag,
  Package,
  CreditCard,
  Palette,
  ScrollText,
  ShieldCheck,
  LogOut,
  Megaphone,
  ClipboardList,
  UserCog,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const TABS: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "overview", label: "نمای کلی", icon: LayoutDashboard },
  { key: "businesses", label: "کسب‌وکارها", icon: Store },
  { key: "owners", label: "صاحبان کسب‌وکار", icon: Users },
  { key: "taxonomy", label: "دسته‌ها و شهرها", icon: Shapes },
  { key: "reports", label: "گزارش‌های مردمی", icon: Flag },
  { key: "orders", label: "سفارش‌ها", icon: ClipboardList },
  { key: "plans", label: "پلن‌ها", icon: Package },
  { key: "subscriptions", label: "اشتراک‌ها", icon: CreditCard },
  { key: "designers", label: "طراحان", icon: Palette },
  { key: "referrals", label: "معرفی‌ها", icon: Megaphone },
  { key: "blog", label: "بلاگ", icon: ScrollText },
  { key: "audit", label: "سوابق مدیریتی", icon: ShieldCheck },
  { key: "admins", label: "مدیران سامانه", icon: UserCog },
];

export function AdminShell({
  adminName,
  adminRole,
  tab,
  children,
}: {
  adminName: string;
  adminRole: string;
  tab: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* سایدبار دسکتاپ */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-l border-slate-200 bg-white lg:flex">
        <div className="flex items-center gap-2.5 border-b border-slate-100 p-5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-bl from-primary-500 to-primary-700 text-white">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div className="leading-none">
            <p className="text-sm font-extrabold text-ink">پنل مدیریت</p>
            <p className="mt-1 text-[10px] text-slate-400">
              {adminName} • {adminRole === "superadmin" ? "مدیرکل" : "مدیر"}
            </p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {TABS.map((t) => {
            const active = tab === t.key;
            const Icon = t.icon;
            return (
              <Link
                key={t.key}
                href={`/admin/dashboard?tab=${t.key}`}
                className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary-50 text-primary-700 ring-1 ring-primary-100"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {t.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-100 p-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50"
          >
            <LayoutDashboard className="h-4 w-4" />
            مشاهده سایت
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
          >
            <LogOut className="h-4 w-4" />
            خروج
          </button>
        </div>
      </aside>

      {/* محتوا */}
      <div className="min-w-0 flex-1">
        {/* هدر موبایل + تب‌های افقی */}
        <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-3 lg:hidden">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-bl from-primary-500 to-primary-700 text-white">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div className="leading-none">
                <p className="text-sm font-extrabold text-ink">پنل مدیریت</p>
                <p className="mt-0.5 text-[10px] text-slate-400">{adminName}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Link
                href="/"
                className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                سایت
              </Link>
              <button
                type="button"
                onClick={logout}
                className="cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50"
              >
                خروج
              </button>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:hidden">
            {TABS.map((t) => {
              const active = tab === t.key;
              const Icon = t.icon;
              return (
                <Link
                  key={t.key}
                  href={`/admin/dashboard?tab=${t.key}`}
                  className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-bold transition-colors ${
                    active
                      ? "bg-ink text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <main className="p-4 pb-16 sm:p-6 lg:p-8" data-path={pathname}>
          {children}
        </main>
      </div>
    </div>
  );
}
