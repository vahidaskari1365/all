import { NextResponse } from "next/server";
import { db } from "@/db";
import { owners } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, setSession } from "@/lib/auth";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { cleanText, isValidName, normalizePhone } from "@/lib/validate";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rl = rateLimit(clientKey(request, "register"), {
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `تعداد تلاش‌ها زیاد است. ${rl.retryAfterSec} ثانیه دیگر دوباره تلاش کنید.` },
      { status: 429 }
    );
  }

  let body: { name?: string; phone?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const name = cleanText(body.name, 120);
  const phone = normalizePhone(body.phone ?? "");
  const password = String(body.password ?? "");

  if (!isValidName(name)) {
    return NextResponse.json({ error: "نام باید حداقل ۳ حرف باشد." }, { status: 400 });
  }
  if (!phone) {
    return NextResponse.json(
      { error: "شماره موبایل معتبر نیست (مثال: 09123456789)." },
      { status: 400 }
    );
  }
  if (password.length < 8 || password.length > 72) {
    return NextResponse.json(
      { error: "رمز عبور باید بین ۸ تا ۷۲ کاراکتر باشد." },
      { status: 400 }
    );
  }

  const existing = await db
    .select({ id: owners.id })
    .from(owners)
    .where(eq(owners.phone, phone))
    .limit(1);
  if (existing.length > 0) {
    return NextResponse.json(
      { error: "با این شماره قبلاً حساب ثبت شده است. وارد شوید." },
      { status: 409 }
    );
  }

  const [created] = await db
    .insert(owners)
    .values({
      name,
      phone,
      passwordHash: hashPassword(password),
      // حساب جدید تا تأیید مدیریت غیرفعال می‌ماند
      approved: false,
    })
    .returning({ id: owners.id, name: owners.name, approved: owners.approved });

  if (!created) {
    return NextResponse.json({ error: "خطا در ثبت‌نام." }, { status: 500 });
  }

  await setSession(created.id);
  await logAudit({
    actorType: "owner",
    actorId: created.id,
    actorName: name,
    action: "owner.register",
    target: `owner:${created.id}`,
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
  });

  return NextResponse.json({ ok: true, owner: created });
}
