import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * ─────────────────────────────────────────────────────────────
 * کسب‌یاب — اسکیمای دیتابیس
 * فازبندی فقط در «فعال‌سازی امکانات» است؛ زیرساخت داده از ابتدا کامل
 * طراحی شده تا فازهای بعدی (پورسانت، رتبه‌بندی، ویدئو و …) نیاز به
 * بازطراحی نداشته باشد.
 * ─────────────────────────────────────────────────────────────
 */

/** دسته‌بندی خدمات (نوع کسب‌وکار) */
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 80 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  icon: varchar("icon", { length: 60 }).notNull().default("store"),
  color: varchar("color", { length: 30 }).notNull().default("primary"),
});

/** شهرها */
export const cities = pgTable("cities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 80 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  province: varchar("province", { length: 80 }),
});

/** صاحبان کسب‌وکار (پنل کاربری) */
export const owners = pgTable("owners", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  phone: varchar("phone", { length: 40 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  approved: boolean("approved").notNull().default(false),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * کسب‌وکارها — رکورد اصلی معرفی
 * وضعیت‌های اظهاری (جواز، اتحادیه، ضمانت، ویترین) صرفاً بر اساس
 * اعلام خود کسب‌وکار است و با برچسب شفاف نمایش داده می‌شود.
 * status: pending → در انتظار تأیید مدیریت | active | suspended | rejected
 */
export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  categoryId: integer("category_id").notNull(),
  cityId: integer("city_id").notNull(),
  district: varchar("district", { length: 120 }),
  tagline: varchar("tagline", { length: 220 }),
  description: text("description"),
  address: text("address"),
  phone: varchar("phone", { length: 40 }),
  mobile: varchar("mobile", { length: 40 }),
  email: varchar("email", { length: 120 }),
  website: varchar("website", { length: 160 }),
  logoUrl: text("logo_url"),
  coverUrl: text("cover_url"),
  lat: varchar("lat", { length: 30 }),
  lng: varchar("lng", { length: 30 }),
  instagram: varchar("instagram", { length: 160 }),
  telegram: varchar("telegram", { length: 160 }),
  whatsapp: varchar("whatsapp", { length: 40 }),
  workHours: varchar("work_hours", { length: 200 }),
  // بر اساس اظهار خود کسب‌وکار
  hasLicense: boolean("has_license").notNull().default(false),
  unionMember: boolean("union_member").notNull().default(false),
  hasGuarantee: boolean("has_guarantee").notNull().default(false),
  hasShowcase: boolean("has_showcase").notNull().default(false),
  rating: integer("rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
  verified: boolean("verified").notNull().default(false),
  // وضعیت تأیید توسط مدیریت
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  // یادداشت مدیریت (دلیل رد/تعلیق — قابل نمایش به صاحب کسب‌وکار)
  reviewNote: text("review_note"),
  ownerId: integer("owner_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** آیتم‌های ویترین حرفه‌ای (عکس / محصول با قیمت / ویدئو) */
export const showcaseItems = pgTable("showcase_items", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  type: varchar("type", { length: 20 }).notNull().default("photo"),
  title: varchar("title", { length: 160 }).notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  // برای ویدئو: URL اِمبد (آپارات و …) — زیرساخت فاز دوم
  videoUrl: text("video_url"),
  price: varchar("price", { length: 60 }),
  unit: varchar("unit", { length: 40 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** مدیران سامانه */
export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 160 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  // superadmin | admin | operator
  role: varchar("role", { length: 30 }).notNull().default("admin"),
  totpSecret: text("totp_secret"),
  totpEnabled: boolean("totp_enabled").notNull().default(false),
  active: boolean("active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** گزارش‌های مردمی درباره اطلاعات کسب‌وکارها */
export const reports = pgTable("business_reports", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  reporterName: varchar("reporter_name", { length: 120 }),
  reporterPhone: varchar("reporter_phone", { length: 40 }),
  // wrong-info | closed | duplicate | other
  category: varchar("category", { length: 40 }).notNull(),
  message: text("message"),
  // pending | reviewing | resolved | dismissed
  status: varchar("status", { length: 30 }).notNull().default("pending"),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

/** پلن‌های اشتراک (ویترین حرفه‌ای) */
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  priceMonthly: integer("price_monthly").notNull().default(0),
  // JSON آرایه‌ای از امکانات
  features: text("features"),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** اشتراک‌های کسب‌وکارها */
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  planId: integer("plan_id").notNull(),
  // pending | active | expired | canceled
  status: varchar("status", { length: 30 }).notNull().default("pending"),
  startedAt: timestamp("started_at"),
  endsAt: timestamp("ends_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** طراحان کارت‌ویزیت */
export const designers = pgTable("designers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  phone: varchar("phone", { length: 40 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  slug: varchar("slug", { length: 140 }).notNull().unique(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  referralCode: varchar("referral_code", { length: 40 }).notNull().unique(),
  points: integer("points").notNull().default(0),
  approved: boolean("approved").notNull().default(false),
  featured: boolean("featured").notNull().default(false),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** نمونه‌کارهای طراحان */
export const designerPortfolios = pgTable("designer_portfolios", {
  id: serial("id").primaryKey(),
  designerId: integer("designer_id").notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  imageUrl: text("image_url"),
  approved: boolean("approved").notNull().default(false),
  points: integer("points").notNull().default(10),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * معرفی‌ها (رفرال) — ارتباط طراح ← کسب‌وکار از ابتدا ثبت می‌شود
 * تا پورسانت فاز بعدی بدون بازطراحی قابل محاسبه باشد.
 */
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  designerId: integer("designer_id").notNull(),
  businessId: integer("business_id").notNull(),
  subscriptionId: integer("subscription_id"),
  // pending | qualified | paid
  status: varchar("status", { length: 30 }).notNull().default("pending"),
  commissionRate: integer("commission_rate").notNull().default(10),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** سوابق مهم مدیریتی (Audit Log) */
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  // admin | owner | system
  actorType: varchar("actor_type", { length: 30 }).notNull().default("admin"),
  actorId: integer("actor_id"),
  actorName: varchar("actor_name", { length: 140 }),
  action: varchar("action", { length: 80 }).notNull(),
  target: varchar("target", { length: 80 }),
  detail: text("detail"),
  ip: varchar("ip", { length: 60 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** مطالب بلاگ */
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  excerpt: varchar("excerpt", { length: 300 }),
  content: text("content"),
  coverUrl: text("cover_url"),
  published: boolean("published").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
