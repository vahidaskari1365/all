"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import {
  ArrowRight,
  KeyRound,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import {
  confirmTotpSetup,
  disableMyTotp,
  issueTotpSetup,
} from "@/lib/admin-actions";

export default function AuthAdmin({
  adminName,
  adminEmail,
  totpEnabled,
}: {
  adminName: string;
  adminEmail: string;
  totpEnabled: boolean;
}) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(totpEnabled);
  const [busy, setBusy] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function startSetup() {
    setBusy(true);
    setError(null);
    try {
      const res = await issueTotpSetup();
      if ("error" in res) {
        setError(res.error);
        return;
      }
      const secretValue = res.secret!;
      setSecret(secretValue);
      const label = `KasbYab Admin (${adminEmail})`;
      const url = `otpauth://totp/${encodeURIComponent(label)}?secret=${secretValue}&issuer=${encodeURIComponent("KasbYab Admin")}&algorithm=SHA1&digits=6&period=30`;
      const dataUrl = await QRCode.toDataURL(url, {
        width: 220,
        margin: 1,
        color: { dark: "#064e3b", light: "#ffffff" },
      });
      setQrDataUrl(dataUrl);
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    if (!/^\d{6}$/.test(code)) {
      setError("کد ۶ رقمی را وارد کنید.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await confirmTotpSetup(code);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      setEnabled(true);
      setSecret(null);
      setQrDataUrl(null);
      setCode("");
      setDone("احراز دومرحله‌ای با موفقیت فعال شد.");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setError(null);
    try {
      const res = await disableMyTotp();
      if ("error" in res) {
        setError(res.error);
        return;
      }
      setEnabled(false);
      setDone("احراز دومرحله‌ای غیرفعال شد.");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container-px mx-auto max-w-xl py-10">
      <div className="card p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-50 text-primary-700">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-lg font-black text-ink">
              احراز هویت دومرحله‌ای
            </h1>
            <p className="mt-0.5 text-xs text-slate-400">
              {adminName} — {adminEmail}
            </p>
          </div>
        </div>

        <p className="mt-5 text-sm leading-7 text-slate-600">
          با فعال‌سازی این قابلیت، پس از رمز عبور یک کد ۶ رقمی از اپلیکیشن
          Google Authenticator (یا هر اپ سازگار با TOTP) از شما خواسته می‌شود.
        </p>

        {done && (
          <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
            {done}
          </p>
        )}
        {error && (
          <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
            {error}
          </p>
        )}

        {enabled ? (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 ring-1 ring-emerald-200">
              <ShieldCheck className="h-4 w-4" />
              احراز دومرحله‌ای برای حساب شما فعال است.
            </div>
            <button
              type="button"
              onClick={disable}
              disabled={busy}
              className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border border-rose-200 px-5 py-2.5 text-sm font-bold text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
              غیرفعال‌کردن
            </button>
          </div>
        ) : secret ? (
          <div className="mt-6 space-y-5">
            <div className="flex flex-col items-center gap-4 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200 sm:flex-row sm:items-start">
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt="کد QR فعال‌سازی"
                  className="h-44 w-44 rounded-xl bg-white p-2 ring-1 ring-slate-200"
                />
              ) : (
                <span className="grid h-44 w-44 place-items-center rounded-xl bg-white ring-1 ring-slate-200">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                </span>
              )}
              <div className="text-center sm:text-right">
                <p className="text-sm font-bold text-ink">۱) اپلیکیشن را نصب کنید</p>
                <p className="mt-1 text-xs leading-6 text-slate-500">
                  Google Authenticator یا Authy را نصب و QR را اسکن کنید. یا این
                  کلید را دستی وارد کنید:
                </p>
                <p
                  className="mt-2 inline-block rounded-lg bg-white px-3 py-1.5 font-mono text-sm font-bold tracking-wider text-primary-700 ring-1 ring-slate-200"
                  dir="ltr"
                >
                  {secret}
                </p>
                <p className="mt-4 text-sm font-bold text-ink">
                  ۲) کد ۶ رقمی را وارد کنید
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    inputMode="numeric"
                    dir="ltr"
                    placeholder="000000"
                    className="input max-w-[140px] text-center font-mono text-lg tracking-[0.3em]"
                  />
                  <button
                    type="button"
                    onClick={verify}
                    disabled={busy}
                    className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
                  >
                    {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                    تأیید و فعال‌سازی
                  </button>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSecret(null);
                setQrDataUrl(null);
                setCode("");
              }}
              className="text-xs font-medium text-slate-400 hover:text-slate-600"
            >
              انصراف
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={startSetup}
            disabled={busy}
            className="mt-6 inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary-600/25 transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            فعال‌سازی احراز دومرحله‌ای
          </button>
        )}

        <button
          type="button"
          onClick={() => router.push("/admin/dashboard")}
          className="mt-6 inline-flex cursor-pointer items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-ink"
        >
          <ArrowRight className="h-4 w-4" />
          بازگشت به پنل
        </button>
      </div>
    </div>
  );
}
