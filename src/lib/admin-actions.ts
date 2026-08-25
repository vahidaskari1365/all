"use server";

import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  admins,
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
} from "@/db/schema";
import { getCurrentAdmin, hashPassword } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { cleanText, isValidEmail, parseId, safeUrl } from "@/lib/validate";
import { slugify } from "@/lib/utils";

export type ActionResult = { ok: true } | { error: string };

const denied: ActionResult = { error: "دسترسی مجاز نیست." };
const failed: ActionResult = { error: "خطا در انجام عملیات. دوباره تلاش کنید." };

async function requireSuperadmin() {
  const admin = await getCurrentAdmin();
  if (!admin) return null;
  if (admin.role !== "superadmin") return null;
  return admin;
}

/* ─────────────────────────── کسب‌وکارها ─────────────────────────── */

export async function setBusinessStatus(
  businessId: number,
  status: "active" | "suspended" | "rejected",
  reviewNote?: string
): Promise<ActionResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return denied;
  try {
    const [updated] = await db
      .update(businesses)
      .set({ status, reviewNote: cleanText(reviewNote, 500) || null })
      .where(eq(businesses.id, businessId))
      .returning({ id: businesses.id, slug: businesses.slug });
    await logAudit({
      actorType: "admin",
      actorId: admin.id,
      actorName: admin.email,
      action: "business.set_status",
      target: `business:${businessId}`,
      detail: `status=${status}`,
    });
    revalidatePath("/");
    revalidatePath("/search");
    if (updated) revalidatePath(`/business/${updated.slug}`);
    revalidatePath("/admin/dashboard");
    return { ok: true };
  } catch {
    return failed;
  }
}

export async function toggleBusinessFeatured(businessId: number): Promise<ActionResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return denied;
  try {
    await db
      .update(businesses)
      .set({ featured: sql`not ${businesses.featured}` })
      .where(eq(businesses.id, businessId));
    await logAudit({
      actorType: "admin",
      actorId: admin.id,
      actorName: admin.email,
      action: "business.toggle_featured",
      target: `business:${businessId}`,
    });
    revalidatePath("/");
    revalidatePath("/search");
    revalidatePath("/admin/dashboard");
    return { ok: true };
  } catch {
    return failed;
  }
}

export async function toggleBusinessVerified(businessId: number): Promise<ActionResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return denied;
  try {
    await db
      .update(businesses)
      .set({ verified: sql`not ${businesses.verified}` })
      .where(eq(businesses.id, businessId));
    await logAudit({
      actorType: "admin",
      actorId: admin.id,
      actorName: admin.email,
      action: "business.toggle_verified",
      target: `business:${businessId}`,
    });
    revalidatePath("/");
    revalidatePath("/search");
    revalidatePath("/admin/dashboard");
    return { ok: true };
  } catch {
    return failed;
  }
}

/* ─────────────────────────── صاحبان کسب‌وکار ─────────────────────────── */

export async function setOwnerApproved(ownerId: number, approved: boolean): Promise<ActionResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return denied;
  try {
    await db.update(owners).set({ approved }).where(eq(owners.id, ownerId));
    await logAudit({
      actorType: "admin",
      actorId: admin.id,
      actorName: admin.email,
      action: approved ? "owner.approve" : "owner.disapprove",
      target: `owner:${ownerId}`,
    });
    revalidatePath("/admin/dashboard");
    return { ok: true };
  } catch {
    return failed;
  }
}

export async function setOwnerActive(ownerId: number, active: boolean): Promise<ActionResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return denied;
  try {
    await db.update(owners).set({ active }).where(eq(owners.id, ownerId));
    await logAudit({
      actorType: "admin",
      actorId: admin.id,
      actorName: admin.email,
      action: active ? "owner.activate" : "owner.suspend",
      target: `owner:${ownerId}`,
    });
    revalidatePath("/admin/dashboard");
    return { ok: true };
  } catch {
    return failed;
  }
}

