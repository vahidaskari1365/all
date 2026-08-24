import { NextResponse } from "next/server";
import { db } from "@/db";
import { owners } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, setSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { name?: string; phone?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const name = body.name?.trim();
  const phone = body.phone?.trim();
  const password = body.password ?? "";

  if (!name || name.length < 3) {
    return NextResponse.json({ error: "نام باید حداقل ۳ حرف باشد." }, { status: 400 });
  }
  if (!/^0?9\d{9}$/.test(phone ?? "")) {
    return NextResponse.json(
      { error: "شماره موبایل معتبر نیست (مثال: 09123456789)." },
      { status: 400 }
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "رمز عبور باید حداقل ۶ کاراکتر باشد." },
      { status: 400 }
    );
  }

  const existing = await db
    .select({ id: owners.id })
    .from(owners)
    .where(eq(owners.phone, phone!))
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
      phone: phone!,
      passwordHash: hashPassword(password),
      // در محیط دمو، حساب به‌صورت خودکار تأیید می‌شود.
      approved: true,
    })
    .returning({ id: owners.id, name: owners.name });

  if (!created) {
    return NextResponse.json({ error: "خطا در ثبت‌نام." }, { status: 500 });
  }

  await setSession(created.id);
  return NextResponse.json({ ok: true, owner: created });
}
