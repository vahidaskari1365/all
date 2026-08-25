import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/db";
import { admins, owners } from "@/db/schema";
import { eq } from "drizzle-orm";

// در توسعه اگر env تنظیم نشده باشد، یک کلید فقط برای همین اجرای فرایند ساخته می‌شود؛
// در production وجود AUTH_SECRET الزامی است و کلید پیش‌فرض ثابتی وجود ندارد.
const RUNTIME_DEV_SECRET = randomBytes(32).toString("hex");
function getAuthSecret() {
  const configured = process.env.AUTH_SECRET?.trim();
  if (configured) return configured;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET is required in production");
  }
  return RUNTIME_DEV_SECRET;
}

const OWNER_COOKIE = "kasbyab_session";
const ADMIN_COOKIE = "kasbyab_admin_session";
const OWNER_MAX_AGE = 60 * 60 * 24 * 14; // ۱۴ روز
const ADMIN_MAX_AGE = 60 * 60 * 12; // ۱۲ ساعت

/** هش رمز عبور با scrypt (نمک تصادفی + timing-safe مقایسه) */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const hashBuf = Buffer.from(hash, "hex");
  const testBuf = scryptSync(password, salt, 64);
  if (hashBuf.length !== testBuf.length) return false;
  return timingSafeEqual(hashBuf, testBuf);
}

// ────────────────────────────────────────────────────────────
// توکن امضاشده (HMAC-SHA256) برای سشن‌های کوکی
// ────────────────────────────────────────────────────────────
type TokenPayload = { sub: number; iat: number; exp: number; tf?: boolean };

export function signToken(payload: object): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", getAuthSecret()).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifyToken<T>(token: string): T | null {
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = createHmac("sha256", getAuthSecret()).update(data).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(data, "base64url").toString());
    if (typeof parsed.exp === "number" && parsed.exp < Date.now()) return null;
    return parsed as T;
  } catch {
    return null;
  }
}

function cookieBase() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

// ────────────────────────────────────────────────────────────
// سشن صاحبان کسب‌وکار
// ────────────────────────────────────────────────────────────
export async function setSession(ownerId: number) {
  const store = await cookies();
  const token = signToken({
    sub: ownerId,
    iat: Date.now(),
    exp: Date.now() + OWNER_MAX_AGE * 1000,
  });
  store.set(OWNER_COOKIE, token, {
    ...cookieBase(),
    maxAge: OWNER_MAX_AGE,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(OWNER_COOKIE);
}

export async function getCurrentOwner() {
  try {
    const store = await cookies();
    const token = store.get(OWNER_COOKIE)?.value;
    if (!token) return null;
    const payload = verifyToken<TokenPayload>(token);
    if (!payload) return null;
    const [owner] = await db
      .select()
      .from(owners)
      .where(eq(owners.id, payload.sub));
    return owner && owner.active ? owner : null;
  } catch {
    return null;
  }
}

// ────────────────────────────────────────────────────────────
// سشن مدیران (با پرچم تأیید دومرحله‌ای)
// ────────────────────────────────────────────────────────────
export async function setAdminSession(adminId: number, twoFactorOk: boolean) {
  const store = await cookies();
  const token = signToken({
    sub: adminId,
    iat: Date.now(),
    exp: Date.now() + ADMIN_MAX_AGE * 1000,
    tf: twoFactorOk,
  });
  store.set(ADMIN_COOKIE, token, {
    ...cookieBase(),
    maxAge: ADMIN_MAX_AGE,
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

export async function getCurrentAdmin() {
  try {
    const store = await cookies();
    const token = store.get(ADMIN_COOKIE)?.value;
    if (!token) return null;
    const payload = verifyToken<TokenPayload>(token);
    if (!payload) return null;
    const [admin] = await db
      .select()
      .from(admins)
      .where(eq(admins.id, payload.sub));
    if (!admin || !admin.active) return null;
    // اگر برای این مدیر احراز دومرحله‌ای فعال است، سشن باید پرچم تأیید داشته باشد
    if (admin.totpEnabled && !payload.tf) return null;
    return admin;
  } catch {
    return null;
  }
}
