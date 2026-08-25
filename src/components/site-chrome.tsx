"use client";

import { usePathname } from "next/navigation";
import { HeaderNav } from "@/components/header-nav";
import { SiteFooter } from "@/components/site-footer";
import { MobileNav } from "@/components/mobile-nav";
import { SupportChat } from "@/components/support-chat";

/**
 * قالب عمومی سایت: هدر/فوتر/منوی پایین فقط برای صفحات عمومی.
 * صفحات مدیریت (/admin) بدون این قالب و تمام‌صفحه رندر می‌شوند.
 */
export function SiteChrome({
  isAuthed,
  ownerName,
  children,
}: {
  isAuthed: boolean;
  ownerName?: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:right-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
      >
        پرش به محتوای اصلی
      </a>
      <HeaderNav isAuthed={isAuthed} ownerName={ownerName} />
      <main id="main" className="pb-20 md:pb-0">
        {children}
      </main>
      <SiteFooter />
      <MobileNav />
      <SupportChat />
    </div>
  );
}
