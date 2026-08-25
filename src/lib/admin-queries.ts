import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  admins,
  auditLogs,
  blogPosts,
  businesses,
  categories,
  cities,
  designerPortfolios,
  designers,
  owners,
  plans,
  referrals,
  reports,
  subscriptions,
  orders,
} from "@/db/schema";
import { enrichBusinesses } from "@/lib/queries";

/* ─────────────────────────── آمار کلی ─────────────────────────── */

export async function getAdminStats() {
  const [
    biz,
    pendingBiz,
    pendingOwners,
    pendingReports,
    pendingOrders,
    activeSubs,
    pendingDesigners,
    auditCount,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(businesses),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(businesses)
      .where(eq(businesses.status, "pending")),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(owners)
      .where(eq(owners.approved, false)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(reports)
      .where(eq(reports.status, "pending")),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(eq(orders.status, "pending")),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(subscriptions)
      .where(eq(subscriptions.status, "active")),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(designerPortfolios)
      .where(eq(designerPortfolios.approved, false)),
    db.select({ count: sql<number>`count(*)::int` }).from(auditLogs),
  ]);
  return {
    businesses: biz[0]?.count ?? 0,
    pendingBiz: pendingBiz[0]?.count ?? 0,
    pendingOwners: pendingOwners[0]?.count ?? 0,
    pendingReports: pendingReports[0]?.count ?? 0,
    pendingOrders: pendingOrders[0]?.count ?? 0,
    activeSubs: activeSubs[0]?.count ?? 0,
    pendingDesigners: pendingDesigners[0]?.count ?? 0,
    auditCount: auditCount[0]?.count ?? 0,
  };
}

/* ─────────────────────────── کسب‌وکارها ─────────────────────────── */

export async function getAdminBusinesses() {
  const [rows, cats, cits] = await Promise.all([
    db.select().from(businesses).orderBy(desc(businesses.createdAt)).limit(500),
    db.select().from(categories),
    db.select().from(cities),
  ]);
  return enrichBusinesses(rows, cats, cits);
}

/* ─────────────────────────── صاحبان کسب‌وکار ─────────────────────────── */

export async function getAdminOwners() {
  return db.select().from(owners).orderBy(desc(owners.createdAt)).limit(300);
}

/* ─────────────────────────── دسته‌بندی‌ها و شهرها ─────────────────────────── */

export async function getAdminCategories() {
  return db.select().from(categories).orderBy(categories.id);
}

export async function getAdminCities() {
  return db.select().from(cities).orderBy(cities.id);
}

/* ─────────────────────────── گزارش‌های مردمی ─────────────────────────── */

export async function getAdminReports() {
  const [rows, bizRows] = await Promise.all([
    db.select().from(reports).orderBy(desc(reports.createdAt)).limit(300),
    db
      .select({ id: businesses.id, name: businesses.name, slug: businesses.slug })
      .from(businesses),
  ]);
  return rows.map((r) => {
    const b = bizRows.find((x) => x.id === r.businessId) ?? null;
    return { ...r, business: b };
  });
}

/* ─────────────────────────── سفارش‌ها ─────────────────────────── */

export async function getAdminOrders() {
  const [rows, businessesList] = await Promise.all([
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(500),
    db
      .select({ id: businesses.id, name: businesses.name, slug: businesses.slug })
      .from(businesses),
  ]);
  return rows.map((order) => ({
    ...order,
    business: businessesList.find((business) => business.id === order.businessId) ?? null,
  }));
}

/* ─────────────────────────── پلن‌ها و اشتراک‌ها ─────────────────────────── */

export async function getAdminPlans() {
  return db.select().from(plans).orderBy(plans.sortOrder, plans.priceMonthly);
}

export async function getAdminSubscriptions() {
  const [rows, bizRows, planRows] = await Promise.all([
    db.select().from(subscriptions).orderBy(desc(subscriptions.createdAt)).limit(300),
    db
      .select({ id: businesses.id, name: businesses.name, slug: businesses.slug })
      .from(businesses),
    db
      .select({ id: plans.id, name: plans.name, priceMonthly: plans.priceMonthly })
      .from(plans),
  ]);
  return rows.map((s) => ({
    ...s,
    business: bizRows.find((b) => b.id === s.businessId) ?? null,
    plan: planRows.find((p) => p.id === s.planId) ?? null,
  }));
}

/* ─────────────────────────── طراحان ─────────────────────────── */

export async function getAdminDesigners() {
  const [rows, portfolios, refs] = await Promise.all([
    db.select().from(designers).orderBy(desc(designers.points)).limit(300),
    db
      .select({
        id: designerPortfolios.id,
        designerId: designerPortfolios.designerId,
        title: designerPortfolios.title,
        imageUrl: designerPortfolios.imageUrl,
        approved: designerPortfolios.approved,
      })
      .from(designerPortfolios)
      .orderBy(desc(designerPortfolios.createdAt))
      .limit(1000),
    db
      .select({ designerId: referrals.designerId, id: referrals.id })
      .from(referrals),
  ]);
  return rows.map((d) => ({
    ...d,
    referralCount: refs.filter((r) => r.designerId === d.id).length,
    portfolios: portfolios.filter((p) => p.designerId === d.id),
  }));
}

/* ─────────────────────────── معرفی‌ها (رفرال) ─────────────────────────── */

export async function getAdminReferrals() {
  const [rows, designersList, bizRows] = await Promise.all([
    db.select().from(referrals).orderBy(desc(referrals.createdAt)).limit(300),
    db
      .select({ id: designers.id, name: designers.name })
      .from(designers),
    db
      .select({ id: businesses.id, name: businesses.name })
      .from(businesses),
  ]);
  return rows.map((r) => ({
    ...r,
    designer: designersList.find((d) => d.id === r.designerId) ?? null,
    business: bizRows.find((b) => b.id === r.businessId) ?? null,
  }));
}

/* ─────────────────────────── بلاگ ─────────────────────────── */

export async function getAdminBlogPosts() {
  return db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      excerpt: blogPosts.excerpt,
      content: blogPosts.content,
      coverUrl: blogPosts.coverUrl,
      published: blogPosts.published,
      createdAt: blogPosts.createdAt,
    })
    .from(blogPosts)
    .orderBy(desc(blogPosts.createdAt))
    .limit(300);
}

export async function getAdminBlogPost(id: number) {
  const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
  return post ?? null;
}

/* ─────────────────────────── سوابق مدیریتی ─────────────────────────── */

export async function getAuditLogs(limit = 100, actionFilter?: string) {
  const rows = await db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.id))
    .limit(limit);
  if (actionFilter) {
    return rows.filter((r) => r.action.includes(actionFilter));
  }
  return rows;
}

/* ─────────────────────────── مدیران ─────────────────────────── */

export async function getAdminAdmins() {
  return db
    .select({
      id: admins.id,
      name: admins.name,
      email: admins.email,
      role: admins.role,
      active: admins.active,
      totpEnabled: admins.totpEnabled,
      lastLoginAt: admins.lastLoginAt,
      createdAt: admins.createdAt,
    })
    .from(admins)
    .orderBy(admins.id);
}
