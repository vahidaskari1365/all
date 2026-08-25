"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Store, LogIn, UserPlus, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";

export default function OwnerAuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload =
        mode === "register"
          ? { name, phone, password }
          : { phone, password };
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (!res.ok) {
        setError(j.error ?? "خطایی رخ داد.");
        return;
      }
      if (mode === "register" && j.owner && j.owner.approved === false) {
        setError(
          "حساب شما با موفقیت ساخته شد؛ پس از تأیید مدیریت می‌توانید کسب‌وکار ثبت کنید. اکنون به پنل منتقل می‌شوید…"
        );
        setTimeout(() => {
          router.push("/owner/dashboard");
          router.refresh();
        }, 1400);
        return;
      }
      router.push("/owner/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-px mx-auto grid max-w-6xl gap-8 py-10 lg:grid-cols-2 lg:py-16">
      {/* معرفی پنل */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden flex-col justify-center lg:flex"
      >
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-xs font-bold text-primary-700 ring-1 ring-primary-100">
          <Sparkles className="h-3.5 w-3.5" />
          پنل صاحبان کسب‌وکار
        </span>
        <h1 className="mt-4 text-3xl font-black leading-tight text-ink">
          کسب‌وکار خود را در کسب‌یاب <span className="text-gradient">مدیریت کنید</span>
        </h1>
        <p className="mt-3 max-w-md text-sm leading-7 text-slate-600">
          پس از ثبت‌نام و دریافت تأییدیه، پنل اختصاصی برای معرفی کسب‌وکار، مدیریت
          ویترین، قیمت‌ها، اطلاعات تماس و شبکه‌های اجتماعی در اختیار شماست.
        </p>
        <ul className="mt-6 space-y-3">
          {[
            "ایجاد طرح معرفی حرفه‌ای با عکس و توضیحات",
            "مدیریت ویترین محصولات و قیمت‌ها",
            "ثبت نشان‌های جواز، اتحادیه و ضمانت",
            "دسترسی به اطلاعات تماس و مسیریابی",
          ].map((t) => (
            <li key={t} className="flex items-center gap-2 text-sm text-slate-700">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              {t}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* فرم */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="card mx-auto w-full max-w-md p-6 sm:p-8"
      >
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-bl from-primary to-primary-700 text-white shadow-lg">
            <Store className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-lg font-black text-ink">
              {mode === "login" ? "ورود به پنل" : "ساخت حساب جدید"}
            </h2>
            <p className="text-xs text-slate-500">مدیریت کسب‌وکارهای شما</p>
          </div>
        </div>

        {/* سوییچ حالت */}
        <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => { setMode("login"); setError(null); }}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-bold transition-all ${
              mode === "login" ? "bg-white text-primary-700 shadow-sm" : "text-slate-500"
            }`}
          >
            <LogIn className="h-4 w-4" /> ورود
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); setError(null); }}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-bold transition-all ${
              mode === "register" ? "bg-white text-primary-700 shadow-sm" : "text-slate-500"
            }`}
          >
            <UserPlus className="h-4 w-4" /> ثبت‌نام
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "register" && (
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-600">نام و نام خانوادگی</span>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="نام کامل شما"
              />
            </label>
          )}
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-600">شماره موبایل</span>
            <input
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09123456789"
              inputMode="tel"
              dir="ltr"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-600">رمز عبور</span>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="حداقل ۶ کاراکتر"
              dir="ltr"
            />
          </label>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 ring-1 ring-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary-600/25 transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {loading ? "لطفاً صبر کنید…" : mode === "login" ? "ورود به پنل" : "ایجاد حساب"}
          </button>
        </form>

        {/* حساب نمونه */}
        <div className="mt-5 rounded-xl bg-slate-50 p-3 text-center ring-1 ring-slate-200">
          <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            حساب نمونه برای آزمایش: ۰۹۱۲۰۰۰۰۰۰۰ — رمز: ۱۲۳۴۵۶
          </p>
        </div>

        <Link
          href="/"
          className="mt-5 block text-center text-xs font-medium text-slate-400 transition-colors hover:text-primary-700"
        >
          بازگشت به صفحه اصلی
        </Link>
      </motion.div>
    </div>
  );
}
