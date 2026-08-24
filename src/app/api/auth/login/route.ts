import { NextResponse } from "next/server";
import { db } from "@/db";
import { owners } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, setSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { phone?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const phone = body.phone?.trim();
  const password = body.password ?? "";

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

  if (!owner || !verifyPassword(password, owner.passwordHash)) {
    return NextResponse.json(
      { error: "شماره موبایل یا رمز عبور نادرست است." },
      { status: 401 }
    );
  }

  await setSession(owner.id);
  return NextResponse.json({ ok: true });
}