/* ─────────────────────────── دسته‌بندی‌ها و شهرها ─────────────────────────── */

export async function createCategory(data: {
  name: string;
  icon: string;
  color: string;
}): Promise<ActionResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return denied;
  const n = cleanText(data.name, 80);
  if (n.length < 2) return { error: "نام دسته خیلی کوتاه است." };
  try {
    const [created] = await db
      .insert(categories)
      .values({
        name: n,
        slug: slugify(n),
        icon: cleanText(data.icon, 40) || "store",
        color: cleanText(data.color, 30) || "emerald",
      })
      .returning({ id: categories.id });
    await logAudit({
      actorType: "admin",
      actorId: admin.id,
      actorName: admin.email,
      action: "category.create",
      target: `category:${created.id}`,
      detail: n,
    });
    revalidatePath("/");
    revalidatePath("/search");
    revalidatePath("/admin/dashboard");
    return { ok: true };
  } catch {
    return failed;
  }
}

export async function updateCategory(
  id: number,
  data: { name: string; icon: string; color: string }
): Promise<ActionResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return denied;
  const n = cleanText(data.name, 80);
  if (n.length < 2) return { error: "نام دسته خیلی کوتاه است." };
  try {
    await db
      .update(categories)
      .set({ name: n, icon: cleanText(data.icon, 40) || "store", color: cleanText(data.color, 30) || "emerald" })
      .where(eq(categories.id, id));
    await logAudit({
      actorType: "admin",
      actorId: admin.id,
      actorName: admin.email,
      action: "category.update",
      target: `category:${id}`,
      detail: n,
    });
    revalidatePath("/");
    revalidatePath("/search");
    revalidatePath("/admin/dashboard");
    return { ok: true };
  } catch {
    return failed;
  }
}

export async function deleteCategory(id: number): Promise<ActionResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return denied;
  try {
    const used = await db
      .select({ id: businesses.id })
      .from(businesses)
      .where(eq(businesses.categoryId, id))
      .limit(1);
    if (used.length > 0) return { error: "این دسته کسب‌وکار دارد و قابل حذف نیست." };
    await db.delete(categories).where(eq(categories.id, id));
    await logAudit({
      actorType: "admin",
      actorId: admin.id,
      actorName: admin.email,
      action: "category.delete",
      target: `category:${id}`,
    });
    revalidatePath("/");
    revalidatePath("/search");
    revalidatePath("/admin/dashboard");
    return { ok: true };
  } catch {
    return failed;
  }
}

export async function createCity(data: {
  name: string;
  province: string;
}): Promise<ActionResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return denied;
  const n = cleanText(data.name, 80);
  if (n.length < 2) return { error: "نام شهر خیلی کوتاه است." };
  try {
    const [created] = await db
      .insert(cities)
      .values({ name: n, slug: slugify(n), province: cleanText(data.province, 80) || null })
      .returning({ id: cities.id });
    await logAudit({
      actorType: "admin",
      actorId: admin.id,
      actorName: admin.email,
      action: "city.create",
      target: `city:${created.id}`,
      detail: n,
    });
    revalidatePath("/");
    revalidatePath("/search");
    revalidatePath("/admin/dashboard");
    return { ok: true };
  } catch {
    return failed;
  }
}

export async function updateCity(
  id: number,
  data: { name: string; province: string }
): Promise<ActionResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return denied;
  const n = cleanText(data.name, 80);
  if (n.length < 2) return { error: "نام شهر خیلی کوتاه است." };
  try {
    await db
      .update(cities)
      .set({ name: n, province: cleanText(data.province, 80) || null })
      .where(eq(cities.id, id));
    await logAudit({
      actorType: "admin",
      actorId: admin.id,
      actorName: admin.email,
      action: "city.update",
      target: `city:${id}`,
      detail: n,
    });
    revalidatePath("/");
    revalidatePath("/search");
    revalidatePath("/admin/dashboard");
    return { ok: true };
  } catch {
    return failed;
  }
}

