import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, QueryArrayResult } from "pg";

const databaseUrl = process.env.DATABASE_URL;

let pool: Pool;

if (databaseUrl) {
  const globalForDb = globalThis as typeof globalThis & {
    __arenaNextJsPostgresqlPool?: Pool;
  };
  pool =
    globalForDb.__arenaNextJsPostgresqlPool ??
    new Pool({
      connectionString: databaseUrl,
      max: 10,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__arenaNextJsPostgresqlPool = pool;
  }
} else if (process.env.NODE_ENV === "production") {
  // در production نبودِ DATABASE_URL خطای صریح است؛
  // سایت نباید بی‌صدا با داده خالی بالا بیاید.
  throw new Error(
    "DATABASE_URL is required in production. Set it in the environment."
  );
} else {
  // حالت توسعه بدون دیتابیس — فقط برای پیش‌نمایش UI خالی
  if (!(globalThis as any).__kasbyabMockWarned) {
    (globalThis as any).__kasbyabMockWarned = true;
    console.warn(
      "[db] DATABASE_URL is not set — using an empty mock pool (dev only)."
    );
  }
  pool = new Pool({
    connectionString: "postgresql://localhost:5432/mock",
  });

  // Mock the query method to return empty results with correct type shape
  const mockResult: QueryArrayResult<any> = {
    rows: [],
    command: "SELECT",
    rowCount: 0,
    oid: 0 as number,
    fields: [] as any[],
  };

  pool.query = async () => {
    return mockResult;
  };
}

export const db = drizzle(pool);
