import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: {
    default: "کسب‌یاب | مرجع معرفی و جست‌وجوی کسب‌وکار",
    template: "%s | کسب‌یاب",
  },
  description:
    "کسب‌یاب پلتفرم شفاف و سریع برای جست‌وجوی کسب‌وکارها بر اساس شهر و نوع خدمت؛ معرفی، تماس، مسیریابی، شبکه‌های اجتماعی و ویترین حرفه‌ای.",
  keywords: [
    "معرفی کسب و کار",
    "جستجوی کسب و کار",
    "دایرکتوری مشاغل",
    "کسب و کار",
    "ویترین کسب و کار",
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:right-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
        >
          پرش به محتوای اصلی
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
