import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import {
  Phone,
  Smartphone,
  MapPin,
  Navigation,
  Clock,
  Mail,
  Globe,
  Images,
  ArrowLeft,
  CheckCircle2,
  QrCode,
  Download,
  Crown,
} from "lucide-react";
import { InstagramIcon, TelegramIcon, WhatsAppIcon } from "@/components/brand-icons";
import {
  getActiveSubscription,
  getBusinessBySlug,
  getShowcaseItems,
  getRelatedBusinesses,
} from "@/lib/queries";
import { BusinessCard } from "@/components/business-card";
import { ClaimBadges } from "@/components/status-badges";
import { StarRating } from "@/components/star-rating";
import { CategoryIcon } from "@/components/category-icon";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { SectionHeading } from "@/components/section-heading";
import { ReportButton } from "@/components/report-button";
import { BusinessActionsBar } from "@/components/business-actions-bar";
import { OrderButton } from "@/components/order-modal";
import { LocationMap } from "@/components/location-map";
import { businessQrDataUrl } from "@/lib/qr";
import { toFa } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const b = await getBusinessBySlug(slug);
  if (!b) return { title: "کسب‌وکار یافت نشد" };
  return {
    title: b.name,
    description: b.tagline ?? b.description?.slice(0, 150) ?? "",
  };
}

