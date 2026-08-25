/**
 * مهاجرت‌های دیتابیس — ایمن و تکرارپذیر (Idempotent)
 * هم روی PostgreSQL واقعی و هم روی PGlite (توسعه) قابل اجراست.
 *
 * اجرا: npm run db:migrate
 */
import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "../src/db";

const DDL = [
  // ── دسته‌بندی‌ها و شهرها ──
  sql`CREATE TABLE IF NOT EXISTS categories (
    id serial PRIMARY KEY,
    name varchar(80) NOT NULL,
    slug varchar(100) NOT NULL UNIQUE,
    icon varchar(60) NOT NULL DEFAULT 'store',
    color varchar(30) NOT NULL DEFAULT 'primary'
  )`,
  sql`CREATE TABLE IF NOT EXISTS cities (
    id serial PRIMARY KEY,
    name varchar(80) NOT NULL,
    slug varchar(100) NOT NULL UNIQUE,
    province varchar(80)
  )`,
  // ── صاحبان کسب‌وکار ──
  sql`CREATE TABLE IF NOT EXISTS owners (
    id serial PRIMARY KEY,
    name varchar(120) NOT NULL,
    phone varchar(40) NOT NULL UNIQUE,
    password_hash text NOT NULL,
    approved boolean NOT NULL DEFAULT false,
    active boolean NOT NULL DEFAULT true,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  // ── کسب‌وکارها ──
  sql`CREATE TABLE IF NOT EXISTS businesses (
    id serial PRIMARY KEY,
    name varchar(120) NOT NULL,
    slug varchar(160) NOT NULL UNIQUE,
    category_id integer NOT NULL,
    city_id integer NOT NULL,
    district varchar(120),
    tagline varchar(220),
    description text,
    address text,
    phone varchar(40),
    mobile varchar(40),
    email varchar(120),
    website varchar(160),
    logo_url text,
    cover_url text,
    lat varchar(30),
    lng varchar(30),
    instagram varchar(160),
    telegram varchar(160),
    whatsapp varchar(40),
    work_hours varchar(200),
    has_license boolean NOT NULL DEFAULT false,
    union_member boolean NOT NULL DEFAULT false,
    has_guarantee boolean NOT NULL DEFAULT false,
    has_showcase boolean NOT NULL DEFAULT false,
    rating integer NOT NULL DEFAULT 0,
    review_count integer NOT NULL DEFAULT 0,
    featured boolean NOT NULL DEFAULT false,
    verified boolean NOT NULL DEFAULT false,
    status varchar(20) NOT NULL DEFAULT 'pending',
    review_note text,
    owner_id integer,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  // ── آیتم‌های ویترین ──
  sql`CREATE TABLE IF NOT EXISTS showcase_items (
    id serial PRIMARY KEY,
    business_id integer NOT NULL,
    type varchar(20) NOT NULL DEFAULT 'photo',
    title varchar(160) NOT NULL,
    description text,
    image_url text,
    video_url text,
    price varchar(60),
    unit varchar(40),
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  // ── مدیران ──
  sql`CREATE TABLE IF NOT EXISTS admins (
    id serial PRIMARY KEY,
    name varchar(120) NOT NULL,
    email varchar(160) NOT NULL UNIQUE,
    password_hash text NOT NULL,
    role varchar(30) NOT NULL DEFAULT 'admin',
    totp_secret text,
    totp_enabled boolean NOT NULL DEFAULT false,
    active boolean NOT NULL DEFAULT true,
    last_login_at timestamp,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  // ── گزارش‌های مردمی ──
  sql`CREATE TABLE IF NOT EXISTS business_reports (
    id serial PRIMARY KEY,
    business_id integer NOT NULL,
    reporter_name varchar(120),
    reporter_phone varchar(40),
    category varchar(40) NOT NULL,
    message text,
    status varchar(30) NOT NULL DEFAULT 'pending',
    admin_note text,
    created_at timestamp NOT NULL DEFAULT now(),
    resolved_at timestamp
  )`,
  // ── پلن‌ها و اشتراک‌ها ──
  sql`CREATE TABLE IF NOT EXISTS plans (
    id serial PRIMARY KEY,
    name varchar(120) NOT NULL,
    slug varchar(100) NOT NULL UNIQUE,
    price_monthly integer NOT NULL DEFAULT 0,
    features text,
    active boolean NOT NULL DEFAULT true,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  sql`CREATE TABLE IF NOT EXISTS subscriptions (
    id serial PRIMARY KEY,
    business_id integer NOT NULL,
    plan_id integer NOT NULL,
    status varchar(30) NOT NULL DEFAULT 'pending',
    started_at timestamp,
    ends_at timestamp,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  // ── طراحان و نمونه‌کارها ──
  sql`CREATE TABLE IF NOT EXISTS designers (
    id serial PRIMARY KEY,
    name varchar(120) NOT NULL,
    phone varchar(40) NOT NULL UNIQUE,
    password_hash text NOT NULL,
    slug varchar(140) NOT NULL UNIQUE,
    bio text,
    avatar_url text,
    referral_code varchar(40) NOT NULL UNIQUE,
    points integer NOT NULL DEFAULT 0,
    approved boolean NOT NULL DEFAULT false,
    featured boolean NOT NULL DEFAULT false,
    active boolean NOT NULL DEFAULT true,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  sql`CREATE TABLE IF NOT EXISTS designer_portfolios (
    id serial PRIMARY KEY,
    designer_id integer NOT NULL,
    title varchar(160) NOT NULL,
    image_url text,
    approved boolean NOT NULL DEFAULT false,
    points integer NOT NULL DEFAULT 10,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  sql`CREATE TABLE IF NOT EXISTS referrals (
    id serial PRIMARY KEY,
    designer_id integer NOT NULL,
    business_id integer NOT NULL,
    subscription_id integer,
    status varchar(30) NOT NULL DEFAULT 'pending',
    commission_rate integer NOT NULL DEFAULT 10,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  // ── سوابق مدیریتی ──
  sql`CREATE TABLE IF NOT EXISTS audit_logs (
    id serial PRIMARY KEY,
    actor_type varchar(30) NOT NULL DEFAULT 'admin',
    actor_id integer,
    actor_name varchar(140),
    action varchar(80) NOT NULL,
    target varchar(80),
    detail text,
    ip varchar(60),
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  // ── بلاگ ──
  sql`CREATE TABLE IF NOT EXISTS blog_posts (
    id serial PRIMARY KEY,
    title varchar(180) NOT NULL,
    slug varchar(180) NOT NULL UNIQUE,
    excerpt varchar(300),
    content text,
    cover_url text,
    published boolean NOT NULL DEFAULT false,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
];

async function main() {
  console.log("[migrate] applying", DDL.length, "steps…");
  for (const stmt of DDL) {
    await db.execute(stmt);
  }
  console.log("[migrate] done ✓");
  process.exit(0);
}

main().catch((err) => {
  console.error("[migrate] failed:", err);
  process.exit(1);
});