export async function deleteCity(id: number): Promise<ActionResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return denied;
  try {
    const used = await db
      .select({ id: businesses.id })
      .from(businesses)
      .where(eq(businesses.cityId, id))
      .limit(1);
    if (used.length > 0) return { error: "این شهر کسب‌وکار دارد و قابل حذف نیست." };
    await db.delete(cities).where(eq(cities.id, id));
    await logAudit({
      actorType: "admin",
      actorId: admin.id,
      actorName: admin.email,
      action: "city.delete",
      target: `city:${id}`,
    });
    revalidatePath("/");
    revalidatePath("/search");
    revalidatePath("/admin/dashboard");
    return { ok: true };
  } catch {
    return failed;
  }
}

/* ─────────────────────────── گزارش‌های مردمی ─────────────────────────── */

const REPORT_STATUSES = ["pending", "reviewing", "resolved", "dismissed"] as const;

export async function setReportStatus(
  reportId: number,
  status: string,
  note?: string
): Promise<ActionResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return denied;
  if (!(REPORT_STATUSES as readonly string[]).includes(status)) {
    return { error: "وضعیت نامعتبر است." };
  }
  try {
    await db
      .update(reports)
      .set({ status: status as (typeof REPORT_STATUSES)[number], adminNote: cleanText(note, 500) || null })
      .where(eq(reports.id, reportId));
    await logAudit({
      actorType: "admin",
      actorId: admin.id,
      actorName: admin.email,
      action: "report.set_status",
      target: `report:${reportId}`,
      detail: `status=${status}`,
    });
    revalidatePath("/admin/dashboard");
    return { ok: true };
  } catch {
    return failed;
  }
}

/* ─────────────────────────── پلن‌ها و اشتراک‌ها ─────────────────────────── */

export async function createPlan(data: {
  name: string;
  priceMonthly: number;
  features: string[];
  sortOrder?: number;
}): Promise<ActionResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return denied;
  const n = cleanText(data.name, 80);
  if (n.length < 2) return { error: "نام پلن خیلی کوتاه است." };
  const price = Math.max(0, Math.floor(Number(data.priceMonthly) || 0));
  const feats = (data.features ?? []).map((f) => cleanText(f, 120)).filter(Boolean);
  try {
    const [created] = await db
      .insert(plans)
      .values({
        name: n,
        slug: slugify(n),
        priceMonthly: price,
        features: JSON.stringify(feats),
        sortOrder: Number(data.sortOrder) || 0,
      })
      .returning({ id: plans.id });
    await logAudit({
      actorType: "admin",
      actorId: admin.id,
      actorName: admin.email,
      action: "plan.create",
      target: `plan:${created.id}`,
      detail: n,
    });
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { ok: true };
  } catch {
    return failed;
  }
}

export async function updatePlan(
  id: number,
  data: {
    name: string;
    priceMonthly: number;
    features: string[];
    active?: boolean;
    sortOrder?: number;
  }
): Promise<ActionResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return denied;
  const n = cleanText(data.name, 80);
  if (n.length < 2) return { error: "نام پلن خیلی کوتاه است." };
  const price = Math.max(0, Math.floor(Number(data.priceMonthly) || 0));
  const feats = (data.features ?? []).map((f) => cleanText(f, 120)).filter(Boolean);
  try {
    await db
      .update(plans)
      .set({
        name: n,
        priceMonthly: price,
        features: JSON.stringify(feats),
        active: data.active ?? true,
        sortOrder: Number(data.sortOrder) || 0,
      })
      .where(eq(plans.id, id));
    await logAudit({
      actorType: "admin",
      actorId: admin.id,
      actorName: admin.email,
      action: "plan.update",
      target: `plan:${id}`,
      detail: n,
    });
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { ok: true };
  } catch {
    return failed;
  }
}

