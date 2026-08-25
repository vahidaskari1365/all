import { NextResponse } from "next/server";
import { db } from "@/db";
import { owners } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, setSession } from "@/lib/auth";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { normalizePhone } from "@/lib/validate";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rl = rateLimit(clientKey(request, "owner-login"), {
    limit: 8,
    windowMs: 15 * 60 * 1000,
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `تلاش‌های ناموفق زیاد است. ${rl.retryAfterSec} ثانیه دیگر دوباره تلاش کنید.` },
      { status: 429 }
    );
  }

  let body: { phone?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const phone = normalizePhone(body.phone ?? "");
  const password = String(body.password ?? "");

  if (!phone || !password) {
    return NextResponse.json(
      { error: "شماره موبایل و رمز عبور را وارد کنید." },
      { status: 400 }
    );
  }

  const [owner] = await db
    .select()
    .from(owners)
    .where(eq(owners.phone, phone))
    .limit(1);

  // پیام یکسان برای هر دو حالت نادرست (جلوگیری از افشای اطلاعات)
  if (!owner || !verifyPassword(password, owner.passwordHash)) {
    return NextResponse.json(
      { error: "شماره موبایل یا رمز عبور نادرست است." },
      { status: 401 }
    );
  }

  if (!owner.active) {
    return NextResponse.json(
      { error: "حساب شما توسط مدیریت غیرفعال شده است." },
      { status: 403 }
    );
  }

  await setSession(owner.id);
  await logAudit({
    actorType: "owner",
    actorId: owner.id,
    actorName: owner.name,
    action: "owner.login",
    target: `owner:${owner.id}`,
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
  });

  return NextResponse.json({ ok: true, approved: owner.approved });
}
