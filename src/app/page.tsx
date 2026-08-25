import Link from "next/link";
import {
  Search,
  MapPin,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Building2,
  Users,
  LayoutGrid,
  BadgeCheck,
  Star,
  Quote,
  Navigation,
  CheckCircle2,
} from "lucide-react";
import {
  getCategories,
  getCities,
  getFeaturedBusinesses,
  getPlans,
  getStats,
  getCityBusinessCounts,
} from "@/lib/queries";
import { formatPrice, toFa } from "@/lib/utils";
import { SearchBar } from "@/components/search-bar";
import { BusinessCard } from "@/components/business-card";
import { SectionHeading } from "@/components/section-heading";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { CountUp } from "@/components/counter";
import { CategoryIcon, CATEGORY_COLORS } from "@/components/category-icon";
import { IranMap } from "@/components/iran-map";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, cities, featured, stats, plans, cityCounts] = await Promise.all([
    getCategories(),
    getCities(),
    getFeaturedBusinesses(6),
    getStats(),
    getPlans(),
    getCityBusinessCounts(),
  ]);

  const heroChips = categories.slice(0, 6);

  return (
    <>
      {/* ============ هیرو ============ */}
      <section className="relative overflow-hidden">
        {/* پس‌زمینه لایه‌ای */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary-50 via-white to-canvas" />
        <div className="bg-dots absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="blob right-[-7rem] top-[-5rem] h-80 w-80 bg-primary-300/70 animate-float-slow" />
        <div className="blob left-[-6rem] top-28 h-72 w-72 bg-accent-200/70 animate-float-rev" />

        <div className="container-px mx-auto max-w-7xl pb-16 pt-12 sm:pt-20">
          <div className="relative mx-auto max-w-3xl text-center">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-primary-700 shadow-sm ring-1 ring-primary-100">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-600" />
                </span>
                مرجع شفاف معرفی و جست‌وجوی کسب‌وکار
              </span>
            </Reveal>

            <Reveal delay={0.06}>
              <h1 className="mt-6 text-[2.1rem] font-black leading-[1.22] tracking-tight text-ink sm:text-5xl sm:leading-[1.18]">
                کسب‌وکار مدنظرتان را
                <br className="hidden sm:block" />{" "}
                <span className="relative whitespace-nowrap">
                  <span className="text-gradient">سریع و شفاف</span>
                </span>{" "}
                پیدا کنید
              </h1>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mx-auto mt-5 max-w-xl text-sm leading-8 text-slate-600 sm:text-lg sm:leading-8">
                بر اساس <span className="font-bold text-ink">شهر</span> و{" "}
                <span className="font-bold text-ink">نوع خدمت</span> جست‌وجو کنید،
                طرح معرفی کسب‌وکار را ببینید و در صورت نیاز وارد ویترین حرفه‌ای و
                اطلاعات تکمیلی شوید.
              </p>
            </Reveal>

            {/* نوار جست‌وجو */}
            <Reveal delay={0.18}>
              <div className="relative mt-8">
                {/* عناصر شناور تزئینی */}
                <div className="pointer-events-none absolute -right-2 top-2 hidden rotate-3 animate-float-slow sm:block">
                  <span className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold text-primary-700 shadow-lg ring-1 ring-primary-100">
                    <BadgeCheck className="h-4 w-4" />
                    دارای جواز
                  </span>
                </div>
                <div className="pointer-events-none absolute -left-2 bottom-3 hidden -rotate-3 animate-float-rev lg:block">
                  <span className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold text-amber-600 shadow-lg ring-1 ring-amber-100">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                    ۴.۸ رضایت کاربران
                  </span>
                </div>
                <SearchBar cities={cities} categories={categories} />
              </div>
            </Reveal>

            {/* دسترسی سریع */}
            <Reveal delay={0.24}>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs text-slate-400">پرجست‌وجوترین:</span>
                {heroChips.map((c) => (
                  <Link
                    key={c.id}
                    href={`/search?cat=${c.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-0.5 hover:bg-primary-50 hover:text-primary-700 hover:ring-primary-200"
                  >
                    <CategoryIcon name={c.icon} className="h-3.5 w-3.5" />
                    {c.name}
                  </Link>
                ))}
              </div>
            </Reveal>

            {/* نوار اعتماد */}
            <Reveal delay={0.3}>
              <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-3 rounded-2xl bg-white/70 p-4 ring-1 ring-slate-100 backdrop-blur">
                <TrustItem icon={<ShieldCheck className="h-4 w-4" />} text="اطلاعات شفاف و اظهاری" />
                <span className="hidden h-4 w-px bg-slate-200 sm:block" />
                <TrustItem icon={<Navigation className="h-4 w-4" />} text="مسیریابی و تماس سریع" />
                <span className="hidden h-4 w-px bg-slate-200 sm:block" />
                <TrustItem icon={<Sparkles className="h-4 w-4" />} text="ویترین حرفه‌ای" />
              </div>
            </Reveal>

            {/* آمار */}
            <Reveal delay={0.36}>
              <div className="mx-auto mt-6 grid max-w-2xl grid-cols-3 gap-3">
                <StatBox
                  icon={<Building2 className="h-5 w-5" />}
                  value={<CountUp to={stats.businesses} suffix="+" />}
                  label="کسب‌وکار فعال"
                />
                <StatBox
                  icon={<LayoutGrid className="h-5 w-5" />}
                  value={<CountUp to={stats.categories} />}
                  label="دسته خدمات"
                />
                <StatBox
                  icon={<MapPin className="h-5 w-5" />}
                  value={<CountUp to={stats.cities} suffix="+" />}
                  label="شهر"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ دسته‌بندی‌ها ============ */}
      <section id="categories" className="container-px mx-auto max-w-7xl py-16">
        <SectionHeading
          eyebrow="دسته‌بندی خدمات"
          title="در کدام حوزه جست‌وجو می‌کنید؟"
          desc="انتخاب دسته به شما کمک می‌کند سریع‌تر به کسب‌وکارهای مرتبط برسید."
        />
        <Stagger className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((c) => (
            <StaggerItem key={c.id}>
              <Link
                href={`/search?cat=${c.slug}`}
                className="card card-hover group flex h-full flex-col items-center gap-3 p-5 text-center"
              >
                <span
                  className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-bl ${
                    CATEGORY_COLORS[c.color] ?? CATEGORY_COLORS.primary
                  } text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6`}
                >
                  <CategoryIcon name={c.icon} className="h-7 w-7" />
                </span>
                <span className="text-sm font-bold text-ink">{c.name}</span>
                <span className="inline-flex items-center gap-1 text-xs text-slate-400 transition-colors group-hover:text-primary-600">
                  مشاهده
                  <ArrowLeft className="h-3 w-3" />
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ============ نقشه ایران ============ */}
      <IranMap cities={cities} counts={cityCounts} />

      {/* ============ کسب‌وکارهای منتخب ============ */}
      <section id="featured" className="bg-gradient-to-b from-white to-primary-50/40 py-16">
        <div className="container-px mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="طرح‌های معرفی منتخب"
            title="کسب‌وکارهای برتر هفته"
            desc="روی تصویر هر کارت کلیک کنید تا وارد طرح معرفی کامل شوید."
          />
          <Stagger className="mt-10 grid gap-5 md:grid-cols-2">
            {featured.map((b) => (
              <StaggerItem key={b.id}>
                <BusinessCard business={b} />
              </StaggerItem>
            ))}
          </Stagger>
          <div className="mt-10 text-center">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.03]"
            >
              مشاهده همه کسب‌وکارها
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ چطور کار می‌کند ============ */}
      <section id="how" className="container-px mx-auto max-w-7xl py-16">
        <SectionHeading
          eyebrow="مسیر کاربر"
          title="از جست‌وجو تا انتخاب، در سه گام"
          desc="تجربه‌ای روان با تفکیک کامل مسیر مشتری از امکانات تکمیلی."
        />
        <div className="relative mt-12">
          {/* خط اتصال */}
          <div className="absolute right-[16%] left-[16%] top-7 hidden h-px bg-gradient-to-l from-primary-200 via-primary-300 to-accent-200 md:block" />
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                n: "۱",
                icon: <Search className="h-6 w-6" />,
                title: "جست‌وجوی هوشمند",
                desc: "شهر و نوع خدمت را انتخاب کنید یا نام کسب‌وکار را جست‌وجو نمایید.",
              },
              {
                n: "۲",
                icon: <LayoutGrid className="h-6 w-6" />,
                title: "نتایج شفاف",
                desc: "مینی‌کارت کسب‌وکارها را با نشان‌های جواز، اتحادیه و ضمانت ببینید.",
              },
              {
                n: "۳",
                icon: <Sparkles className="h-6 w-6" />,
                title: "معرفی و ویترین",
                desc: "ابتدا طرح معرفی را ببینید و در صورت نیاز وارد ویترین حرفه‌ای شوید.",
              },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 0.1}>
                <div className="relative flex flex-col items-center text-center">
                  <span className="relative z-10 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-bl from-primary to-primary-700 text-white shadow-lg shadow-primary-600/25 ring-4 ring-canvas">
                    {s.icon}
                  </span>
                  <span className="mt-1 text-xs font-black text-primary-300">
                    گام {s.n}
                  </span>
                  <h3 className="mt-2 text-lg font-extrabold text-ink">
                    {s.title}
                  </h3>
                  <p className="mt-2 max-w-xs text-sm leading-7 text-slate-500">
                    {s.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ شفافیت و اعتماد ============ */}
      <section className="relative overflow-hidden bg-ink py-16 text-white">
        <div className="bg-dots absolute inset-0 opacity-[0.07]" />
        <div className="blob right-10 top-0 h-56 w-56 bg-primary-500/40" />
        <div className="blob bottom-0 left-10 h-56 w-56 bg-accent-500/30" />
        <div className="container-px relative mx-auto max-w-7xl">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-primary-200 ring-1 ring-inset ring-white/10">
                <ShieldCheck className="h-3.5 w-3.5" />
                شفافیت کامل اطلاعات
              </span>
              <h2 className="mt-4 text-2xl font-extrabold leading-tight sm:text-3xl">
                هر نشان، یک اظهار شفاف است
              </h2>
              <p className="mt-4 text-sm leading-8 text-slate-300">
                نشان‌هایی مانند «جواز کسب»، «عضو اتحادیه»، «ضمانت» و «ویترین
                حرفه‌ای» منحصراً بر اساس اظهار خود کسب‌وکار نمایش داده می‌شوند و با
                برچسب مشخص، تفاوت آن‌ها با «تأیید پلتفرم» کاملاً روشن است.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  "تأیید پلتفرم (احراز توسط کسب‌یاب)",
                  "جواز کسب (اظهاری)",
                  "عضو اتحادیه (اظهاری)",
                  "ضمانت (اظهاری)",
                ].map((t) => (
                  <span
                    key={t}
                    className="rounded-lg bg-white/5 px-3 py-2 text-xs text-slate-200 ring-1 ring-inset ring-white/10"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Reveal>

            <Stagger className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: <Users className="h-5 w-5" />, title: "تجربه روان", desc: "سادگی و سرعت در اولویت طراحی قرار دارد." },
                { icon: <Quote className="h-5 w-5" />, title: "تفکیک مسیر مشتری", desc: "ابتدا معرفی، سپس امکانات تکمیلی." },
                { icon: <MapPin className="h-5 w-5" />, title: "مسیریابی", desc: "دسترسی سریع به موقعیت و آدرس دقیق." },
                { icon: <ShieldCheck className="h-5 w-5" />, title: "اعتماد آگاهانه", desc: "تصمیم‌گیری شفاف بر اساس اطلاعات واقعی." },
              ].map((f) => (
                <StaggerItem key={f.title}>
                  <div className="h-full rounded-2xl bg-white/5 p-5 ring-1 ring-inset ring-white/10 transition-colors hover:bg-white/10">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-500/20 text-primary-200">
                      {f.icon}
                    </span>
                    <h3 className="mt-3 font-bold">{f.title}</h3>
                    <p className="mt-1 text-xs leading-6 text-slate-300">
                      {f.desc}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      {/* ============ پلن‌های اشتراک ============ */}
      <section id="pricing" className="container-px mx-auto max-w-7xl py-16">
        <SectionHeading
          eyebrow="مدل اشتراک"
          title="ویترین حرفه‌ای با پلن‌های منعطف"
          desc="بدون اشتراک هم پروفایل، کارت معرفی و QR دارید؛ با فعال‌سازی اشتراک، ویترین حرفه‌ای شما فعال می‌شود."
        />
        <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((p) => (
            <StaggerItem key={p.id}>
              <div
                className={`card card-hover flex h-full flex-col p-6 ${
                  p.priceMonthly === 0 ? "" : "border-primary-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-ink">{p.name}</h3>
                  {p.priceMonthly === 0 ? (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                      رایگان
                    </span>
                  ) : (
                    <span className="rounded-full bg-primary-50 px-3 py-1 text-[11px] font-bold text-primary-700 ring-1 ring-inset ring-primary-100">
                      پرفروش
                    </span>
                  )}
                </div>
                <p className="mt-4">
                  {p.priceMonthly === 0 ? (
                    <span className="text-2xl font-black text-ink">۰ تومان</span>
                  ) : (
                    <>
                      <span className="text-2xl font-black text-ink">
                        {toFa(formatPrice(p.priceMonthly))}
                      </span>
                      <span className="mr-1 text-xs text-slate-400">تومان / ماه</span>
                    </>
                  )}
                </p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {(() => {
                    try {
                      const features = JSON.parse(p.features ?? "[]") as string[];
                      return features.map((f) => (
                        <li
                          key={f}
                          className="flex items-start gap-2 text-xs leading-6 text-slate-600"
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          {f}
                        </li>
                      ));
                    } catch {
                      return null;
                    }
                  })()}
                </ul>
                <Link
                  href="/owner"
                  className={`mt-6 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-transform hover:scale-[1.02] ${
                    p.priceMonthly === 0
                      ? "border border-slate-200 text-ink hover:bg-slate-50"
                      : "bg-primary text-white shadow-lg shadow-primary-600/25"
                  }`}
                >
                  شروع کن
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ============ فراخوان صاحبان کسب‌وکار ============ */}
      <section className="container-px mx-auto max-w-7xl pb-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-bl from-primary-700 via-primary-600 to-primary-500 p-8 text-white shadow-2xl shadow-primary-700/20 sm:p-12">
            <div className="bg-dots absolute inset-0 opacity-10" />
            <div className="blob right-10 top-0 h-48 w-48 bg-accent-400/30" />
            <div className="relative flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <h2 className="text-2xl font-black sm:text-3xl">
                  صاحب کسب‌وکار هستید؟
                </h2>
                <p className="mt-3 text-sm leading-7 text-primary-50">
                  پس از ثبت‌نام و دریافت تأییدیه، پنل مدیریت اختصاصی برای معرفی
                  کسب‌وکار، مدیریت ویترین، کارت‌ویزیت‌ساز، قیمت‌ها و اطلاعات تماس
                  در اختیار شما قرار می‌گیرد.
                </p>
              </div>
              <Link
                href="/owner"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-extrabold text-primary-700 shadow-xl transition-transform hover:scale-[1.04]"
              >
                ثبت کسب‌وکار من
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function TrustItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-600">
      <span className="text-primary-600">{icon}</span>
      {text}
    </span>
  );
}

function StatBox({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-white/70 px-3 py-4 text-center shadow-sm ring-1 ring-slate-100 backdrop-blur">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-50 text-primary-700">
        {icon}
      </span>
      <span className="text-2xl font-black text-ink">{value}</span>
      <span className="text-[11px] text-slate-500 sm:text-xs">{label}</span>
    </div>
  );
}
