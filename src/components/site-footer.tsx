import Link from "next/link";
import { Store, Phone, Mail, MapPin } from "lucide-react";
import { InstagramIcon, TelegramIcon } from "@/components/brand-icons";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white pb-20 md:pb-0">
      <div className="container-px mx-auto grid max-w-7xl gap-10 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-bl from-primary to-primary-700 text-white">
              <Store className="h-5 w-5" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-lg font-extrabold text-ink">کسب‌یاب</span>
              <span className="text-[10px] text-slate-500">مرجع معرفی کسب‌وکار</span>
            </span>
          </Link>
          <p className="max-w-xs text-sm leading-7 text-slate-500">
            کسب‌یاب بستری شفاف و سریع برای معرفی، جست‌وجو و ارتباط با کسب‌وکارهای
            معتبر سراسر کشور است.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="#"
              aria-label="اینستاگرام"
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:border-primary hover:text-primary"
            >
              <InstagramIcon className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="تلگرام"
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:border-primary hover:text-primary"
            >
              <TelegramIcon className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-bold text-ink">دسترسی سریع</h4>
          <ul className="space-y-3 text-sm text-slate-500">
            <li><Link href="/" className="transition-colors hover:text-primary-700">خانه</Link></li>
            <li><Link href="/search" className="transition-colors hover:text-primary-700">جست‌وجوی کسب‌وکار</Link></li>
            <li><Link href="/designers" className="transition-colors hover:text-primary-700">طراحان کارت‌ویزیت</Link></li>
            <li><Link href="/blog" className="transition-colors hover:text-primary-700">بلاگ</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-bold text-ink">برای صاحبان کسب‌وکار</h4>
          <ul className="space-y-3 text-sm text-slate-500">
            <li><Link href="/owner" className="transition-colors hover:text-primary-700">ورود / ثبت‌نام</Link></li>
            <li><Link href="/owner/dashboard" className="transition-colors hover:text-primary-700">پنل مدیریت</Link></li>
            <li><Link href="/#pricing" className="transition-colors hover:text-primary-700">طرح‌های اشتراک</Link></li>
            <li><Link href="/#how" className="transition-colors hover:text-primary-700">راهنمای شروع</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-bold text-ink">تماس با ما</h4>
          <ul className="space-y-3 text-sm text-slate-500">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" /> ۰۲۱-۹۱۰۰۰۰۰۰
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" /> info@kasbyab.ir
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> تهران، خیابان ولیعصر
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-100">
        <div className="container-px mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 py-5 text-xs text-slate-400 sm:flex-row">
          <p>
            © {new Intl.DateTimeFormat("fa-IR-u-ca-persian", { year: "numeric" }).format(new Date())}{" "}
            کسب‌یاب — تمامی حقوق محفوظ است.
          </p>
          <p className="text-center">
            اطلاعات نمایش‌داده‌شده بر اساس اظهار کسب‌وکارهاست و تأیید کاملِ کسب‌یاب
            محسوب نمی‌شود.
          </p>
        </div>
      </div>
    </footer>
  );
}
