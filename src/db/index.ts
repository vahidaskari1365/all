import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

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

  // Mock the query method to return empty results
  const originalQuery = pool.query.bind(pool);
  pool.query = async (...args: any[]) => {
    return { rows: [], command: "SELECT", rowCount: 0 };
  };
}

export const db = drizzle(pool);