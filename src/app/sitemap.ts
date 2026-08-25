import type { MetadataRoute } from "next";
import { db } from "@/db";
import { blogPosts, businesses } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://kasbyab.ir").replace(
    /\/$/,
    ""
  );

  const entries: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/search`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/designers`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/owner`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  try {
    const biz = await db
      .select({ slug: businesses.slug })
      .from(businesses)
      .where(eq(businesses.status, "active"))
      .limit(500);
    for (const b of biz) {
      entries.push({
        url: `${base}/business/${b.slug}`,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }

    const posts = await db
      .select({ slug: blogPosts.slug })
      .from(blogPosts)
      .where(eq(blogPosts.published, true))
      .limit(200);
    for (const p of posts) {
      entries.push({
        url: `${base}/blog/${p.slug}`,
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  } catch {
    // بدون دیتابیس هم sitemap پایه ارائه می‌شود
  }

  return entries;
}
