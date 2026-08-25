import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, CalendarDays, PenLine } from "lucide-react";
import { getPostBySlug, getPublishedPosts } from "@/lib/queries";
import { Reveal } from "@/components/motion";
import { toFa } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  return {
    title: post?.title ?? "مطلب یافت نشد",
    description: post?.excerpt ?? undefined,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const more = await getPublishedPosts(4);

  return (
    <div className="container-px mx-auto max-w-3xl py-10 sm:py-14">
      <Reveal>
        <Link
          href="/blog"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-600 ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          بازگشت به بلاگ
        </Link>

        <h1 className="mt-6 text-2xl font-black leading-relaxed text-ink sm:text-3xl sm:leading-relaxed">
          {post.title}
        </h1>
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-400">
          <CalendarDays className="h-4 w-4" />
          {toFa(new Date(post.createdAt).toLocaleDateString("fa-IR"))}
        </p>
      </Reveal>

      {post.coverUrl && (
        <Reveal delay={0.05}>
          <div className="relative mt-6 aspect-[16/8] overflow-hidden rounded-2xl">
            <Image
              src={post.coverUrl}
              alt={post.title}
              fill
              priority
              sizes="(max-width:768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        </Reveal>
      )}

      <Reveal delay={0.08}>
        <article className="card mt-6 p-6 sm:p-8">
          {(post.content ?? "")
            .split("\n\n")
            .map((para, i) =>
              para.trim() ? (
                <p key={i} className="mb-4 text-[15px] leading-9 text-slate-700 last:mb-0">
                  {para}
                </p>
              ) : null
            )}
        </article>
      </Reveal>

      {more.length > 1 && (
        <Reveal delay={0.1}>
          <section className="mt-10">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-extrabold text-ink">
              <PenLine className="h-4 w-4 text-primary" />
              مطالب دیگر
            </h2>
            <div className="grid gap-2">
              {more
                .filter((p) => p.slug !== post.slug)
                .slice(0, 3)
                .map((p) => (
                  <Link
                    key={p.id}
                    href={`/blog/${p.slug}`}
                    className="card card-hover flex items-center justify-between gap-3 p-4"
                  >
                    <span className="line-clamp-1 text-sm font-bold text-ink">
                      {p.title}
                    </span>
                    <ArrowLeft className="h-4 w-4 shrink-0 text-slate-300" />
                  </Link>
                ))}
            </div>
          </section>
        </Reveal>
      )}
    </div>
  );
}