export async function deletePlan(id: number): Promise<ActionResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return denied;
  try {
    const used = await db
      .select({ id: subscriptions.id })
      .from(subscriptions)
      .where(eq(subscriptions.planId, id))
      .limit(1);
    if (used.length > 0) return { error: "این پلن اشتراک دارد و قابل حذف نیست." };
    await db.delete(plans).where(eq(plans.id, id));
    await logAudit({
      actorType: "admin",
      actorId: admin.id,
      actorName: admin.email,
      action: "plan.delete",
      target: `plan:${id}`,
    });
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { ok: true };
  } catch {
    return failed;
  }
}

export async function activateSubscription(
  subscriptionId: number,
  months: number
): Promise<ActionResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return denied;
  const m = Math.min(24, Math.max(1, Math.floor(Number(months) || 1)));
  try {
    const start = new Date();
    const end = new Date(start.getTime() + m * 30 * 24 * 60 * 60 * 1000);
    const [sub] = await db
      .update(subscriptions)
      .set({ status: "active", startedAt: start, endsAt: end })
      .where(eq(subscriptions.id, subscriptionId))
      .returning({ businessId: subscriptions.businessId });
    if (sub) {
      await db.update(businesses).set({ hasShowcase: true }).where(eq(businesses.id, sub.businessId));
    }
    await logAudit({
      actorType: "admin",
      actorId: admin.id,
      actorName: admin.email,
      action: "subscription.activate",
      target: `subscription:${subscriptionId}`,
      detail: `months=${m}`,
    });
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { ok: true };
  } catch {
    return failed;
  }
}

export async function cancelSubscription(subscriptionId: number): Promise<ActionResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return denied;
  try {
    const [sub] = await db
      .update(subscriptions)
      .set({ status: "canceled" })
      .where(eq(subscriptions.id, subscriptionId))
      .returning({ businessId: subscriptions.businessId });
    if (sub) {
      await db.update(businesses).set({ hasShowcase: false }).where(eq(businesses.id, sub.businessId));
    }
    await logAudit({
      actorType: "admin",
      actorId: admin.id,
      actorName: admin.email,
      action: "subscription.cancel",
      target: `subscription:${subscriptionId}`,
    });
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return { ok: true };
  } catch {
    return failed;
  }
}

/* ─────────────────────────── طراحان و نمونه‌کارها ─────────────────────────── */

export async function setDesignerApproved(designerId: number, approved: boolean): Promise<ActionResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return denied;
  try {
    await db.update(designers).set({ approved }).where(eq(designers.id, designerId));
    await logAudit({
      actorType: "admin",
      actorId: admin.id,
      actorName: admin.email,
      action: approved ? "designer.approve" : "designer.disapprove",
      target: `designer:${designerId}`,
    });
    revalidatePath("/designers");
    revalidatePath("/admin/dashboard");
    return { ok: true };
  } catch {
    return failed;
  }
}

export async function setPortfolioApproved(portfolioId: number, approved: boolean): Promise<ActionResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return denied;
  try {
    const [item] = await db
      .update(designerPortfolios)
      .set({ approved })
      .where(eq(designerPortfolios.id, portfolioId))
      .returning({ designerId: designerPortfolios.designerId });
    if (item && approved) {
      await db
        .update(designers)
        .set({ points: sql`${designers.points} + 10` })
        .where(eq(designers.id, item.designerId));
    }
    await logAudit({
      actorType: "admin",
      actorId: admin.id,
      actorName: admin.email,
      action: approved ? "portfolio.approve" : "portfolio.reject",
      target: `portfolio:${portfolioId}`,
    });
    revalidatePath("/designers");
    revalidatePath("/admin/dashboard");
    return { ok: true };
  } catch {
    return failed;
  }
}

