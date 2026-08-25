"use client";

import { useState } from "react";
import { ChevronDown, Clock3, Loader2, Phone, ShoppingBag } from "lucide-react";
import type { OrderRow } from "@/lib/queries";
import { formatPrice, toFa } from "@/lib/utils";

type Order = OrderRow;

const STATUS_OPTIONS = [
  { value: "pending", label: "در انتظار بررسی" },
  { value: "confirmed", label: "تأیید و آماده‌سازی" },
  { value: "completed", label: "تکمیل‌شده" },
  { value: "canceled", label: "لغوشده" },
] as const;

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  confirmed: "bg-sky-50 text-sky-700 ring-sky-200",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  canceled: "bg-rose-50 text-rose-700 ring-rose-200",
};

export function OwnerOrders({ initialOrders }: { initialOrders: Order[] }) {
  const [list, setList] = useState(initialOrders);
  const [open, setOpen] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function changeStatus(orderId: number, status: string) {
    setBusyId(orderId);
    setError(null);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const body = await response.json();
      if (!response.ok) {
        setError(body.error ?? "به‌روزرسانی سفارش انجام نشد.");
        return;
      }
      setList((current) =>
        current.map((order) =>
          order.id === orderId ? { ...order, status: body.order?.status ?? status, updatedAt: new Date() } : order
        )
      );
    } catch {
      setError("ارتباط با سامانه برقرار نشد.");
    } finally {
      setBusyId(null);
    }
  }

  const pendingCount = list.filter((order) => order.status === "pending").length;

  return (
    <section className="border-t border-slate-100">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 bg-white px-5 py-3.5 text-right transition-colors hover:bg-slate-50"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-bold text-ink">
          <ShoppingBag className="h-4 w-4 text-primary" />
          سفارش‌های این کسب‌وکار
          <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[11px] text-primary-700 ring-1 ring-primary-100">
            {toFa(list.length)} سفارش
          </span>
          {pendingCount > 0 && (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] text-amber-700 ring-1 ring-amber-200">
              {toFa(pendingCount)} جدید
            </span>
          )}
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="space-y-3 bg-slate-50/70 p-4 sm:p-5">
          {error && (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 ring-1 ring-rose-200">
              {error}
            </p>
          )}
          {list.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-xs text-slate-400">
              هنوز سفارشی برای این کسب‌وکار ثبت نشده است.
            </div>
          ) : (
            list.map((order) => {
              const statusLabel = STATUS_OPTIONS.find((option) => option.value === order.status)?.label ?? order.status;
              return (
                <article key={order.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-black text-primary-700" dir="ltr">
                          {order.orderNumber}
                        </span>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${STATUS_STYLES[order.status] ?? STATUS_STYLES.pending}`}>
                          {statusLabel}
                        </span>
                      </div>
                      <h4 className="mt-2 text-sm font-extrabold text-ink">{order.service}</h4>
                      <p className="mt-1 text-xs text-slate-500">
                        {order.customerName} · <a className="hover:text-primary-700" href={`tel:${order.customerPhone}`} dir="ltr">{order.customerPhone}</a>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <Clock3 className="h-3.5 w-3.5" />
                      {new Date(order.createdAt).toLocaleDateString("fa-IR")}
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                    {order.itemTitle && <p><span className="font-bold text-ink">محصول:</span> {order.itemTitle}</p>}
                    <p><span className="font-bold text-ink">تعداد:</span> {toFa(order.quantity)}</p>
                    {order.requestedDate && <p><span className="font-bold text-ink">تاریخ درخواستی:</span> {order.requestedDate}</p>}
                    {order.preferredTime && <p><span className="font-bold text-ink">زمان پیشنهادی:</span> {order.preferredTime}</p>}
                    {order.totalAmount !== null && <p><span className="font-bold text-ink">مبلغ تقریبی:</span> {formatPrice(order.totalAmount)} تومان</p>}
                    {order.deliveryAddress && <p className="sm:col-span-2"><span className="font-bold text-ink">آدرس:</span> {order.deliveryAddress}</p>}
                    {order.note && <p className="sm:col-span-2 rounded-lg bg-slate-50 p-2 leading-5"><span className="font-bold text-ink">یادداشت مشتری:</span> {order.note}</p>}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                    <label className="flex flex-1 items-center gap-2 text-[11px] font-bold text-slate-500 sm:flex-none">
                      تغییر وضعیت
                      <select
                        value={order.status}
                        onChange={(event) => changeStatus(order.id, event.target.value)}
                        disabled={busyId === order.id}
                        className="input min-w-44 py-2 text-xs"
                      >
                        {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                    </label>
                    {busyId === order.id && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                    {order.customerPhone && (
                      <a href={`tel:${order.customerPhone}`} className="inline-flex items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-2 text-xs font-bold text-primary-700 hover:bg-primary-100">
                        <Phone className="h-3.5 w-3.5" /> تماس با مشتری
                      </a>
                    )}
                    {order.status === "pending" && <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600"><Clock3 className="h-3 w-3" /> نیازمند پاسخ شما</span>}
                  </div>
                </article>
              );
            })
          )}
        </div>
      )}
    </section>
  );
}
