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
    });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__arenaNextJsPostgresqlPool = pool;
  }
} else {
  // Mock pool for development without database
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