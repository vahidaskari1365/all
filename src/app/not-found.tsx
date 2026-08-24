import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-px mx-auto grid min-h-[60vh] max-w-md place-items-center py-20 text-center">
      <div>
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary-50 text-primary-700">
          <Compass className="h-8 w-8" />
        </span>
        <h1 className="mt-5 text-2xl font-black text-ink">صفحه یا کسب‌وکار یافت نشد</h1>
        <p className="mt-2 text-sm leading-7 text-slate-500">
          ممکن است این آدرس اشتباه باشد یا کسب‌وکار دیگر فعال نباشد.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.03]"
        >
          بازگشت به خانه
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
