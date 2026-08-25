import { NextResponse } from "next/server";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  hashPassword,
  setAdminSession,
  signToken,
  verifyPassword,
  verifyToken,
} from "@/lib/auth";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { cleanText, isValidEmail } from "@/lib/validate";
import { logAudit } from "@/lib/audit";
import { verifyTotp } from "@/lib/otp";

export const dynamic = "force-dynamic";

const ip = (request: Request) =>
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined;

/**
 * اگر دیتابیس migrate شده باشد اما هنوز مدیر نداشته باشد، مدیر اولیه با
 * ADMIN_EMAIL و ADMIN_PASSWORD محیط ساخته می‌شود. این مسیر فقط وقتی فعال است
 * که هر دو متغیر تنظیم شده باشند و جدول مدیران کاملاً خالی باشد.
 */
async function findOrProvisionAdmin(email: string, password: string) {
  const [existing] = await db
    .select()
    .from(admins)
    .where(eq(admins.email, email))
    .limit(1);
  if (existing) return existing;

  const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredEmail || !configuredPassword || email !== configuredEmail || password !== configuredPassword) {
    return null;
  }

  const [anyAdmin] = await db.select({ id: admins.id }).from(admins).limit(1);
  if (anyAdmin) return null;

  const [created] = await db
    .insert(admins)
    .values({
      name: "مدیر کل سامانه",
      email: configuredEmail,
      passwordHash: hashPassword(configuredPassword),
      role: "superadmin",
      active: true,
    })
    .returning();
  return created ?? null;
}

/**
 * ورود مدیریت — دومرحله‌ای:
 * مرحله ۱: ایمیل + رمز → توکن چالشِ امضاشده (۵ دقیقه اعتبار)
 * مرحله ۲: کد TOTP (اگر 2FA فعال باشد) → سشن نهایی
 */
export async function POST(request: Request) {
  const rl = rateLimit(clientKey(request, "admin-login"), {
    limit: 8,
    windowMs: 15 * 60 * 1000,
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `تلاش‌های ناموفق زیاد است. ${rl.retryAfterSec} ثانیه دیگر دوباره تلاش کنید.` },
      { status: 429 }
    );
  }

  let body: {
    step?: string;
    email?: string;
    password?: string;
    code?: string;
    challenge?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const step = body.step === "verify" ? "verify" : "credentials";

  try {
    if (step === "verify") {
      const code = cleanText(body.code, 10);
      const challenge = String(body.challenge ?? "");
      const payload = verifyToken<{ aid: number }>(challenge);
      if (!payload || !payload.aid || !/^\d{6}$/.test(code)) {
        return NextResponse.json(
          { error: "کد نامعتبر یا منقضی است. دوباره وارد شوید." },
          { status: 401 }
        );
      }
      const [admin] = await db
        .select()
        .from(admins)
        .where(eq(admins.id, payload.aid))
        .limit(1);
      if (!admin || !admin.active) {
        return NextResponse.json({ error: "حساب غیرفعال است." }, { status: 403 });
      }
      if (!admin.totpEnabled || !admin.totpSecret) {
        return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
      }
      if (!(await verifyTotp(code, admin.totpSecret))) {
        await logAudit({
          actorType: "admin",
          actorName: admin.email,
          action: "admin.totp_failed",
          target: `admin:${admin.id}`,
          ip: ip(request),
        });
        return NextResponse.json({ error: "کد دومرحله‌ای نادرست است." }, { status: 401 });
      }
      await setAdminSession(admin.id, true);
      await logAudit({
        actorType: "admin",
        actorId: admin.id,
        actorName: admin.email,
        action: "admin.login",
        target: `admin:${admin.id}`,
        ip: ip(request),
      });
      return NextResponse.json({ ok: true });
    }

    const email = cleanText(body.email, 190).toLowerCase();
    const password = String(body.password ?? "");
    if (!isValidEmail(email) || !password) {
      return NextResponse.json(
        { error: "ایمیل و رمز عبور را وارد کنید." },
        { status: 400 }
      );
    }

    const admin = await findOrProvisionAdmin(email, password);
    if (!admin || !verifyPassword(password, admin.passwordHash)) {
      if (admin) {
        await logAudit({
          actorType: "admin",
          actorName: email,
          action: "admin.login_failed",
          target: `admin:${email}`,
          ip: ip(request),
        });
      }
      return NextResponse.json(
        { error: "ایمیل یا رمز عبور نادرست است." },
        { status: 401 }
      );
    }
    if (!admin.active) {
      return NextResponse.json({ error: "حساب شما غیرفعال است." }, { status: 403 });
    }

    if (admin.totpEnabled && admin.totpSecret) {
      const challenge = signToken({ aid: admin.id, exp: Date.now() + 5 * 60 * 1000 });
      return NextResponse.json({ ok: true, needTotp: true, challenge });
    }

    await setAdminSession(admin.id, true);
    await logAudit({
      actorType: "admin",
      actorId: admin.id,
      actorName: admin.email,
      action: "admin.login",
      target: `admin:${admin.id}`,
      ip: ip(request),
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin-login] database operation failed", error);
    return NextResponse.json(
      { error: "اتصال دیتابیس آماده نیست. ابتدا migration و seed را روی Supabase اجرا کنید." },
      { status: 503 }
    );
  }
}
