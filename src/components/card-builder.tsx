"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import html2canvas from "html2canvas";
import QRCode from "qrcode";
import {
  CreditCard,
  Download,
  Loader2,
  MapPin,
  Phone,
  X,
  Globe,
} from "lucide-react";
import { InstagramIcon } from "@/components/brand-icons";
import { initials, toFa } from "@/lib/utils";
import type { BusinessWithMeta } from "@/lib/queries";

type Template = "classic" | "minimal" | "gradient";
type FontSize = "sm" | "md" | "lg";

const ACCENTS = [
  { id: "emerald", value: "#059669", label: "سبز" },
  { id: "teal", value: "#0d9488", label: "فیروزه‌ای" },
  { id: "ink", value: "#0f172a", label: "مشکی" },
  { id: "violet", value: "#7c3aed", label: "بنفش" },
  { id: "amber", value: "#d97706", label: "کهربایی" },
  { id: "rose", value: "#e11d48", label: "قرمز" },
];

const FONT_SCALES: Record<FontSize, { name: number; tagline: number; body: number }> = {
  sm: { name: 30, tagline: 15, body: 12.5 },
  md: { name: 36, tagline: 17, body: 14 },
  lg: { name: 42, tagline: 19, body: 15.5 },
};

export function CardBuilder({
  business,
  open,
  onClose,
}: {
  business: BusinessWithMeta;
  open: boolean;
  onClose: () => void;
}) {
  const [template, setTemplate] = useState<Template>("classic");
  const [accent, setAccent] = useState(ACCENTS[0].value);
  const [fontSize, setFontSize] = useState<FontSize>("md");
  const [qr, setQr] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kasbyab.ir";
  const businessUrl = `${siteUrl.replace(/\/$/, "")}/business/${business.slug}`;

  useEffect(() => {
    if (!open) return;
    QRCode.toDataURL(businessUrl, {
      width: 240,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#0f172a", light: "#ffffff" },
    })
      .then(setQr)
      .catch(() => setQr(null));
  }, [open, businessUrl]);

  async function download() {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `kasbyab-card-${business.slug}.png`;
      a.click();
    } finally {
      setDownloading(false);
    }
  }

  const scale = FONT_SCALES[fontSize];
  const isDark = template === "gradient";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-ink/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="my-6 w-full max-w-4xl rounded-3xl bg-white shadow-2xl"
            initial={{ y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 32, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* هدر */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <h2 className="flex items-center gap-2 text-base font-black text-ink">
                <CreditCard className="h-5 w-5 text-primary" />
                کارت‌ویزیت‌ساز {business.name}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="grid h-10 w-10 cursor-pointer place-items-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100"
                aria-label="بستن"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-6 p-5 lg:grid-cols-[280px_1fr]">
              {/* کنترل‌ها */}
              <div className="space-y-5">
                <div>
                  <p className="mb-2 text-xs font-bold text-slate-600">قالب کارت</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: "classic", label: "کلاسیک" },
                        { id: "minimal", label: "مینیمال" },
                        { id: "gradient", label: "فاخر" },
                      ] as { id: Template; label: string }[]
                    ).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTemplate(t.id)}
                        className={`cursor-pointer rounded-xl border px-2 py-3 text-xs font-bold transition-all ${
                          template === t.id
                            ? "border-primary bg-primary-50 text-primary-700"
                            : "border-slate-200 text-slate-500 hover:border-slate-300"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-bold text-slate-600">رنگ زمینه</p>
                  <div className="flex flex-wrap gap-2">
                    {ACCENTS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setAccent(c.value)}
                        title={c.label}
                        aria-label={c.label}
                        className={`h-9 w-9 cursor-pointer rounded-full ring-2 ring-offset-2 transition-transform hover:scale-110 ${
                          accent === c.value ? "ring-slate-400" : "ring-transparent"
                        }`}
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-bold text-slate-600">اندازه متن</p>
                  <div className="flex rounded-xl bg-slate-100 p-1">
                    {(
                      [
                        { id: "sm", label: "کوچک" },
                        { id: "md", label: "متوسط" },
                        { id: "lg", label: "بزرگ" },
                      ] as { id: FontSize; label: string }[]
                    ).map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFontSize(f.id)}
                        className={`flex-1 cursor-pointer rounded-lg px-2 py-2 text-xs font-bold transition-colors ${
                          fontSize === f.id
                            ? "bg-white text-ink shadow-sm"
                            : "text-slate-500"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={download}
                  disabled={downloading}
                  className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-primary-600/25 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                >
                  {downloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  دانلود کارت (PNG)
                </button>
                <p className="text-center text-[11px] leading-5 text-slate-400">
                  اطلاعات کارت به‌صورت خودکار از پروفایل کسب‌وکار شما پر شده است.
                </p>
              </div>

              {/* پیش‌نمایش */}
              <div className="min-w-0">
                <div className="overflow-x-auto rounded-2xl bg-slate-100 p-4">
                  <div
                    ref={cardRef}
                    dir="rtl"
                    className="relative mx-auto flex aspect-[1.72/1] w-[560px] max-w-none shrink-0 overflow-hidden font-sans"
                    style={{
                      background:
                        template === "gradient"
                          ? `linear-gradient(135deg, ${accent} 0%, #134e4a 100%)`
                          : template === "minimal"
                            ? "#ffffff"
                            : "linear-gradient(180deg, #ffffff 0%, #f0fdfa 100%)",
                      border:
                        template === "minimal"
                          ? `2px solid ${accent}`
                          : "1px solid #e2e8f0",
                    }}
                  >
                    {/* نوار کناری */}
                    <div
                      className="flex w-[42%] flex-col items-center justify-center gap-2 p-6 text-center"
                      style={{
                        background:
                          template === "minimal"
                            ? "transparent"
                            : template === "gradient"
                              ? "rgba(255,255,255,0.08)"
                              : "rgba(5,150,105,0.05)",
                      }}
                    >
                      <span
                        className="grid h-20 w-20 place-items-center rounded-2xl text-xl font-black text-white shadow-lg"
                        style={{ background: accent }}
                      >
                        {initials(business.name)}
                      </span>
                      <p
                        className="font-black leading-snug"
                        style={{
                          color: isDark ? "#ffffff" : "#0f172a",
                          fontSize: scale.name,
                        }}
                      >
                        {business.name}
                      </p>
                      {business.tagline && (
                        <p
                          className="leading-snug"
                          style={{
                            color: isDark ? "rgba(255,255,255,0.8)" : "#475569",
                            fontSize: scale.tagline,
                          }}
                        >
                          {business.tagline}
                        </p>
                      )}
                      {business.city && (
                        <p
                          className="flex items-center justify-center gap-1 leading-snug"
                          style={{
                            color: isDark ? "rgba(255,255,255,0.7)" : "#64748b",
                            fontSize: scale.body,
                          }}
                        >
                          <MapPin style={{ width: scale.body + 4, height: scale.body + 4 }} />
                          {business.city.name}
                        </p>
                      )}
                    </div>

                    {/* اطلاعات تماس */}
                    <div className="flex flex-1 flex-col justify-center gap-2.5 p-6">
                      {business.phone && (
                        <p
                          className="flex items-center gap-2 font-bold leading-snug"
                          dir="ltr"
                          style={{
                            color: isDark ? "#ffffff" : "#0f172a",
                            fontSize: scale.body + 2,
                          }}
                        >
                          <Phone style={{ width: scale.body + 2, height: scale.body + 2 }} />
                          <span style={{ textAlign: "left" }}>{toFa(business.phone)}</span>
                        </p>
                      )}
                      {business.address && (
                        <p
                          className="leading-snug"
                          style={{
                            color: isDark ? "rgba(255,255,255,0.8)" : "#475569",
                            fontSize: scale.body,
                          }}
                        >
                          {business.address}
                        </p>
                      )}
                      {business.instagram && (
                        <p
                          className="flex items-center gap-2 leading-snug"
                          dir="ltr"
                          style={{
                            color: isDark ? "rgba(255,255,255,0.85)" : "#475569",
                            fontSize: scale.body,
                          }}
                        >
                          <InstagramIcon style={{ width: scale.body + 2, height: scale.body + 2 }} />
                          <span style={{ textAlign: "left" }}>{business.instagram}</span>
                        </p>
                      )}
                      <p
                        className="flex items-center gap-2 leading-snug"
                        dir="ltr"
                        style={{
                          color: isDark ? "rgba(255,255,255,0.85)" : "#475569",
                          fontSize: scale.body,
                        }}
                      >
                        <Globe style={{ width: scale.body + 2, height: scale.body + 2 }} />
                        <span style={{ textAlign: "left" }}>{businessUrl.replace(/^https?:\/\//, "")}</span>
                      </p>
                    </div>

                    {/* QR */}
                    <div className="absolute bottom-3 left-3 rounded-lg bg-white p-1.5 shadow-md">
                      {qr && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={qr} alt="QR" className="h-20 w-20" />
                      )}
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-center text-[11px] text-slate-400">
                  پیش‌نمایش واقعی — نسخه دانلودی با کیفیت چاپ (۲x) ذخیره می‌شود.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
