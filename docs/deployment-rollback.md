# استقرار، پشتیبان‌گیری و بازگشت نسخه

## استقرار با Docker (توصیه‌شده برای MVP)
```bash
cp backend/.env.example backend/.env   # مقادیر تولیدی را تنظیم کنید
docker compose up -d --build
docker compose exec backend php artisan key:generate
docker compose exec backend php artisan migrate --force
docker compose exec backend php artisan db:seed --force   # فقط بار اول
```
سرویس‌ها: `postgres` (postgis/postgis:16)، `redis` (redis:7)، `backend` (php:8.3 + pdo_pgsql/redis/opcache)، `frontend` (Next.js).

### استقرار بدون Docker (اختیاری)
nginx + php-fpm 8.3 + PostgreSQL 16/17 با پسوند postgis + Redis؛ `QUEUE_CONNECTION=redis` و اجرای
`php artisan schedule:work` (یا cron: `* * * * * php artisan schedule:run`) برای پایان خودکار اشتراک و یادآوری‌ها.

## متغیرهای حساس تولیدی
`APP_KEY`, `DB_PASSWORD`, `REDIS_PASSWORD`, `SMS_DRIVER=kavenegar`, `KAVENEGAR_API_KEY`, `SMS_FAKE_MODE=false`, `FRONTEND_URL`, `APP_ENV=production`, `APP_DEBUG=false`.

## پشتیبان‌گیری
- شبانه: `docker compose exec -T postgres pg_dump -U kasbyab kasbyab | gzip > backups/kasbyab-$(date +%F).sql.gz`
- فایل‌های آپلودی (رسیدها/طرح چاپی): `tar czf backups/storage-$(date +%F).tgz backend/storage/app`
- نگهداری ۳۰ روز + یک نسخه ماهانه بیرون از سرور.
- اسکریپت آماده: `ops/backup.sh` + نمونه cron در `ops/crontab.example`.

## بازگردانی
```bash
gunzip -c backups/kasbyab-2026-01-01.sql.gz | docker compose exec -T postgres psql -U kasbyab kasbyab
```

## بازگشت نسخه (Rollback)
1. `git checkout <tag-version>` (تگ‌گذاری هر انتشار: v0.1.0، ...)
2. `docker compose up -d --build backend frontend`
3. در صورت مایگریشن مخرب: `php artisan migrate:rollback --step=1` (مایگریشن‌ها همیشه باید down امن داشته باشند).
4. در صورت خرابی داده: بازگردانی آخرین dump مرحله قبل.