function mapsUrl(b: {
  lat: string | null;
  lng: string | null;
  address: string | null;
}) {
  if (b.lat && b.lng) {
    return `https://www.google.com/maps?q=${encodeURIComponent(
      `${b.lat},${b.lng}`
    )}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    b.address ?? ""
  )}`;
}

export default async function BusinessDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);
  if (!business) notFound();

  const [showcase, related, subscription] = await Promise.all([
    getShowcaseItems(business.id),
    getRelatedBusinesses(business),
    getActiveSubscription(business.id),
  ]);

  const claims = {
    verified: business.verified,
    license: business.hasLicense,
    union: business.unionMember,
    guarantee: business.hasGuarantee,
    showcase: business.hasShowcase,
  };

  const wa = business.whatsapp?.replace(/[^\d]/g, "");
  const socials = [
    business.instagram
      ? { href: `https://instagram.com/${business.instagram.replace(/^@/, "")}`, label: "اینستاگرام", Icon: InstagramIcon }
      : null,
    business.telegram
      ? { href: `https://t.me/${business.telegram.replace(/^@/, "")}`, label: "تلگرام", Icon: TelegramIcon }
      : null,
    wa ? { href: `https://wa.me/${wa}`, label: "واتساپ", Icon: WhatsAppIcon } : null,
  ].filter(Boolean) as { href: string; label: string; Icon: typeof InstagramIcon }[];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kasbyab.ir";
  const businessUrl = `${siteUrl.replace(/\/$/, "")}/business/${business.slug}`;
  const qrDataUrl = await businessQrDataUrl(businessUrl);

  return (
    <div className="pb-24 md:pb-8">
      {/* ===== بنر کاور ===== */}
      <div className="relative h-44 w-full overflow-hidden sm:h-64">
        {business.coverUrl ? (
          <Image
            src={business.coverUrl}
            alt={business.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-bl from-primary-600 to-primary-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-ink/20" />
        <div className="container-px mx-auto max-w-7xl">
          <Link
            href="/search"
            className="absolute top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-2 text-xs font-bold text-ink backdrop-blur transition-colors hover:bg-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            بازگشت به نتایج
          </Link>
        </div>
      </div>

      {/* ===== سربرگ طرح معرفی ===== */}
      <div className="container-px mx-auto max-w-7xl">
        <div className="-mt-14 grid gap-6 sm:-mt-16 lg:grid-cols-[1fr_340px]">
          {/* ستون اصلی */}
          <div className="min-w-0">
            <Reveal>
              <div className="card p-5 sm:p-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <span className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-bl from-primary-500 to-primary-700 text-2xl font-black text-white shadow-lg ring-4 ring-white">
                    {business.logoUrl ? (
                      <Image
                        src={business.logoUrl}
                        alt={business.name}
                        width={80}
                        height={80}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      business.name.slice(0, 2)
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <CategoryIcon
                        name={business.category?.icon ?? "store"}
                        className="h-4 w-4 text-primary"
                      />
                      <span className="text-xs font-bold text-primary-700">
                        {business.category?.name}
                      </span>
                      {subscription && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-bold text-violet-700 ring-1 ring-inset ring-violet-200">
                          <Crown className="h-3 w-3" />
                          اشتراک {subscription.plan?.name ?? "فعال"}
                        </span>
                      )}
                    </div>
                    <h1 className="mt-1 text-2xl font-black text-ink sm:text-3xl">
                      {business.name}
                    </h1>
                    {business.rating > 0 && (
                      <div className="mt-2">
                        <StarRating
                          rating={business.rating}
                          count={business.reviewCount}
                          size="md"
                        />
                      </div>
                    )}
                    {business.district && (
                      <p className="mt-2 flex items-center gap-1 text-sm text-slate-500">
                        <MapPin className="h-4 w-4 text-primary" />
                        {business.district}، {business.city?.name ?? ""}
                      </p>
                    )}
                  </div>
                </div>

                {/* نشان‌های وضعیت */}
                <div className="mt-5">
                  <ClaimBadges claims={claims} />
                </div>

                {business.tagline && (
                  <p className="mt-5 rounded-xl bg-primary-50/60 p-4 text-base font-medium leading-7 text-ink">
                    {business.tagline}
                  </p>
                )}

                {/* دکمه‌های اقدام */}
                <div className="mt-5 flex flex-wrap gap-2.5">
                  {business.phone && (
                    <a
                      href={`tel:${business.phone}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary-600/25 transition-transform hover:scale-[1.03]"
                    >
                      <Phone className="h-4 w-4" />
                      تماس: <span dir="ltr">{business.phone}</span>
                    </a>
                  )}
                  <OrderButton
                    businessId={business.id}
                    businessName={business.name}
                    items={showcase
                      .filter((item) => item.type === "product")
                      .map((item) => ({
                        id: item.id,
                        title: item.title,
                        price: item.price,
                        unit: item.unit,
                      }))}
                  />
                  <a
                    href={mapsUrl(business)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.03]"
                  >
                    <Navigation className="h-4 w-4" />
                    مسیریابی
                  </a>
                  <ReportButton businessId={business.id} businessName={business.name} />
                  {socials.length > 0 && (
                    <div className="flex items-center gap-2">
                      {socials.map(({ href, label, Icon }) => (
                        <a
                          key={label}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={label}
                          title={label}
                          className="grid h-12 w-12 place-items-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:border-primary hover:bg-primary-50 hover:text-primary"
                        >
                          <Icon className="h-5 w-5" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Reveal>

            {/* درباره کسب‌وکار */}
            {business.description && (
              <Reveal delay={0.05}>
                <div className="card mt-6 p-5 sm:p-7">
                  <h2 className="flex items-center gap-2 text-lg font-extrabold text-ink">
                    <span className="h-5 w-1.5 rounded-full bg-primary" />
                    طرح معرفی کسب‌وکار
                  </h2>
                  <div className="mt-4 space-y-3 text-sm leading-8 text-slate-600">
                    {business.description.split("\n").map((line, i) =>
                      line.trim() ? (
                        <p key={i} className="flex gap-2">
                          <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary-400" />
                          <span>{line}</span>
                        </p>
                      ) : null
                    )}
                  </div>
                </div>
              </Reveal>
            )}

            {/* پیش‌نمایش ویترین */}
            {(showcase.length > 0 || business.hasShowcase) && (
              <Reveal delay={0.1}>
                <div className="card mt-6 overflow-hidden">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-5">
                    <h2 className="flex items-center gap-2 text-lg font-extrabold text-ink">
                      <Images className="h-5 w-5 text-primary" />
                      ویترین حرفه‌ای
                    </h2>
                    <Link
                      href={`/business/${business.slug}/showcase`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary-50 px-3.5 py-2 text-xs font-bold text-primary-700 transition-colors hover:bg-primary-100"
                    >
                      ورود به ویترین کامل
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  {showcase.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 p-5 sm:grid-cols-3 lg:grid-cols-4">
                      {showcase.slice(0, 4).map((item) => (
                        <div
                          key={item.id}
                          className="relative aspect-square overflow-hidden rounded-xl"
                        >
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.title}
                              fill
                              sizes="(max-width:768px) 50vw, 25vw"
                              className="object-cover transition-transform duration-500 hover:scale-110"
                            />
                          ) : (
                            <div className="grid h-full w-full place-items-center bg-slate-100 text-slate-400">
                              <Images className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="p-5 text-sm text-slate-500">
                      این کسب‌وکار ویترین حرفه‌ای دارد. برای مشاهده گالری عکس،
                      توضیحات خدمت و قیمت محصولات وارد بخش ویترین شوید.
                    </p>
                  )}
                </div>
              </Reveal>
            )}

            {/* کارت QR — لینک اختصاصی */}
            <Reveal delay={0.12}>
              <div className="card mt-6 p-5 sm:p-7">
                <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                  <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrDataUrl}
                      alt={`QR اختصاصی ${business.name}`}
                      width={148}
                      height={148}
                      className="h-auto w-32 sm:w-36"
                    />
                  </div>
                  <div className="min-w-0 flex-1 text-center sm:text-right">
                    <h2 className="flex items-center justify-center gap-2 text-lg font-extrabold text-ink sm:justify-start">
                      <QrCode className="h-5 w-5 text-primary" />
                      کارت معرفی دیجیتال و QR
                    </h2>
                    <p className="mt-2 text-sm leading-7 text-slate-500">
                      با اسکن این QR مشتریان مستقیم به همین صفحه می‌رسند؛ تماس،
                      مسیریابی و شبکه‌های اجتماعی در دسترس است. آن را چاپ کنید یا
                      در شبکه‌های اجتماعی به اشتراک بگذارید.
                    </p>
                    <p
                      dir="ltr"
                      className="mt-3 truncate rounded-xl bg-slate-50 px-3 py-2 text-left text-xs text-slate-500 ring-1 ring-slate-100"
                    >
                      {businessUrl}
                    </p>
                    <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                      <a
                        href={qrDataUrl}
                        download={`kasbyab-qr-${business.slug}.png`}
                        className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-xs font-bold text-white transition-transform hover:scale-[1.03]"
                      >
                        <Download className="h-4 w-4" />
                        دانلود QR
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* ستون تماس */}
          <Reveal delay={0.08}>
            <aside className="lg:sticky lg:top-28">
              <div className="card overflow-hidden">
                <div className="bg-ink p-4 text-white">
                  <h3 className="font-extrabold">اطلاعات تماس و دسترسی</h3>
                  <p className="mt-1 text-xs text-slate-300">
                    بر اساس اعلان کسب‌وکار
                  </p>
                </div>
                <ul className="divide-y divide-slate-100">
                  {business.address && (
                    <InfoRow icon={<MapPin className="h-4 w-4" />} label="آدرس">
                      {business.address}
                    </InfoRow>
                  )}
                  {business.phone && (
                    <InfoRow icon={<Phone className="h-4 w-4" />} label="تلفن ثابت">
                      <a href={`tel:${business.phone}`} className="hover:text-primary-700">
                        {business.phone}
                      </a>
                    </InfoRow>
                  )}
                  {business.mobile && (
                    <InfoRow icon={<Smartphone className="h-4 w-4" />} label="موبایل">
                      <a href={`tel:${business.mobile}`} className="hover:text-primary-700">
                        {business.mobile}
                      </a>
                    </InfoRow>
                  )}
                  {business.workHours && (
                    <InfoRow icon={<Clock className="h-4 w-4" />} label="ساعات کاری">
                      {business.workHours}
                    </InfoRow>
                  )}
                  {business.email && (
                    <InfoRow icon={<Mail className="h-4 w-4" />} label="ایمیل">
                      <a href={`mailto:${business.email}`} className="hover:text-primary-700">
                        {business.email}
                      </a>
                    </InfoRow>
                  )}
                  {business.website && (
                    <InfoRow icon={<Globe className="h-4 w-4" />} label="وب‌سایت">
                      <a
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary-700"
                      >
                        {business.website.replace(/^https?:\/\//, "")}
                      </a>
                    </InfoRow>
                  )}
                </ul>
                <div className="space-y-2 p-4">
                  <a
                    href={mapsUrl(business)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-accent-600/25 transition-transform hover:scale-[1.02]"
                  >
                    <Navigation className="h-4 w-4" />
                    مشاهده روی نقشه و مسیریابی
                  </a>
                  <p className="flex items-start gap-1.5 text-[11px] leading-5 text-slate-400">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0" />
                    اطلاعات تماس و موقعیت بر اساس اعلان خود کسب‌وکار است.
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <LocationMap
                  name={business.name}
                  lat={business.lat}
                  lng={business.lng}
                  address={business.address}
                />
              </div>
            </aside>
          </Reveal>
        </div>

        {/* کسب‌وکارهای مرتبط */}
        {related.length > 0 && (
          <section className="mt-14">
            <SectionHeading
              align="start"
              eyebrow="مشابه این کسب‌وکار"
              title="پیشنهادهای مرتبط"
            />
            <Stagger className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((b) => (
                <StaggerItem key={b.id}>
                  <BusinessCard business={b} />
                </StaggerItem>
              ))}
            </Stagger>
          </section>
        )}
      </div>

      {/* نوار اقدام موبایل */}
      <BusinessActionsBar
        businessId={business.id}
        businessName={business.name}
        phone={business.phone}
        mapsUrl={mapsUrl(business)}
        items={showcase
          .filter((item) => item.type === "product")
          .map((item) => ({
            id: item.id,
            title: item.title,
            price: item.price,
            unit: item.unit,
          }))}
      />
    </div>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3 p-4">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-700">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-slate-400">{label}</p>
        <p className="text-sm leading-6 text-ink">{children}</p>
      </div>
    </li>
  );
}
