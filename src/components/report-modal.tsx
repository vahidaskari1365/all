"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flag, Loader2, Send, X, CheckCircle2 } from "lucide-react";

const CATEGORIES = [
  { value: "wrong-info", label: "اطلاعات نادرست" },
  { value: "closed", label: "کسب‌وکار تعطیل شده" },
  { value: "duplicate", label: "کسب‌وکار تکراری" },
  { value: "other", label: "سایر موارد" },
];

export function ReportModal({
  businessId,
  businessName,
  open,
  onClose,
}: {
  businessId: number;
  businessName: string;
  open: boolean;
  onClose: () => void;
}) {
  const [category, setCategory] = useState("wrong-info");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function handleClose() {
    onClose();
    // پاک‌سازی فرم برای بازشدن بعدی (بدون setState در effect)
    setDone(false);
    setError(null);
    setMessage("");
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ businessId, category, message, reporterName: name, reporterPhone: phone }),
      });
      const j = await res.json();
      if (!res.ok) {
        setError(j.error ?? "خطایی رخ داد.");
        return;
      }
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="گزارش اطلاعات نادرست"
            className="relative w-full max-w-md rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <button
              type="button"
              onClick={handleClose}
              className="absolute left-4 top-4 grid h-10 w-10 cursor-pointer place-items-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100"
              aria-label="بستن"
            >
              <X className="h-5 w-5" />
            </button>

            {done ? (
              <div className="py-8 text-center">
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8" />
                </span>
                <h3 className="mt-4 text-lg font-black text-ink">
                  گزارش شما ثبت شد
                </h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-7 text-slate-500">
                  با تشکر از دقت شما؛ تیم کسب‌یاب گزارش را بررسی خواهد کرد.
                </p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="mt-5 cursor-pointer rounded-xl bg-ink px-6 py-3 text-sm font-bold text-white"
                >
                  بستن
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2.5">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-rose-50 text-rose-600">
                    <Flag className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-black text-ink">
                      گزارش اطلاعات نادرست
                    </h3>
                    <p className="text-xs text-slate-400">{businessName}</p>
                  </div>
                </div>

                <form onSubmit={submit} className="mt-5 space-y-4">
                  <fieldset>
                    <legend className="mb-2 text-xs font-bold text-slate-600">
                      موضوع گزارش
                    </legend>
                    <div className="grid grid-cols-2 gap-2">
                      {CATEGORIES.map((c) => (
                        <label
                          key={c.value}
                          className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-3 text-xs font-bold transition-colors ${
                            category === c.value
                              ? "border-primary bg-primary-50 text-primary-700"
                              : "border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="category"
                            value={c.value}
                            checked={category === c.value}
                            onChange={() => setCategory(c.value)}
                            className="sr-only"
                          />
                          {c.label}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold text-slate-600">
                      توضیح گزارش <span className="text-rose-500">*</span>
                    </span>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      minLength={5}
                      required
                      className="input resize-none leading-7"
                      placeholder="مثلاً: شماره تماس درج‌شده پاسخگو نیست…"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <label>
                      <span className="mb-1.5 block text-xs font-bold text-slate-600">
                        نام شما (اختیاری)
                      </span>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input"
                        placeholder="نام و نام خانوادگی"
                      />
                    </label>
                    <label>
                      <span className="mb-1.5 block text-xs font-bold text-slate-600">
                        موبایل (اختیاری)
                      </span>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="input"
                        dir="ltr"
                        inputMode="tel"
                        placeholder="0912…"
                      />
                    </label>
                  </div>

                  {error && (
                    <p
                      role="alert"
                      className="rounded-xl bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700 ring-1 ring-rose-200"
                    >
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-bold text-white shadow-lg shadow-rose-600/25 transition-transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    ثبت گزارش
                  </button>
                  <p className="text-center text-[11px] leading-5 text-slate-400">
                    گزارش‌ها محرمانه بررسی می‌شوند و برای تیم مدیریت ارسال
                    می‌شوند.
                  </p>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
