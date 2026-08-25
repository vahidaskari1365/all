import { ExternalLink, MapPin, Navigation } from "lucide-react";

export function LocationMap({
  name,
  lat,
  lng,
  address,
}: {
  name: string;
  lat: string | null;
  lng: string | null;
  address: string | null;
}) {
  const hasCoordinates = Boolean(lat && lng);
  const query = hasCoordinates ? `${lat},${lng}` : address ?? name;
  const googleUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  // قاب نقشه‌ی OpenStreetMap بدون کلید API؛ لینک بالا همیشه برای مسیریابی دقیق
  // و اپلیکیشن‌های موبایل در دسترس است.
  const embedUrl = hasCoordinates
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${Number(lng) - 0.08}%2C${Number(lat) - 0.06}%2C${Number(lng) + 0.08}%2C${Number(lat) + 0.06}&layer=mapnik&marker=${lat}%2C${lng}`
    : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-700">
            <MapPin className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-extrabold text-ink">موقعیت روی نقشه</p>
            <p className="truncate text-[11px] text-slate-400">{address ?? "موقعیت اعلام‌شده کسب‌وکار"}</p>
          </div>
        </div>
        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-accent-50 px-3 py-2 text-[11px] font-bold text-accent-700 ring-1 ring-accent-100 transition-colors hover:bg-accent-100"
        >
          <Navigation className="h-3.5 w-3.5" />
          مسیریابی
        </a>
      </div>
      {embedUrl ? (
        <iframe
          title={`موقعیت ${name} روی نقشه`}
          src={embedUrl}
          loading="lazy"
          className="h-64 w-full border-0 sm:h-72"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className="flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center">
          <MapPin className="h-8 w-8 text-slate-300" />
          <p className="mt-3 text-xs leading-6 text-slate-500">
            مختصات دقیق هنوز ثبت نشده است؛ برای دیدن آدرس در نقشه روی دکمه مسیریابی بزنید.
          </p>
        </div>
      )}
      <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-2.5 text-[10px] text-slate-400">
        <span>{hasCoordinates ? "مختصات اعلام‌شده توسط کسب‌وکار" : "آدرس اعلام‌شده توسط کسب‌وکار"}</span>
        <a href={googleUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold text-primary-700 hover:underline">
          باز کردن نقشه
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
