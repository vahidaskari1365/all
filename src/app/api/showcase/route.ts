import { NextResponse } from "next/server";
import { db } from "@/db";
import { showcaseItems, businesses } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentOwner } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const owner = await getCurrentOwner();
  if (!owner) {
    return NextResponse.json({ error: "ابتدا وارد شوید." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const businessId = Number(body.businessId);
  const title = String(body.title ?? "").trim();
  if (!businessId || title.length < 2) {
    return NextResponse.json(
      { error: "کسب‌وکار و عنوان آیتم را وارد کنید." },
      { status: 400 }
    );
  }

  // تأیید مالکیت
  const [owned] = await db
    .select({ id: businesses.id })
    .from(businesses)
    .where(and(eq(businesses.id, businessId), eq(businesses.ownerId, owner.id)))
    .limit(1);
  if (!owned) {
    return NextResponse.json({ error: "دسترسی مجاز نیست." }, { status: 403 });
  }

  const str = (v: unknown) => (v ? String(v) : null);
  const type = body.type === "product" ? "product" : "photo";

  const [created] = await db
    .insert(showcaseItems)
    .values({
      businessId,
      type,
      title,
      description: str(body.description),
      imageUrl: str(body.imageUrl),
      price: str(body.price),
      unit: type === "product" ? str(body.unit) ?? "تومان" : null,
    })
    .returning({ id: showcaseItems.id });

  return NextResponse.json({ ok: true, item: created });
}
