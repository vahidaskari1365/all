import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { CalendarDays, ArrowLeft, PenLine } from "lucide-react";
import { getPublishedPosts } from "@/lib/queries";
import { SectionHeading } from "@/components/section-heading";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { toFa } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "بلاگ",
  description: "مقالات و راهنمای کسب‌یاب درباره معرفی کسب‌وکار، ویترین حرفه‌ای و اعتماد دیجیتال.",
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="container-px mx-auto max-w-6xl py-10 sm:py-14">
      <SectionHeading
        eyebrow="بلاگ کسب‌یاب"
        title="مقالات و راهنماها"
        desc="راهنمای کسب‌وکارها و کاربران برای استفاده بهتر از کسب‌یاب."
      />

      {posts.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-slate-400">
            <PenLine className="h-8 w-8" />
          </span>
          <h2 className="mt-5 text-lg font-extrabold text-ink">مطلبی منتشر نشده است</h2>
        </div>
      ) : (
        <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <StaggerItem key={p.id}>
              <Link
                href={`/blog/${p.slug}`}
                className="card card-hover group flex h-full flex-col overflow-hidden"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  {p.coverUrl ? (
                    <Image
                      src={p.coverUrl}
                      alt={p.title}
                      fill
                      sizes="(max-width:768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center bg-gradient-to-bl from-primary-500 to-primary-700 text-white">
                      <PenLine className="h-10 w-10 opacity-70" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="line-clamp-2 text-base font-extrabold leading-7 text-ink transition-colors group-hover:text-primary-700">
                    {p.title}
                  </h3>
                  {p.excerpt && (
                    <p className="mt-2 line-clamp-2 text-xs leading-6 text-slate-500">
                      {p.excerpt}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {toFa(new Date(p.createdAt).toLocaleDateString("fa-IR"))}
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-primary-700">
                      مطالعه
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}