export async function toggleDesignerFeatured(designerId: number): Promise<ActionResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return denied;
  try {
    await db
      .update(designers)
      .set({ featured: sql`not ${designers.featured}` })
      .where(eq(designers.id, designerId));
    await logAudit({
      actorType: "admin",
      actorId: admin.id,
      actorName: admin.email,
      action: "designer.toggle_featured",
      target: `designer:${designerId}`,
    });
    revalidatePath("/designers");
    revalidatePath("/admin/dashboard");
    return { ok: true };
  } catch {
    return failed;
  }
}

/* ─────────────────────────── معرفی‌ها (رفرال) ─────────────────────────── */

export async function setReferralStatus(
  referralId: number,
  status: "pending" | "qualified" | "paid"
): Promise<ActionResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return denied;
  try {
    await db.update(referrals).set({ status }).where(eq(referrals.id, referralId));
    await logAudit({
      actorType: "admin",
      actorId: admin.id,
      actorName: admin.email,
      action: "referral.set_status",
      target: `referral:${referralId}`,
      detail: `status=${status}`,
    });
    revalidatePath("/admin/dashboard");
    return { ok: true };
  } catch {
    return failed;
  }
}

/* ─────────────────────────── بلاگ ─────────────────────────── */

export async function saveBlogPost(data: {
  id?: number | null;
  title: string;
  excerpt: string;
  content: string;
  coverUrl: string;
  published: boolean;
}): Promise<ActionResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return denied;
  const title = cleanText(data.title, 180);
  if (title.length < 4) return { error: "عنوان مطلب خیلی کوتاه است." };
  const content = cleanText(data.content, 20000);
  if (content.length < 20) return { error: "متن مطلب خیلی کوتاه است." };
  const excerpt = cleanText(data.excerpt, 300) || null;
  const coverUrl = safeUrl(cleanText(data.coverUrl, 500));
  try {
    if (data.id) {
      await db
        .update(blogPosts)
        .set({ title, excerpt, content, coverUrl, published: data.published })
        .where(eq(blogPosts.id, data.id));
      await logAudit({
        actorType: "admin",
        actorId: admin.id,
        actorName: admin.email,
        action: "blog.update",
        target: `blog:${data.id}`,
        detail: title,
      });
    } else {
      const [created] = await db
        .insert(blogPosts)
        .values({
          title,
          slug: slugify(title),
          excerpt,
          content,
          coverUrl,
          published: data.published,
        })
        .returning({ id: blogPosts.id });
      await logAudit({
        actorType: "admin",
        actorId: admin.id,
        actorName: admin.email,
        action: "blog.create",
        target: `blog:${created.id}`,
        detail: title,
      });
    }
    revalidatePath("/blog");
    revalidatePath("/admin/dashboard");
    return { ok: true };
  } catch {
    return failed;
  }
}

export async function deleteBlogPost(id: number): Promise<ActionResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return denied;
  try {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
    await logAudit({
      actorType: "admin",
      actorId: admin.id,
      actorName: admin.email,
      action: "blog.delete",
      target: `blog:${id}`,
    });
    revalidatePath("/blog");
    revalidatePath("/admin/dashboard");
    return { ok: true };
  } catch {
    return failed;
  }
}

/* ─────────────────────────── مدیران ─────────────────────────── */

export async function createAdmin(data: {
  name: string;
  email: string;
  password: string;
  role: string;
}): Promise<ActionResult> {
  const me = await requireSuperadmin();
  if (!me) return { error: "فقط مدیر کل می‌تواند مدیر جدید بسازد." };
  const n = cleanText(data.name, 120);
  const e = cleanText(data.email, 190).toLowerCase();
  if (n.length < 3) return { error: "نام مدیر کوتاه است." };
  if (!isValidEmail(e)) return { error: "ایمیل معتبر نیست." };
  const password = String(data.password ?? "");
  if (password.length < 8 || password.length > 72) {
    return { error: "رمز عبور باید بین ۸ تا ۷۲ کاراکتر باشد." };
  }
  const role = data.role === "operator" ? "operator" : "admin";
  try {
    const existing = await db
      .select({ id: admins.id })
      .from(admins)
      .where(eq(admins.email, e))
      .limit(1);
    if (existing.length > 0) return { error: "این ایمیل قبلاً ثبت شده است." };
    const [created] = await db
      .insert(admins)
      .values({ name: n, email: e, passwordHash: hashPassword(password), role })
      .returning({ id: admins.id });
    await logAudit({
      actorType: "admin",
      actorId: me.id,
      actorName: me.email,
      action: "admin.create",
      target: `admin:${created.id}`,
      detail: `${n} (${e})`,
    });
    revalidatePath("/admin/dashboard");
    return { ok: true };
  } catch {
    return failed;
  }
}

