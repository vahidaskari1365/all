/**
 * سرور توسعه‌ی PostgreSQL مبتنی بر PGlite (بدون نیاز به نصب دیتابیس)
 * برای محیط توسعه/پیش‌نمایش. در محیط production از PostgreSQL واقعی استفاده کنید.
 *
 * اجرا: npm run db:server
 */
import { PGlite } from "@electric-sql/pglite";
import { createServer } from "pglite-server";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const DATA_DIR = process.env.PGDATA ?? join(process.cwd(), ".data", "pglite");
const PORT = Number(process.env.PGPORT ?? 5432);
const HOST = process.env.PGHOST ?? "127.0.0.1";

async function main() {
  mkdirSync(DATA_DIR, { recursive: true });

  const db = new PGlite(DATA_DIR);
  await db.waitReady;

  const server = createServer(db, { logLevel: 1 });

  server.listen(PORT, HOST, () => {
    console.log(
      `[pg] PGlite wire server listening on ${HOST}:${PORT} (data: ${DATA_DIR})`
    );
  });

  server.on("error", (err) => {
    console.error("[pg] server error:", err);
    process.exit(1);
  });
}

main().catch((err) => {
  console.error("[pg] failed to start:", err);
  process.exit(1);
});
