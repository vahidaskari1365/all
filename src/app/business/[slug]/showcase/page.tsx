import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowRight,
  Images,
  Tag,
  Sparkles,
  Video,
  Star,
  CheckCircle2,
  Store,
} from "lucide-react";
import {
  getBusinessBySlug,
  getShowcaseItems,
} from "@/lib/queries";
import { Gallery } from "@/components/gallery";
import { ClaimBadges } from "@/components/status-badges";
import { Reveal } from "@/components/motion";
import { formatPrice, toFa } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const b = await getBusinessBySlug(slug);
  return { title: b ? `ویترین ${b.name}` : "ویترین" };
}

export default async function ShowcasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);
  if (!business) notFound();

  const items = await getShowcaseItems(business.id);
  const photos = items.filter((i) => i.type === "photo");
  const products = items.filter((i) => i.type === "product");
  const services = photos.filter((i) => i.description?.trim());

  const claims = {
    verified: business.verified,
    license: business.hasLicense,
    union: business.unionMember,
    guarantee: business.hasGuarantee,
    showcase: business.hasShowcase,
  };

  return (
    <div className="container-px mx-auto max-w-7xl py-8 sm:py-12">
      {/* سربرگ */}
      <Reveal>
        <div className="card overflow-hidden">
          <div className="flex flex-col gap-4 bg-gradient-to-bl from-primary-700 to-primary-500 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                <Store className="h-7 w-7" />
              </span>
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-100">
                  <Images className="h-3.5 w-3.5" />
                  ویترین حرفه‌ای
                </span>
                <h1 className="mt-1 text-2xl font-black">{business.name}</h1>
                <p className="text-sm text-primary-100">
                  {business.category?.name} • {business.city?.name}
                </p>
              </div>
            </div>
            <Link
              href={`/business/${business.slug}`}
              className="inline-flex items-center gap-1.5 self-start rounded-xl bg-white/15 px-4 py-2.5 text-sm font-bold text-white ring-1 ring-white/20 backdrop-blur transition-colors hover:bg-white/25 sm:self-auto"
            >
              طرح معرفی
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-3 p-5">
            {business.rating > 0 && (
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-ink">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {toFa(business.rating.toFixed(1))}
              </span>
            )}
            <ClaimBadges claims={claims} />
          </div>
        </div>
      </Reveal>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0 space-y-8">
          {/* گالری تصاویر */}
          <Reveal>
            <Section
              icon={<Images className="h-5 w-5" />}
              title="گالری تصاویر"
              desc="محیط و نمونه‌کارهای این کسب‌وکار"
            >
              {photos.length > 0 ? (
                <Gallery
                  images={photos.map((p) => ({
                    url: p.imageUrl ?? "",
                    title: p.title,
                  }))}
                />
              ) : (
                <EmptyHint>هنوز تصویری در گالری ثبت نشده است.</EmptyHint>
              )}
            </Section>
          </Reveal>

          {/* محصولات و قیمت‌ها */}
          {products.length > 0 && (
            <Reveal>
              <Section
                icon={<Tag className="h-5 w-5" />}
                title="محصولات و قیمت‌ها"
                desc="قیمت‌ها بر اساس اعلان کسب‌وکار و صرفاً جهت اطلاع است"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3 transition-shadow hover:shadow-lg hover:shadow-primary-900/5"
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        {p.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.imageUrl}
                            alt={p.title}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-ink">{p.title}</h4>
                        {p.description && (
                          <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-slate-500">
                            {p.description}
                          </p>
                        )}
                        <div className="mt-2 flex items-baseline gap-1">
                          {p.price && (
                            <span className="text-base font-black text-primary-700">
                              {formatPrice(p.price)}
                            </span>
                          )}
                          {p.price && (
                            <span className="text-xs text-slate-400">
                              {p.unit ?? "تومان"}
                            </span>
                          )}
                          {!p.price && (
                            <span className="text-xs text-slate-400">
                              جهت استعلام تماس بگیرید
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            </Reveal>
          )}

          {/* توضیحات خدمات */}
          {services.length > 0 && (
            <Reveal>
              <Section
                icon={<Sparkles className="h-5 w-5" />}
                title="توضیحات خدمات"
                desc="معرفی خدمات و امکانات ارائه‌شده"
              >
                <ul className="grid gap-3 sm:grid-cols-2">
                  {services.map((s) => (
                    <li
                      key={s.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <h4 className="flex items-center gap-2 text-sm font-bold text-ink">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        {s.title}
                      </h4>
                      <p className="mt-2 text-xs leading-6 text-slate-500">
                        {s.description}
                      </p>
                    </li>
                  ))}
                </ul>
              </Section>
            </Reveal>
          )}
        </div>

        {/* ستون کناری */}
        <aside className="space-y-6">
          <Reveal delay={0.06}>
            <div className="card overflow-hidden">
              <div className="bg-ink p-4 text-white">
                <h3 className="flex items-center gap-2 font-extrabold">
                  <Sparkles className="h-4 w-4 text-accent-400" />
                  امکانات پیشرفته
                </h3>
              </div>
              <ul className="grid grid-cols-2 gap-2 p-4 text-xs font-medium text-slate-600">
                {["گالری حرفه‌ای", "لیست قیمت", "اطلاعات تماس", "مسیریابی", "شبکه‌های اجتماعی", "پشتیبانی"].map(
                  (f) => (
                    <li
                      key={f}
                      className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-2"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      {f}
                    </li>
                  )
                )}
              </ul>
            </div>
          </Reveal>

          {/* ویدئو — به‌زودی */}
          <Reveal delay={0.12}>
            <div className="relative overflow-hidden rounded-2xl border border-dashed border-primary-200 bg-primary-50/50 p-5 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary-100 text-primary-700">
                <Video className="h-6 w-6" />
              </span>
              <h3 className="mt-3 text-sm font-extrabold text-ink">
                ویدئو معرفی کسب‌وکار
              </h3>
              <p className="mt-1.5 text-xs leading-6 text-slate-500">
                به‌زودی امکان آپلود ویدئوی معرفی برای نمایش حرفه‌ای‌تر خدمات شما
                فراهم می‌شود.
              </p>
              <span className="mt-3 inline-block rounded-full bg-white px-3 py-1 text-[11px] font-bold text-primary-700 ring-1 ring-primary-200">
                به‌زودی
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.16}>
            <Link
              href={`/business/${business.slug}`}
              className="flex items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
            >
              <ArrowRight className="h-4 w-4" />
              مشاهده طرح معرفی کامل
            </Link>
          </Reveal>
        </aside>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  desc,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-700">
          {icon}
        </span>
        <div>
          <h2 className="text-lg font-extrabold text-ink">{title}</h2>
          {desc && <p className="mt-0.5 text-xs text-slate-500">{desc}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-400">
      {children}
    </div>
  );
}
