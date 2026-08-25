"use client";

import { useState } from "react";
import Link from "next/link";
import { Flag, Send } from "lucide-react";
import { ActionButton, AdminBadge, AdminTable, STATUS_LABEL, STATUS_TONE } from "@/components/admin/ui";
import { setReportStatus } from "@/lib/admin-actions";
import { toFa } from "@/lib/utils";
import type { getAdminReports } from "@/lib/admin-queries";

type ReportRow = Awaited<ReturnType<typeof getAdminReports>>[number];

const REPORT_CATEGORY_LABEL: Record<string, string> = {
  "wrong-info": "اطلاعات نادرست",
  closed: "تعطیل شده",
  duplicate: "کسب‌وکار تکراری",
  other: "سایر موارد",
};

function ReportActions({ report }: { report: ReportRow }) {
  const [note, setNote] = useState(report.adminNote ?? "");
  const [showNote, setShowNote] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {report.status === "pending" && (
        <ActionButton
          className="bg-emerald-600 text-white hover:bg-emerald-700"
          action={() => setReportStatus(report.id, "resolved", note || undefined)}
        >
          رسیدگی شد
        </ActionButton>
      )}
      {report.status === "pending" && (
        <ActionButton
          className="bg-sky-100 text-sky-700 hover:bg-sky-200"
          action={() => setReportStatus(report.id, "reviewing", note || undefined)}
        >
          در حال بررسی
        </ActionButton>
      )}
      {(report.status === "pending" || report.status === "reviewing") && (
        <ActionButton
          className="bg-slate-100 text-slate-600 hover:bg-slate-200"
          action={() => setReportStatus(report.id, "dismissed", note || undefined)}
        >
          بستن
        </ActionButton>
      )}
      <button
        type="button"
        onClick={() => setShowNote(!showNote)}
        className="cursor-pointer rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200"
      >
        {showNote ? "بستن یادداشت" : "یادداشت مدیریت"}
      </button>
      {showNote && (
        <div className="flex w-full items-center gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="input flex-1"
            placeholder="یادداشت داخلی…"
          />
          <ActionButton
            className="bg-ink text-white hover:bg-slate-800"
            action={() => setReportStatus(report.id, report.status, note || undefined)}
          >
            <Send className="h-3.5 w-3.5" />
            ثبت
          </ActionButton>
        </div>
      )}
    </div>
  );
}

export function ReportsTab({ reports }: { reports: ReportRow[] }) {
  return (
    <div className="space-y-5">
      <AdminTable
        head={["کسب‌وکار", "نوع گزارش", "توضیح", "گزارش‌دهنده", "وضعیت", "تاریخ", "عملیات"]}
      >
        {reports.map((r) => (
          <tr key={r.id} className="align-top hover:bg-slate-50/60">
            <td className="px-4 py-3">
              {r.business ? (
                <Link
                  href={`/business/${r.business.slug}`}
                  className="font-bold text-ink hover:text-primary-700 hover:underline"
                >
                  {r.business.name}
                </Link>
              ) : (
                <span className="text-slate-400">—</span>
              )}
            </td>
            <td className="whitespace-nowrap px-4 py-3">
              <span className="inline-flex items-center gap-1 text-slate-600">
                <Flag className="h-3.5 w-3.5 text-rose-500" />
                {REPORT_CATEGORY_LABEL[r.category] ?? r.category}
              </span>
            </td>
            <td className="max-w-[260px] px-4 py-3 leading-6 text-slate-600">
              {r.message}
              {r.adminNote && (
                <p className="mt-1 rounded-lg bg-amber-50 px-2 py-1 text-[11px] text-amber-700">
                  یادداشت: {r.adminNote}
                </p>
              )}
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-slate-500">
              {r.reporterName ?? "ناشناس"}
              {r.reporterPhone && (
                <p dir="ltr" className="mt-0.5 text-[10px]">
                  {r.reporterPhone}
                </p>
              )}
            </td>
            <td className="px-4 py-3">
              <AdminBadge tone={STATUS_TONE[r.status] ?? "slate"}>
                {STATUS_LABEL[r.status] ?? r.status}
              </AdminBadge>
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-slate-500">
              {toFa(new Date(r.createdAt).toLocaleDateString("fa-IR"))}
            </td>
            <td className="px-4 py-3">
              <ReportActions report={r} />
            </td>
          </tr>
        ))}
      </AdminTable>
      {reports.length === 0 && (
        <p className="rounded-xl bg-white p-8 text-center text-sm text-slate-400 ring-1 ring-slate-200">
          گزارشی ثبت نشده است.
        </p>
      )}
    </div>
  );
}
