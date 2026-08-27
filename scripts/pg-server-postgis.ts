/**
 * سرور توسعه‌ی PostgreSQL + PostGIS مبتنی بر PGlite — برای بک‌اند Laravel
 * (در محیط توسعه/پیش‌نمایش؛ در تولید از PostgreSQL واقعی + PostGIS استفاده شود: docker-compose.yml)
 *
 * اجرا: npm run db:server:postgis   (پورت 5433)
 */
import { PGlite } from "@electric-sql/pglite";
import { postgis } from "@electric-sql/pglite-postgis";
import { createServer } from "pglite-server";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const DATA_DIR = process.env.PGDATA ?? join(process.cwd(), ".data", "pglite-postgis");
const PORT = Number(process.env.PGPORT ?? 5433);
const HOST = process.env.PGHOST ?? "0.0.0.0";

async function main() {
  mkdirSync(DATA_DIR, { recursive: true });

  const db = new PGlite(DATA_DIR, { extensions: { postgis } });
  await db.waitReady;

  // فعال‌سازی PostGIS در پایگاه داده
  await db.exec(`CREATE EXTENSION IF NOT EXISTS postgis;`);
  const v = await db.query<{ v: string }>(`SELECT postgis_full_version() AS v`);
  console.log(`[pg] PostGIS: ${v.rows[0]?.v?.slice(0, 90) ?? "?"}`);

  const server = createServer(db, { logLevel: 1 });
  server.listen(PORT, HOST, () => {
    console.log(`[pg] PostgreSQL+PostGIS wire server on ${HOST}:${PORT} (data: ${DATA_DIR})`);
  });
  server.on("error", (err: Error) => {
    console.error("[pg] server error:", err);
    process.exit(1);
  });
}

main().catch((err) => {
  console.error("[pg] failed to start:", err);
  process.exit(1);
});
