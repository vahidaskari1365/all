import { generateSecret, generateURI, verify } from "otplib";

/**
 * احراز هویت دومرحله‌ای (TOTP) برای مدیریت —
 * سازگار با Google Authenticator / Authy
 */

export function generateTotpSecret(): string {
  return generateSecret();
}

export function totpAuthUrl(secret: string, label: string): string {
  return generateURI({
    secret,
    label,
    issuer: "KasbYab Admin",
    algorithm: "sha1",
    digits: 6,
    period: 30,
  });
}

export async function verifyTotp(token: string, secret: string): Promise<boolean> {
  try {
    const result = await verify({ token, secret });
    return result.valid === true;
  } catch {
    return false;
  }
}
