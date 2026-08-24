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
 * دسته‌بندی خدمات (نوع کسب‌وکار)
 */
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 80 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  icon: varchar("icon", { length: 60 }).notNull().default("store"),
  color: varchar("color", { length: 30 }).notNull().default("primary"),
});

/**
 * شهرها
 */
export const cities = pgTable("cities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 80 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  province: varchar("province", { length: 80 }),
});

/**
 * صاحبان کسب‌وکار (پنل کاربری)
 */
export const owners = pgTable("owners", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  phone: varchar("phone", { length: 40 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  approved: boolean("approved").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * کسب‌وکارها — رکورد اصلی معرفی
 * وضعیت‌ها (جواز، اتحادیه، ضمانت، ویترین) صرفاً بر اساس اظهار خود کسب‌وکار است.
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
  ownerId: integer("owner_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * آیتم‌های ویترین حرفه‌ای (عکس / محصول با قیمت)
 */
export const showcaseItems = pgTable("showcase_items", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  type: varchar("type", { length: 20 }).notNull().default("photo"),
  title: varchar("title", { length: 160 }).notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  price: varchar("price", { length: 60 }),
  unit: varchar("unit", { length: 40 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
