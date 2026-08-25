"use client";

import { useState } from "react";
import { Phone, Navigation, Flag } from "lucide-react";
import { ReportModal } from "@/components/report-modal";
import { OrderButton } from "@/components/order-modal";

/**
 * نوار اقدام پایین صفحه کسب‌وکار در موبایل —
 * تجربه‌ی «اپلیکیشن‌مانند»: تماس، مسیریابی و گزارش همیشه در دسترس.
 */
export function BusinessActionsBar({
  businessId,
  businessName,
  phone,
  mapsUrl,
  items = [],
}: {
  businessId: number;
  businessName: string;
  phone: string | null;
  mapsUrl: string;
  items?: { id: number; title: string; price: string | null; unit: string | null }[];
}) {
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <>
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 backdrop-blur-lg md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto flex max-w-lg items-stretch gap-2 p-2.5">
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            className="flex min-h-12 w-14 shrink-0 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl bg-slate-100 text-[10px] font-bold text-slate-600 transition-colors active:bg-slate-200"
          >
            <Flag className="h-5 w-5" />
            گزارش
          </button>
          <OrderButton
            businessId={businessId}
            businessName={businessName}
            items={items}
            variant="compact"
          />
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-primary-600/25 transition-transform active:scale-[0.98]"
            >
              <Phone className="h-4 w-4" />
              تماس
            </a>
          )}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-ink px-4 text-sm font-bold text-white transition-transform active:scale-[0.98]"
          >
            <Navigation className="h-4 w-4" />
            مسیریابی
          </a>
        </div>
      </div>
      <ReportModal
        businessId={businessId}
        businessName={businessName}
        open={reportOpen}
        onClose={() => setReportOpen(false)}
      />
    </>
  );
}
