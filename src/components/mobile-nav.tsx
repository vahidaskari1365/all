"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, LayoutGrid, Palette, Store } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Item = {
  href: string;
  label: string;
  icon: LucideIcon;
  match: (path: string) => boolean;
};

const ITEMS: Item[] = [
  { href: "/", label: "خانه", icon: Home, match: (p) => p === "/" },
  {
    href: "/search",
    label: "جست‌وجو",
    icon: Search,
    match: (p) => p.startsWith("/search"),
  },
  {
    href: "/#categories",
    label: "دسته‌ها",
    icon: LayoutGrid,
    match: (p) => false,
  },
  { href: "/designers", label: "طراحان", icon: Palette, match: (p) => p.startsWith("/designers") },
  { href: "/owner", label: "پنل من", icon: Store, match: (p) => p.startsWith("/owner") },
];

export function MobileNav() {
  const pathname = usePathname();

  // در صفحات کسب‌وکار، نوار اکشن پایینِ خود صفحه فعال است
  const isBusinessPage = /^\/business\/[^/]+$/.test(pathname);
  if (isBusinessPage) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 backdrop-blur-lg md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="منوی اصلی"
    >
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {ITEMS.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-h-[60px] flex-col items-center justify-center gap-1 py-2 text-[11px] font-bold transition-colors ${
                active ? "text-primary-700" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <span
                className={`grid h-8 w-14 place-items-center rounded-full transition-colors ${
                  active ? "bg-primary-50" : ""
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              {item.label}
              {active && (
                <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
