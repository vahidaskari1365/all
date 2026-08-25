"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { ActionResult } from "@/lib/admin-actions";
import { toFa } from "@/lib/utils";

/** دکمه‌ای که اکشن سرور را با حالت در انتظار اجرا می‌کند */
export function ActionButton({
  action,
  children,
  className = "",
  confirmText,
  disabled,
}: {
  action: () => Promise<ActionResult>;
  children: React.ReactNode;
  className?: string;
  confirmText?: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run() {
    if (confirmText && !window.confirm(confirmText)) return;
    setError(null);
    start(async () => {
      const res = await action();
      if ("error" in res) setError(res.error);
      router.refresh();
    });
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={run}
        disabled={pending || disabled}
        className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 ${className}`}
      >
        {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {children}
      </button>
      {error && (
        <span className="text-[10px] font-medium leading-4 text-rose-600">
          {error}
        </span>
      )}
    </span>
  );
}

export function AdminBadge({
  tone = "slate",
  children,
}: {
  tone?: "slate" | "green" | "amber" | "rose" | "sky" | "violet" | "ink";
  children: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    slate: "bg-slate-100 text-slate-600 ring-slate-200",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    rose: "bg-rose-50 text-rose-700 ring-rose-200",
    sky: "bg-sky-50 text-sky-700 ring-sky-200",
    violet: "bg-violet-50 text-violet-700 ring-violet-200",
    ink: "bg-ink text-white ring-ink",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function AdminCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="card overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <h2 className="text-sm font-extrabold text-ink">{title}</h2>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function AdminTable({
  head,
  children,
}: {
  head: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-xl ring-1 ring-slate-200">
      <table className="w-full min-w-[640px] border-collapse bg-white text-right text-xs">
        <thead>
          <tr className="bg-slate-50 text-slate-500">
            {head.map((h) => (
              <th key={h} className="whitespace-nowrap px-4 py-3 font-bold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  );
}

export function Fa({ value }: { value: number | string }) {
  return <>{toFa(value)}</>;
}

export const STATUS_TONE: Record<string, "slate" | "green" | "amber" | "rose" | "sky" | "violet"> = {
  pending: "amber",
  active: "green",
  suspended: "rose",
  rejected: "rose",
  reviewing: "sky",
  resolved: "green",
  dismissed: "slate",
  expired: "slate",
  canceled: "rose",
  qualified: "green",
  paid: "violet",
};

export const STATUS_LABEL: Record<string, string> = {
  pending: "در انتظار تأیید",
  active: "فعال",
  suspended: "تعلیق‌شده",
  rejected: "ردشده",
  reviewing: "در حال بررسی",
  resolved: "رسیدگی‌شده",
  dismissed: "بسته‌شده",
  expired: "منقضی",
  canceled: "لغوشده",
  qualified: "واجد پورسانت",
  paid: "پرداخت‌شده",
};