export async function toggleAdminActive(adminId: number): Promise<ActionResult> {
  const me = await requireSuperadmin();
  if (!me) return { error: "فقط مدیر کل می‌تواند مدیران را مدیریت کند." };
  try {
    await db
      .update(admins)
      .set({ active: sql`not ${admins.active}` })
      .where(eq(admins.id, adminId));
    await logAudit({
      actorType: "admin",
      actorId: me.id,
      actorName: me.email,
      action: "admin.toggle_active",
      target: `admin:${adminId}`,
    });
    revalidatePath("/admin/dashboard");
    return { ok: true };
  } catch {
    return failed;
  }
}

export async function resetAdminTotp(adminId: number): Promise<ActionResult> {
  const me = await requireSuperadmin();
  if (!me) return { error: "فقط مدیر کل می‌تواند 2FA را مدیریت کند." };
  try {
    await db
      .update(admins)
      .set({ totpEnabled: false, totpSecret: null })
      .where(eq(admins.id, adminId));
    await logAudit({
      actorType: "admin",
      actorId: me.id,
      actorName: me.email,
      action: "admin.reset_totp",
      target: `admin:${adminId}`,
    });
    revalidatePath("/admin/dashboard");
    return { ok: true };
  } catch {
    return failed;
  }
}

/* ───────────────────── احراز دومرحله‌ای (خودِ مدیر) ───────────────────── */

export async function issueTotpSetup(): Promise<ActionResult & { secret?: string }> {
  const admin = await getCurrentAdmin();
  if (!admin) return denied;
  try {
    const { generateTotpSecret } = await import("@/lib/otp");
    const secret = generateTotpSecret();
    await db
      .update(admins)
      .set({ totpSecret: secret, totpEnabled: false })
      .where(eq(admins.id, admin.id));
    await logAudit({
      actorType: "admin",
      actorId: admin.id,
      actorName: admin.email,
      action: "admin.totp_setup",
      target: `admin:${admin.id}`,
    });
    return { ok: true, secret };
  } catch {
    return failed;
  }
}

export async function confirmTotpSetup(code: string): Promise<ActionResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return denied;
  if (!admin.totpSecret) return { error: "ابتدا درخواست فعال‌سازی بدهید." };
  try {
    const { verifyTotp } = await import("@/lib/otp");
    if (!(await verifyTotp(cleanText(code, 10), admin.totpSecret))) {
      return { error: "کد نادرست است." };
    }
    await db.update(admins).set({ totpEnabled: true }).where(eq(admins.id, admin.id));
    await logAudit({
      actorType: "admin",
      actorId: admin.id,
      actorName: admin.email,
      action: "admin.totp_enabled",
      target: `admin:${admin.id}`,
    });
    return { ok: true };
  } catch {
    return failed;
  }
}

export async function disableMyTotp(): Promise<ActionResult> {
  const admin = await getCurrentAdmin();
  if (!admin) return denied;
  try {
    await db
      .update(admins)
      .set({ totpEnabled: false, totpSecret: null })
      .where(eq(admins.id, admin.id));
    await logAudit({
      actorType: "admin",
      actorId: admin.id,
      actorName: admin.email,
      action: "admin.totp_disabled",
      target: `admin:${admin.id}`,
    });
    return { ok: true };
  } catch {
    return failed;
  }
}
