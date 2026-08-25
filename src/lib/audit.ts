import { db } from "@/db";
import { auditLogs } from "@/db/schema";

/**
 * ثبت سوابق مهم مدیریتی (Audit Log)
 * همه تغییرات حساس از این مسیر عبور می‌کنند تا در پنل مدیریت قابل پیگیری باشند.
 */
export async function logAudit(input: {
  actorType?: "admin" | "owner" | "system";
  actorId?: number;
  actorName?: string;
  action: string;
  target?: string;
  detail?: string;
  ip?: string | null;
}) {
  try {
    await db.insert(auditLogs).values({
      actorType: input.actorType ?? "system",
      actorId: input.actorId,
      actorName: input.actorName ? input.actorName.slice(0, 140) : null,
      action: input.action.slice(0, 80),
      target: input.target?.slice(0, 80),
      detail: input.detail?.slice(0, 600),
      ip: input.ip ? input.ip.slice(0, 60) : null,
    });
  } catch {
    // ثبت سابقه نباید عملیات اصلی را از کار بیندازد
  }
}
