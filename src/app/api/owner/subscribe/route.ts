import { NextResponse } from "next/server";
import { db } from "@/db";
import { businesses, designers, plans, referrals, subscriptions } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentOwner } from "@/lib/auth";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { cleanText, parseId } from "@/lib/validate";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * درخواست اشتراک توسط صاحب کسب‌وکار:
 * - اشتراک در وضعیت pending ثبت می‌شود و مدیریت آن را فعال می‌کند
 * - کد معرفی طراح (در صورت صحت) در جدول referrals ثبت می‌شود تا
 *   پورسانت در آینده قابل محاسبه باشد
 */
export async function POST(request: Request) {
  const owner = await getCurrentOwner();
  if (!owner) {
    return NextResponse.json({ error: "ابتدا وارد شوید." }, { status: 401 });
  }
  if (!owner.approved) {
    return NextResponse.json(
      { error: "حساب شما هنوز تأیید نشده است." },
      { status: 403 }
    );
  }

  const rl = rateLimit(clientKey(request, `subscribe-${owner.id}`), {
    limit: 5,
    windowMs: 30 * 60 * 1000,
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "تعداد درخواست زیاد است. کمی بعد دوباره تلاش کنید." },
      { status: 429 }
    );
  }

  let body: { businessId?: unknown; planId?: unknown; referralCode?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const businessId = parseId(body.businessId);
  const planId = parseId(body.planId);
  if (!businessId || !planId) {
    return NextResponse.json({ error: "کسب‌وکار یا پلن مشخص نیست." }, { status: 400 });
  }

  const [business] = await db
    .select({ id: businesses.id, ownerId: businesses.ownerId })
    .from(businesses)
    .where(and(eq(businesses.id, businessId), eq(businesses.ownerId, owner.id)))
    .limit(1);
  if (!business) {
    return NextResponse.json({ error: "کسب‌وکار یافت نشد." }, { status: 404 });
  }

  const [plan] = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);
  if (!plan) {
    return NextResponse.json({ error: "پلن انتخاب‌شده وجود ندارد." }, { status: 400 });
  }

  // جلوگیری از ثبت اشتراک تکراری
  const existing = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.businessId, businessId),
        eq(subscriptions.status, "active")
      )
    )
    .limit(1);
  const pending = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.businessId, businessId),
        eq(subscriptions.status, "pending")
      )
    )
    .limit(1);
  if (existing.length > 0 || pending.length > 0) {
    return NextResponse.json(
      { error: "برای این کسب‌وکار اشتراک فعال یا در حال بررسی وجود دارد." },
      { status: 409 }
    );
  }

  const [subscription] = await db
    .insert(subscriptions)
    .values({
      businessId,
      planId,
      status: "pending",
    })
    .returning({ id: subscriptions.id });

  // ثبت معرفی طراح (در صورت ارائه کد معتبر)
  let referralRegistered = false;
  const referralCode = cleanText(String(body.referralCode ?? ""), 30);
  if (referralCode) {
    const [designer] = await db
      .select({ id: designers.id, referralCode: designers.referralCode })
      .from(designers)
      .where(eq(designers.referralCode, referralCode))
      .limit(1);
    if (designer) {
      await db.insert(referrals).values({
        designerId: designer.id,
        businessId,
        subscriptionId: subscription.id,
        commissionRate: 10, // درصد پایه پورسانت — قابل تنظیم توسط مدیریت
        status: "pending",
      });
      referralRegistered = true;
    }
  }

  await logAudit({
    actorType: "owner",
    actorId: owner.id,
    actorName: owner.name,
    action: "subscription.request",
    target: `business:${businessId}`,
    detail: `plan=${plan.name} referral=${referralRegistered ? referralCode : "none"}`,
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
  });

  return NextResponse.json({ ok: true, subscription, referralRegistered });
}
