import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { SiteChrome } from "@/components/site-chrome";
import { getCurrentOwner } from "@/lib/auth";

const SITE_NAME = "کسب‌یاب";
const SITE_DESC =
  "کسب‌یاب پلتفرم شفاف و سریع برای جست‌وجوی کسب‌وکارها بر اساس شهر و نوع خدمت؛ معرفی، تماس، مسیریابی، QR اختصاصی، شبکه‌های اجتماعی و ویترین حرفه‌ای.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://kasbyab.ir"
  ),
  title: {
    default: `${SITE_NAME} | مرجع معرفی و جست‌وجوی کسب‌وکار`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESC,
  keywords: [
    "معرفی کسب و کار",
    "جستجوی کسب و کار",
    "دایرکتوری مشاغل",
    "کسب و کار",
    "ویترین کسب و کار",
    "کارت ویزیت",
  ],
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | مرجع معرفی و جست‌وجوی کسب‌وکار`,
    description: SITE_DESC,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#059669",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const owner = await getCurrentOwner();

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
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <SiteChrome isAuthed={!!owner} ownerName={owner?.name}>
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
