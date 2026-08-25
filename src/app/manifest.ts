import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "کسب‌یاب | مرجع معرفی و جست‌وجوی کسب‌وکار",
    short_name: "کسب‌یاب",
    description:
      "جست‌وجوی کسب‌وکارها بر اساس شهر و نوع خدمت؛ تماس، مسیریابی، QR اختصاصی و ویترین حرفه‌ای.",
    start_url: "/",
    display: "standalone",
    background_color: "#ecfdf5",
    theme_color: "#059669",
    dir: "rtl",
    lang: "fa",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
