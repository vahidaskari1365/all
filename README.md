# کسب‌یاب (KasbYab) — MVP با معماری مصوب

سامانه جست‌وجوی کسب‌وکارهای محلی با **اشتراک، کارت ویزیت پویا (QR)، پنل مالک/طراح/مدیر**.

## معماری (مطابق مصوبه کارفرما)

| لایه | تکنولوژی |
|---|---|
| رابط کاربری | Next.js + TypeScript (`src/` — نمونه تأییدشده؛ اتصال کامل به API در فاز F1) |
| بک‌اند | **Laravel + PHP 8.3** (`backend/`) — REST API با Sanctum |
| دیتابیس | **PostgreSQL + PostGIS** (جست‌وجوی شعاعی مکانی) |
| کش/صف/سشن | **Redis** |

```
backend/                 ← Laravel 13 (PHP 8.3): API کامل MVP + تست‌های Feature
docs/                    ← محدوده MVP، معیارهای پذیرش، ماتریس آزمون‌پذیری، استقرار/بکاپ
src/                     ← نمونه رابط کاربری Next.js (تأیید طراحی توسط کارفرما)
docker-compose.yml       ← استک کامل: postgres+postgis / redis / backend / frontend
ops/                     ← اسکریپت پشتیبان‌گیری و cron
.github/workflows/ci.yml ← CI: تست بک‌اند روی PostgreSQL+PostGIS واقعی + بیلد فرانت
```

## اجرای سریع با Docker (توصیه‌شده)

```bash
cp backend/.env.example backend/.env     # در صورت نیاز SMS_DRIVER/KAVENEGAR_API_KEY را تنظیم کنید
docker compose up -d --build
docker compose exec backend php artisan key:generate
docker compose exec backend php artisan migrate --force
docker compose exec backend php artisan db:seed --force   # فقط بار اول

# بک‌اند:  http://localhost:8000/up        فرانت:  http://localhost:3000
```

## اجرای توسعه بدون Docker

**بک‌اند** (نیازمند PHP 8.3، PostgreSQL+PostGIS، Redis — در توسعه سبک Redis اختیاری است):

```bash
cd backend
cp .env.example .env            # DB را به PostgreSQL+PostGIS محلی وصل کنید
composer install
php artisan key:generate
php artisan migrate --force
php artisan db:seed --force
php artisan serve               # http://localhost:8000
php artisan test                # تست‌های Feature روی PostgreSQL+PostGIS
```

**فرانت‌اند:**

```bash
npm install
npm run dev                     # http://localhost:3000
```

## مستندات کلیدی

- [`docs/scope-mvp.md`](docs/scope-mvp.md) — **محدوده مکتوب MVP** (پاسخ به ۸ بند درخواست کارفرما + زمان‌بندی و پرداخت مرحله‌ای)
- [`docs/acceptance-criteria.md`](docs/acceptance-criteria.md) — معیارهای پذیرش قابل آزمون هر مرحله
- [`docs/testability-matrix.md`](docs/testability-matrix.md) — شفاف‌سازی: چه چیزی واقعاً به بک‌اند متصل است و چه چیزی نمایشی
- [`docs/deployment-rollback.md`](docs/deployment-rollback.md) — استقرار، پشتیبان‌گیری، بازگشت نسخه
- [`docs/ownership.md`](docs/ownership.md) — مالکیت مخزن خصوصی

## کاربران نمونه (پس از seed)

| نقش | شماره موبایل | ورود |
|---|---|---|
| مدیر | `09120000000` | OTP (`SMS_DRIVER=log` → کد در `sms_logs` / پاسخ dev) |
| طراح | `09120000001` | کد معرف: `DEMO2024` |
| مالک | `09120000002` | OTP |

## API نمونه

```bash
# درخواست کد (در حالت dev کد در پاسخ برگردانده می‌شود)
curl -X POST localhost:8000/api/v1/auth/otp/request -H 'Content-Type: application/json' \
     -d '{"phone":"09121111111"}'

# جست‌وجوی شعاعی PostGIS (نزدیک‌ترین کسب‌وکارها به یک نقطه در تهران)
curl "localhost:8000/api/v1/businesses/search?lat=35.6997&lng=51.3380&radius=3000"
```

مستندات تعاملی OpenAPI پس از نصب کامل در `/docs/api` (بسته Scramble).
