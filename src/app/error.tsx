"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app-error]", error);
  }, [error]);

  return (
    <div className="container-px mx-auto grid min-h-[60vh] max-w-md place-items-center py-20 text-center">
      <div>
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-amber-50 text-amber-600">
          <AlertTriangle className="h-8 w-8" />
        </span>
        <h1 className="mt-5 text-2xl font-black text-ink">
          خطایی رخ داد
        </h1>
        <p className="mt-2 text-sm leading-7 text-slate-500">
          مشکلی پیش آمد؛ لطفاً دوباره تلاش کنید. در صورت تکرار، موضوع را به
          تیم پشتیبانی اطلاع دهید.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.03]"
        >
          <RefreshCcw className="h-4 w-4" />
          تلاش دوباره
        </button>
      </div>
    </div>
  );
}
