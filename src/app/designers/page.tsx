import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Award, Megaphone, Sparkles, Star } from "lucide-react";
import { getPublicDesigners } from "@/lib/queries";
import { SectionHeading } from "@/components/section-heading";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { initials, toFa } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "طراحان کارت‌ویزیت",
  description:
    "معرفی طراحان حرفه‌ای کارت‌ویزیت کسب‌یاب؛ نمونه‌کارها، امتیاز و کد معرفی هر طراح.",
};

export default async function DesignersPage() {
  const designers = await getPublicDesigners();

  return (
    <div className="container-px mx-auto max-w-7xl py-10 sm:py-14">
      <SectionHeading
        eyebrow="جامعه طراحان"
        title="طراحان کارت‌ویزیت کسب‌یاب"
        desc="نمونه‌کارها پس از تأیید مدیریت منتشر می‌شوند و هر آپلود برای طراح امتیاز و رتبه می‌سازد."
      />

      {designers.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-slate-400">
            <Star className="h-8 w-8" />
          </span>
          <h2 className="mt-5 text-lg font-extrabold text-ink">
            هنوز طراح تأییدشده‌ای ثبت نشده است
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-500">
            به‌زودی اولین طراحان حرفه‌ای کارت‌ویزیت در این صفحه معرفی می‌شوند.
          </p>
        </div>
      ) : (
        <Stagger className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {designers.map((d) => (
            <StaggerItem key={d.id}>
              <article className="card card-hover flex h-full flex-col overflow-hidden">
                <div className="flex items-center gap-3 border-b border-slate-100 p-4">
                  <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-bl from-violet-500 to-violet-700 text-lg font-black text-white">
                    {d.avatarUrl ? (
                      <Image
                        src={d.avatarUrl}
                        alt={d.name}
                        width={56}
                        height={56}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials(d.name)
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-extrabold text-ink">
                      {d.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-400">
                      کد معرفی:{" "}
                      <span dir="ltr" className="font-mono font-bold text-primary-700">
                        {d.referralCode}
                      </span>
                    </p>
                  </div>
                  {d.featured && (
                    <span
                      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700 ring-1 ring-inset ring-amber-200"
                      title="طراح ویژه"
                    >
                      <Award className="h-3 w-3" />
                      ویژه
                    </span>
                  )}
                </div>

                {d.bio && (
                  <p className="line-clamp-2 px-4 pt-3 text-xs leading-6 text-slate-500">
                    {d.bio}
                  </p>
                )}

                {/* نمونه‌کارها */}
                <div className="grid grid-cols-4 gap-1.5 p-4">
                  {d.portfolios.length === 0 && (
                    <div className="col-span-4 grid h-20 place-items-center rounded-xl bg-slate-50 text-xs text-slate-400">
                      نمونه‌کاری ثبت نشده است
                    </div>
                  )}
                  {d.portfolios.slice(0, 4).map((p) => (
                    <div
                      key={p.id}
                      className="relative aspect-square overflow-hidden rounded-lg ring-1 ring-slate-100"
                      title={p.title}
                    >
                      {p.imageUrl ? (
                        <Image
                          src={p.imageUrl}
                          alt={p.title}
                          fill
                          sizes="120px"
                          className="object-cover transition-transform duration-500 hover:scale-110"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center bg-slate-100 text-slate-400">
                          <Sparkles className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-slate-100 px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-2.5 py-1.5 text-xs font-bold text-violet-700 ring-1 ring-inset ring-violet-100">
                    <Star className="h-3.5 w-3.5" />
                    {toFa(d.points)} امتیاز
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {toFa(d.portfolios.length)} نمونه‌کار تأییدشده
                  </span>
                </div>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      )}

      {/* دعوت طراحان */}
      <Reveal>
        <div className="relative mt-14 overflow-hidden rounded-3xl bg-gradient-to-bl from-violet-700 via-violet-600 to-violet-500 p-8 text-white sm:p-12">
          <div className="bg-dots absolute inset-0 opacity-10" />
          <div className="relative flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-violet-100 ring-1 ring-inset ring-white/10">
                <Megaphone className="h-3.5 w-3.5" />
                برای طراحان
              </span>
              <h2 className="mt-4 text-2xl font-black sm:text-3xl">
                طراح کارت‌ویزیت هستید؟
              </h2>
              <p className="mt-3 text-sm leading-7 text-violet-50">
                نمونه‌کارهای خود را در کسب‌یاب منتشر کنید، با هر آپلود امتیاز و
                رتبه بگیرید و از طریق کد معرفی اختصاصی، از اشتراک‌هایی که
                معرفی می‌کنید پورسانت دریافت کنید.
              </p>
            </div>
            <Link
              href="/owner"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-extrabold text-violet-700 shadow-xl transition-transform hover:scale-[1.04]"
            >
              ثبت‌نام طراحان
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
