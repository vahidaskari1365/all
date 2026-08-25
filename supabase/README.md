# راه‌اندازی Supabase

1. در Supabase از مسیر **Connect**، URI اتصال PostgreSQL را بردارید. برای Vercel معمولاً Transaction pooler انتخاب مناسب‌تری است.
2. مقدار URI را به‌صورت `DATABASE_URL` در `.env` محلی و Environment Variables پروژه Vercel قرار دهید. اگر رمز شامل `@`، `#` یا `!` است، آن را URL-encode کنید.
3. یکی از این دو روش را اجرا کنید:

```bash
# روش پیشنهادی از ریشه پروژه
DATABASE_URL="postgresql://..." npm run db:migrate

# فقط روی دیتابیس خالی، برای داده‌های نمونه
DATABASE_URL="postgresql://..." ADMIN_EMAIL="admin@example.com" ADMIN_PASSWORD="رمز-قوی-حداقل-۸-کاراکتر" DEMO_OWNER_PASSWORD="رمز-نمونه-قوی" npm run db:seed
```

یا محتوای `schema.sql` را در **SQL Editor** اجرا کنید و سپس seed را برای داده‌های دمو اجرا کنید. فایل seed داده‌های قبلی را پاک می‌کند؛ روی دیتابیس واقعیِ دارای داده اجرا نکنید.

برنامه از Drizzle روی PostgreSQL استفاده می‌کند و کلیدهای Supabase را در مرورگر لازم ندارد. `sb_secret` یا service key را هرگز در Git، `NEXT_PUBLIC_*` یا کد کلاینت قرار ندهید.
