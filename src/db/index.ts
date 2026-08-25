import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, type QueryArrayResult } from "pg";

/**
 * اتصال تنبل (lazy) به دیتابیس
 * ─────────────────────────────
 * چرا؟ در `next build` (مثلاً روی Vercel) Next.js ماژول‌ها را برای جمع‌آوری
 * تنظیمات صفحات (حتی /_not-found) import می‌کند. اگر این ماژول در همان لحظه
 * import شدن به‌خاطر نبودِ DATABASE_URL خطا بدهد، کل بیلد می‌شکند.
 *
 * بنابراین:
 *  - Pool واقعی فقط در اولین کوئری ساخته می‌شود؛
 *  - در production بدون DATABASE_URL، بیلد موفق می‌ماند و دسترسی مستقیم به
 *    دیتابیس (مثلاً عملیات نوشتن) با پیام خطای صریح متوقف می‌شود؛
 *  - صفحات عمومی از طریق `src/lib/queries.ts` این خطا را می‌گیرند و به‌جای
 *    کرش کردن سایت، با داده خالی به‌صورت امن باز می‌شوند (و خطا را لاگ می‌کنند)؛
 *  - در توسعه بدون DATABASE_URL، یک Pool ساختگی با نتیجه خالی استفاده می‌شود
 *    (فقط برای پیش‌نمایش UI).
 */

const databaseUrl = process.env.DATABASE_URL;

let realPool: Pool | null = null;

function createPool(): Pool {
  const globalForDb = globalThis as typeof globalThis & {
    __arenaNextJsPostgresqlPool?: Pool;
  };

  if (databaseUrl) {
    const pool =
      globalForDb.__arenaNextJsPostgresqlPool ??
      new Pool({ connectionString: databaseUrl, max: 10 });
    if (process.env.NODE_ENV !== "production") {
      globalForDb.__arenaNextJsPostgresqlPool = pool;
    }
    return pool;
  }

  if (process.env.NODE_ENV === "production") {
    // پراکسی که فقط در لحظه اجرای کوئری خطای صریح می‌دهد —
    // import و build بدون DATABASE_URL هم موفق می‌مانند.
    return new Proxy({} as Pool, {
      get(_target, prop) {
        if (prop === "query" || prop === "connect") {
          return () => {
            throw new Error(
              "DATABASE_URL is required in production. Set it in the environment."
            );
          };
        }
        if (prop === "end") return () => Promise.resolve();
        return undefined;
      },
    });
  }

  // حالت توسعه بدون دیتابیس — فقط برای پیش‌نمایش UI خالی
  if (!(globalThis as any).__kasbyabMockWarned) {
    (globalThis as any).__kasbyabMockWarned = true;
    console.warn(
      "[db] DATABASE_URL is not set — using an empty mock pool (dev only)."
    );
  }
  const pool = new Pool({
    connectionString: "postgresql://localhost:5432/mock",
  });

  // نتیجه خالی با ساختار صحیح
  const mockResult: QueryArrayResult<any> = {
    rows: [],
    command: "SELECT",
    rowCount: 0,
    oid: 0 as number,
    fields: [] as any[],
  };
  pool.query = async () => mockResult;
  return pool;
}

// پراکسی تنبل: اولین استفاده، Pool واقعی را می‌سازد و متدها را با
// اتصال درست (this-binding) برمی‌گرداند تا فراخوانی‌های drizzle سالم بمانند.
const lazyPool = new Proxy({} as Pool, {
  get(_target, prop) {
    // drizzle در زمان ساخت، `client.constructor.name` را بررسی می‌کند؛
    // پس باید یک constructor معتبر برگردانیم.
    if (prop === "constructor") return Pool;
    if (!realPool) {
      realPool = createPool();
    }
    const value = Reflect.get(realPool, prop, realPool);
    return typeof value === "function" ? value.bind(realPool) : value;
  },
});

export const db = drizzle(lazyPool);
