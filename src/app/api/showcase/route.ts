import { NextResponse } from "next/server";
import { db } from "@/db";
import { showcaseItems, businesses } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { getCurrentOwner } from "@/lib/auth";
import { getActiveSubscription } from "@/lib/queries";
import { cleanText, parseId, safeUrl } from "@/lib/validate";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

/** سقف آیتم‌های ویترین بدون اشتراک فعال */
const FREE_LIMIT = 4;
const PRO_LIMIT = 60;

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

  const businessId = parseId(body.businessId);
  const title = cleanText(body.title, 160);
  if (!businessId || title.length < 2) {
    return NextResponse.json(
      { error: "کسب‌وکار و عنوان آیتم را وارد کنید." },
      { status: 400 }
    );
  }

  // تأیید مالکیت
  const [owned] = await db
    .select({ id: businesses.id, name: businesses.name })
    .from(businesses)
    .where(and(eq(businesses.id, businessId), eq(businesses.ownerId, owner.id)))
    .limit(1);
  if (!owned) {
    return NextResponse.json({ error: "دسترسی مجاز نیست." }, { status: 403 });
  }

  // سقف آیتم‌ها بر اساس اشتراک
  const [cnt] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(showcaseItems)
    .where(eq(showcaseItems.businessId, businessId));
  const subscription = await getActiveSubscription(businessId);
  const limit = subscription ? PRO_LIMIT : FREE_LIMIT;
  if ((cnt?.count ?? 0) >= limit) {
    return NextResponse.json(
      {
        error: subscription
          ? "سقف آیتم‌های ویترین پر شده است."
          : "در طرح رایگان حداکثر ۴ آیتم می‌توانید ثبت کنید. برای گالری بیشتر، اشتراک ویترین حرفه‌ای را فعال کنید.",
      },
      { status: 402 }
    );
  }

  const type = body.type === "product" ? "product" : "photo";
  const imageUrl = safeUrl(cleanText(body.imageUrl, 500));
  const videoUrl = safeUrl(cleanText(body.videoUrl, 500));

  if (!imageUrl && !videoUrl) {
    return NextResponse.json(
      { error: "آدرس تصویر یا ویدئو لازم است." },
      { status: 400 }
    );
  }

  const [created] = await db
    .insert(showcaseItems)
    .values({
      businessId,
      type,
      title,
      description: cleanText(body.description, 1000) || null,
      imageUrl,
      videoUrl,
      price: cleanText(body.price, 60) || null,
      unit: type === "product" ? cleanText(body.unit, 40) || "تومان" : null,
    })
    .returning({ id: showcaseItems.id });

  await logAudit({
    actorType: "owner",
    actorId: owner.id,
    actorName: owner.name,
    action: "showcase.create",
    target: `business:${businessId}`,
    detail: title,
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
  });

  return NextResponse.json({ ok: true, item: created });
}

export async function DELETE(request: Request) {
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

  const itemId = parseId(body.itemId);
  if (!itemId) {
    return NextResponse.json({ error: "شناسه نامعتبر است." }, { status: 400 });
  }

  const [item] = await db
    .select({ id: showcaseItems.id, businessId: showcaseItems.businessId, title: showcaseItems.title })
    .from(showcaseItems)
    .where(eq(showcaseItems.id, itemId))
    .limit(1);
  if (!item) return NextResponse.json({ error: "آیتم یافت نشد." }, { status: 404 });

  const [owned] = await db
    .select({ id: businesses.id })
    .from(businesses)
    .where(and(eq(businesses.id, item.businessId), eq(businesses.ownerId, owner.id)))
    .limit(1);
  if (!owned) {
    return NextResponse.json({ error: "دسترسی مجاز نیست." }, { status: 403 });
  }

  await db.delete(showcaseItems).where(eq(showcaseItems.id, itemId));

  await logAudit({
    actorType: "owner",
    actorId: owner.id,
    actorName: owner.name,
    action: "showcase.delete",
    target: `business:${item.businessId}`,
    detail: item.title,
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
  });

  return NextResponse.json({ ok: true });
}
