import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const admin = await getCurrentAdmin();
  if (admin) redirect("/admin/dashboard");

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-4 py-10">
      <div className="bg-dots absolute inset-0 opacity-[0.06]" />
      <div className="blob right-[-6rem] top-[-4rem] h-72 w-72 bg-primary-500/30" />
      <div className="blob bottom-[-6rem] left-[-4rem] h-72 w-72 bg-accent-500/20" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-white"
            aria-label="بازگشت به سایت"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-bl from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-500/30">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M3 9l1.5-5h15L21 9" />
                <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <path d="M9 21V11h6v10" />
              </svg>
            </span>
            <span className="flex flex-col items-start leading-none">
              <span className="text-xl font-extrabold">کسب‌یاب</span>
              <span className="mt-1 text-[11px] text-slate-400">
                پنل مدیریت مرکزی
              </span>
            </span>
          </Link>
        </div>

        <div className="card p-6 sm:p-8">
          <h1 className="text-xl font-black text-ink">ورود مدیریت</h1>
          <p className="mt-1.5 text-xs leading-6 text-slate-500">
            دسترسی فقط برای مدیران مجاز سامانه است. همه ورودها و تغییرات ثبت
            می‌شوند.
          </p>
          <AdminLoginForm />
        </div>

        {process.env.NODE_ENV !== "production" ? (
          <p className="mt-6 text-center text-[11px] leading-6 text-slate-500">
            برای ورود آزمایشی (دمو):
            <span dir="ltr" className="mx-1 rounded bg-white/10 px-2 py-0.5 font-mono text-slate-300">
              admin@kasbyab.ir
            </span>
            /
            <span dir="ltr" className="mx-1 rounded bg-white/10 px-2 py-0.5 font-mono text-slate-300">
              Admin@1234
            </span>
          </p>
        ) : (
          <p className="mt-6 text-center text-[11px] leading-6 text-slate-500">
            برای امنیت، ایمیل و رمز مدیر از متغیرهای محیطی ADMIN_EMAIL و ADMIN_PASSWORD خوانده می‌شود.
          </p>
        )}
      </div>
    </div>
  );
}
