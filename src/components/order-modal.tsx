"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, Loader2, ShoppingBag, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type OrderItem = {
  id: number;
  title: string;
  price: string | null;
  unit: string | null;
};

export function OrderButton({
  businessId,
  businessName,
  items,
  variant = "default",
}: {
  businessId: number;
  businessName: string;
  items: OrderItem[];
  variant?: "default" | "compact";
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          variant === "compact"
            ? "flex min-h-12 flex-1 items-center justify-center gap-1.5 rounded-xl bg-accent-600 px-3 text-xs font-bold text-white shadow-lg shadow-accent-600/20 transition-transform active:scale-[0.98]"
            : "inline-flex items-center gap-2 rounded-xl bg-accent-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-accent-600/25 transition-transform hover:scale-[1.03]"
        }
      >
        <ShoppingBag className="h-4 w-4" />
        ثبت سفارش
      </button>
      {open && (
        <OrderModal
          businessId={businessId}
          businessName={businessName}
          items={items}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function OrderModal({
  businessId,
  businessName,
  items,
  onClose,
}: {
  businessId: number;
  businessName: string;
  items: OrderItem[];
  onClose: () => void;
}) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [itemId, setItemId] = useState("");
  const [service, setService] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [requestedDate, setRequestedDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedItem = items.find((item) => String(item.id) === itemId);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [busy, onClose]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          businessId,
          itemId: itemId || undefined,
          customerName,
          customerPhone,
          customerEmail,
          service: service || selectedItem?.title,
          quantity: Number(quantity),
          requestedDate,
          preferredTime,
          deliveryAddress,
          note,
        }),
      });
      const body = await response.json();
      if (!response.ok) {
        setError(body.error ?? "ثبت سفارش انجام نشد.");
        return;
      }
      setSuccess(body.order?.orderNumber ?? "سفارش شما");
    } catch {
      setError("ارتباط با سامانه برقرار نشد. دوباره تلاش کنید.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-ink/55 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`ثبت سفارش برای ${businessName}`}
      onMouseDown={(event) => {
        if (event.currentTarget === event.target && !busy) onClose();
      }}
    >
      <div className="my-3 w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl sm:my-8">
        <div className="flex items-start justify-between gap-4 bg-gradient-to-l from-primary-800 to-primary-600 p-5 text-white sm:p-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold text-primary-50 ring-1 ring-inset ring-white/10">
              <ShoppingBag className="h-3.5 w-3.5" />
              درخواست مستقیم
            </span>
            <h2 className="mt-3 text-xl font-black">ثبت سفارش برای {businessName}</h2>
            <p className="mt-1 text-xs leading-6 text-primary-100/80">
              اطلاعات شما برای صاحب کسب‌وکار ارسال می‌شود تا با شما هماهنگ کند.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 transition-colors hover:bg-white/20 disabled:opacity-50"
            aria-label="بستن فرم سفارش"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="p-6 text-center sm:p-10">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/70">
              <CheckCircle2 className="h-8 w-8" />
            </span>
            <h3 className="mt-5 text-xl font-black text-ink">سفارش شما ثبت شد</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-500">
              صاحب کسب‌وکار درخواست شما را بررسی می‌کند و برای هماهنگی با شماره‌ای که وارد کرده‌اید تماس می‌گیرد.
            </p>
            <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-xl bg-primary-50 px-4 py-3 text-sm font-bold text-primary-700 ring-1 ring-primary-100">
              <span>کد پیگیری:</span>
              <span dir="ltr" className="font-mono">{success}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-xl bg-ink px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
            >
              بستن
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 p-5 sm:p-6">
            {error && (
              <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-xs font-medium leading-6 text-rose-700 ring-1 ring-rose-200">
                {error}
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="نام و نام خانوادگی *">
                <input className="input" value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="نام شما" required />
              </Field>
              <Field label="شماره موبایل *">
                <input className="input" value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} placeholder="09123456789" inputMode="tel" dir="ltr" required />
              </Field>
              <Field label="ایمیل (اختیاری)">
                <input className="input" type="email" value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} placeholder="you@example.com" dir="ltr" />
              </Field>
              <Field label="محصول یا خدمت *">
                {items.length > 0 ? (
                  <select className="input" value={itemId} onChange={(event) => { setItemId(event.target.value); const item = items.find((value) => String(value.id) === event.target.value); if (item) setService(item.title); }}>
                    <option value="">انتخاب محصول یا درخواست عمومی</option>
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title}{item.price ? ` — ${formatPrice(item.price)} تومان` : ""}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input className="input" value={service} onChange={(event) => setService(event.target.value)} placeholder="مثلاً رزرو وقت مشاوره" required />
                )}
              </Field>
            </div>

            {items.length > 0 && (
              <Field label={itemId ? "توضیح درخواست (اختیاری)" : "خدمت یا درخواست *"}>
                <input
                  className="input"
                  value={service}
                  onChange={(event) => setService(event.target.value)}
                  placeholder={itemId ? "مثلاً رنگ‌بندی یا زمان تحویل" : "مثلاً رزرو وقت مشاوره"}
                  required={!itemId}
                />
              </Field>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="تعداد">
                <input className="input" type="number" min="1" max="99" value={quantity} onChange={(event) => setQuantity(event.target.value)} inputMode="numeric" dir="ltr" />
              </Field>
              <Field label="تاریخ پیشنهادی (اختیاری)">
                <input className="input" value={requestedDate} onChange={(event) => setRequestedDate(event.target.value)} placeholder="مثلاً ۱۴۰۵/۰۱/۲۰" />
              </Field>
              <Field label="ساعت پیشنهادی">
                <input className="input" value={preferredTime} onChange={(event) => setPreferredTime(event.target.value)} placeholder="مثلاً ۱۷:۳۰" />
              </Field>
            </div>

            <Field label="آدرس یا توضیح محل (اختیاری)">
              <textarea className="input min-h-20" value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} placeholder="برای ارسال یا هماهنگی مراجعه…" />
            </Field>
            <Field label="توضیحات تکمیلی (اختیاری)">
              <textarea className="input min-h-20" value={note} onChange={(event) => setNote(event.target.value)} placeholder="هر توضیحی که صاحب کسب‌وکار باید بداند…" />
            </Field>

            <div className="flex items-start gap-2 rounded-xl bg-slate-50 px-3.5 py-3 text-[11px] leading-5 text-slate-500 ring-1 ring-slate-100">
              <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              این سفارش پرداخت آنلاین ندارد؛ پس از ثبت، هماهنگی و پرداخت احتمالی مستقیماً با کسب‌وکار انجام می‌شود.
            </div>
            <button type="submit" disabled={busy} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary-600/25 transition-transform hover:scale-[1.01] disabled:opacity-60">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
              {busy ? "در حال ثبت…" : "ثبت نهایی سفارش"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-600">{label}</span>
      {children}
    </label>
  );
}
