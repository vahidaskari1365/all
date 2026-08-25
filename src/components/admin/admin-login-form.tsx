"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail, ShieldCheck, KeyRound, ArrowLeft } from "lucide-react";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [challenge, setChallenge] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          challenge
            ? { step: "verify", challenge, code: code.trim() }
            : { email: email.trim(), password }
        ),
      });
      const j = await res.json();
      if (!res.ok) {
        setError(j.error ?? "خطایی رخ داد.");
        return;
      }
      if (j.needTotp) {
        setChallenge(j.challenge);
        setCode("");
        return;
      }
      router.push("/admin/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      {challenge ? (
        <>
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            احراز دومرحله‌ای فعال است — کد ۶ رقمی اپلیکیشن تأیید خود را وارد کنید.
          </div>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-600">
              کد تأیید
            </span>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                dir="ltr"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="input h-12 pr-10 text-center font-mono text-lg tracking-[0.5em]"
                autoFocus
              />
            </div>
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-primary-600/25 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              تأیید و ورود
            </button>
            <button
              type="button"
              onClick={() => {
                setChallenge(null);
                setError(null);
              }}
              className="inline-flex h-12 items-center gap-1.5 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              بازگشت
            </button>
          </div>
        </>
      ) : (
        <>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-600">
              ایمیل
            </span>
            <div className="relative">
              <Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@kasbyab.ir"
                className="input h-12 pr-10 text-left"
                autoComplete="username"
                required
              />
            </div>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-slate-600">
              رمز عبور
            </span>
            <div className="relative">
              <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input h-12 pr-10 text-left"
                autoComplete="current-password"
                required
              />
            </div>
          </label>
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
            ورود به پنل
          </button>
        </>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-rose-50 px-4 py-3 text-xs font-medium leading-6 text-rose-700 ring-1 ring-rose-200"
        >
          {error}
        </p>
      )}
    </form>
  );
}
