import { NextResponse } from "next/server";
import { clearAdminSession, getCurrentAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (admin) {
    await logAudit({
      actorType: "admin",
      actorId: admin.id,
      actorName: admin.email,
      action: "admin.logout",
      target: `admin:${admin.id}`,
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    });
  }
  await clearAdminSession();
  return NextResponse.json({ ok: true });
}
