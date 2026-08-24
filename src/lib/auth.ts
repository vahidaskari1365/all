import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/db";
import { owners } from "@/db/schema";
import { eq } from "drizzle-orm";

const SECRET = process.env.AUTH_SECRET || "kasbyab-dev-secret-change-me";
const COOKIE_NAME = "kasbyab_session";
const MAX_AGE = 60 * 60 * 24 * 14; // ۱۴ روز

/** هش رمز عبور با scrypt */
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

function signToken(payload: object): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

function verifyToken(token: string): { ownerId: number } | null {
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = createHmac("sha256", SECRET).update(data).digest("base64url");
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(data, "base64url").toString());
    if (typeof parsed.ownerId === "number") return { ownerId: parsed.ownerId };
    return null;
  } catch {
    return null;
  }
}

export async function setSession(ownerId: number) {
  const store = await cookies();
  const token = signToken({ ownerId, iat: Date.now() });
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getCurrentOwner() {
  try {
    const store = await cookies();
    const token = store.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const payload = verifyToken(token);
    if (!payload) return null;
    const [owner] = await db
      .select()
      .from(owners)
      .where(eq(owners.id, payload.ownerId));
    return owner ?? null;
  } catch {
    return null;
  }
}

export function parseSessionCookie(raw: string | undefined) {
  if (!raw) return null;
  return verifyToken(raw);
}
