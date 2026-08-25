-- کسب‌یاب / KasbYab
-- Run once in Supabase SQL Editor on a new project.
-- Demo rows are inserted by: DATABASE_URL=... npm run db:seed

create table if not exists categories (
  id serial primary key,
  name varchar(80) not null,
  slug varchar(100) not null unique,
  icon varchar(60) not null default 'store',
  color varchar(30) not null default 'primary'
);

create table if not exists cities (
  id serial primary key,
  name varchar(80) not null,
  slug varchar(100) not null unique,
  province varchar(80)
);

create table if not exists owners (
  id serial primary key,
  name varchar(120) not null,
  phone varchar(40) not null unique,
  password_hash text not null,
  approved boolean not null default false,
  active boolean not null default true,
  created_at timestamp not null default now()
);

create table if not exists businesses (
  id serial primary key,
  name varchar(120) not null,
  slug varchar(160) not null unique,
  category_id integer not null,
  city_id integer not null,
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
  has_license boolean not null default false,
  union_member boolean not null default false,
  has_guarantee boolean not null default false,
  has_showcase boolean not null default false,
  rating integer not null default 0,
  review_count integer not null default 0,
  featured boolean not null default false,
  verified boolean not null default false,
  status varchar(20) not null default 'pending',
  review_note text,
  owner_id integer,
  created_at timestamp not null default now()
);

create table if not exists showcase_items (
  id serial primary key,
  business_id integer not null,
  type varchar(20) not null default 'photo',
  title varchar(160) not null,
  description text,
  image_url text,
  video_url text,
  price varchar(60),
  unit varchar(40),
  created_at timestamp not null default now()
);

create table if not exists admins (
  id serial primary key,
  name varchar(120) not null,
  email varchar(160) not null unique,
  password_hash text not null,
  role varchar(30) not null default 'admin',
  totp_secret text,
  totp_enabled boolean not null default false,
  active boolean not null default true,
  last_login_at timestamp,
  created_at timestamp not null default now()
);

create table if not exists business_reports (
  id serial primary key,
  business_id integer not null,
  reporter_name varchar(120),
  reporter_phone varchar(40),
  category varchar(40) not null,
  message text,
  status varchar(30) not null default 'pending',
  admin_note text,
  created_at timestamp not null default now(),
  resolved_at timestamp
);

create table if not exists orders (
  id serial primary key,
  order_number varchar(32) not null unique,
  business_id integer not null,
  item_id integer,
  item_title varchar(160),
  unit_price integer,
  total_amount integer,
  customer_name varchar(120) not null,
  customer_phone varchar(40) not null,
  customer_email varchar(160),
  service varchar(180) not null,
  quantity integer not null default 1,
  requested_date varchar(20),
  preferred_time varchar(40),
  delivery_address text,
  note text,
  status varchar(30) not null default 'pending',
  owner_note text,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);

create table if not exists plans (
  id serial primary key,
  name varchar(120) not null,
  slug varchar(100) not null unique,
  price_monthly integer not null default 0,
  features text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamp not null default now()
);

create table if not exists subscriptions (
  id serial primary key,
  business_id integer not null,
  plan_id integer not null,
  status varchar(30) not null default 'pending',
  started_at timestamp,
  ends_at timestamp,
  created_at timestamp not null default now()
);

create table if not exists designers (
  id serial primary key,
  name varchar(120) not null,
  phone varchar(40) not null unique,
  password_hash text not null,
  slug varchar(140) not null unique,
  bio text,
  avatar_url text,
  referral_code varchar(40) not null unique,
  points integer not null default 0,
  approved boolean not null default false,
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamp not null default now()
);

create table if not exists designer_portfolios (
  id serial primary key,
  designer_id integer not null,
  title varchar(160) not null,
  image_url text,
  approved boolean not null default false,
  points integer not null default 10,
  created_at timestamp not null default now()
);

create table if not exists referrals (
  id serial primary key,
  designer_id integer not null,
  business_id integer not null,
  subscription_id integer,
  status varchar(30) not null default 'pending',
  commission_rate integer not null default 10,
  created_at timestamp not null default now()
);

create table if not exists audit_logs (
  id serial primary key,
  actor_type varchar(30) not null default 'admin',
  actor_id integer,
  actor_name varchar(140),
  action varchar(80) not null,
  target varchar(80),
  detail text,
  ip varchar(60),
  created_at timestamp not null default now()
);

create table if not exists blog_posts (
  id serial primary key,
  title varchar(180) not null,
  slug varchar(180) not null unique,
  excerpt varchar(300),
  content text,
  cover_url text,
  published boolean not null default false,
  created_at timestamp not null default now()
);

create index if not exists businesses_status_city_idx on businesses (status, city_id);
create index if not exists businesses_status_category_idx on businesses (status, category_id);
create index if not exists orders_business_created_idx on orders (business_id, created_at desc);
create index if not exists orders_status_idx on orders (status);
create index if not exists showcase_items_business_idx on showcase_items (business_id, created_at desc);

-- The application uses a server-side DATABASE_URL and does not expose these
-- tables through the browser. Keep the Supabase service/secret key server-only.
