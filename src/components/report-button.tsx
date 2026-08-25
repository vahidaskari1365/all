"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { ReportModal } from "@/components/report-modal";

/** دکمه گزارش برای دسکتاپ (در موبایل از نوار پایین استفاده می‌شود) */
export function ReportButton({
  businessId,
  businessName,
}: {
  businessId: number;
  businessName: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
      >
        <Flag className="h-4 w-4" />
        گزارش اطلاعات نادرست
      </button>
      <ReportModal
        businessId={businessId}
        businessName={businessName}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
