/**
 * محدودسازی درخواست‌ها — درون‌حافظه‌ای (sliding window)
 * برای استقرار چندنمونه‌ای (multi-instance) باید به Redis منتقل شود؛
 * ساختار فعلی برای استقرار تک‌نمونه‌ای کفایت می‌کند.
 */

type Bucket = { windowStart: number; count: number };

const buckets = new Map<string, Bucket>();

// پاکسازی دوره‌ای برای جلوگیری از رشد بی‌نهایت حافظه
let lastSweep = Date.now();
function sweep() {
  const now = Date.now();
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, b] of buckets) {
    if (now - b.windowStart > 60 * 60 * 1000) buckets.delete(key);
  }
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
};

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): RateLimitResult {
  sweep();
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now - bucket.windowStart >= windowMs) {
    buckets.set(key, { windowStart: now, count: 1 });
    return { allowed: true, remaining: limit - 1, retryAfterSec: 0 };
  }

  bucket.count += 1;
  if (bucket.count <= limit) {
    return {
      allowed: true,
      remaining: limit - bucket.count,
      retryAfterSec: 0,
    };
  }

  const elapsed = now - bucket.windowStart;
  const retryAfterSec = Math.max(1, Math.ceil((windowMs - elapsed) / 1000));
  return { allowed: false, remaining: 0, retryAfterSec };
}

/** کلید مبتنی بر IP کلاینت (با پشتیبانی از هدرهای پروکسی معتبر) */
export function clientKey(request: Request, scope: string): string {
  const fwd = request.headers.get("x-forwarded-for");
  const ip = fwd?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  return `${scope}:${ip}`;
}
