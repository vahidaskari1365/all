import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { businesses, orders, showcaseItems } from "@/db/schema";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import {
  cleanText,
  isValidEmailOrEmpty,
  normalizePhone,
  parseId,
} from "@/lib/validate";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

function createOrderNumber() {
  return `KSB-${Date.now().toString(36).toUpperCase()}-${randomBytes(3)
    .toString("hex")
    .toUpperCase()}`;
}

function parseMoney(value: string | null | undefined) {
  if (!value) return null;
  const amount = Number(value.replace(/[^\d]/g, ""));
  return Number.isSafeInteger(amount) && amount >= 0 ? amount : null;
}

/** ثبت سفارش عمومی برای یک کسب‌وکار فعال */
export async function POST(request: Request) {
  const rl = rateLimit(clientKey(request, "public-order"), {
    limit: 6,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "تعداد سفارش‌های شما زیاد است. کمی بعد دوباره تلاش کنید." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const businessId = parseId(body.businessId);
  const customerName = cleanText(body.customerName, 120);
  const customerPhone = normalizePhone(String(body.customerPhone ?? ""));
  const customerEmail = cleanText(body.customerEmail, 160).toLowerCase();
  const service = cleanText(body.service, 180);
  const quantity = Math.min(99, Math.max(1, Math.floor(Number(body.quantity) || 1)));
  const requestedDate = cleanText(body.requestedDate, 20) || null;
  const preferredTime = cleanText(body.preferredTime, 40) || null;
  const deliveryAddress = cleanText(body.deliveryAddress, 700) || null;
  const note = cleanText(body.note, 1000) || null;

  if (!businessId) {
    return NextResponse.json({ error: "کسب‌وکار مشخص نیست." }, { status: 400 });
  }
  if (customerName.length < 3) {
    return NextResponse.json({ error: "نام خود را کامل وارد کنید." }, { status: 400 });
  }
  if (!customerPhone) {
    return NextResponse.json(
      { error: "شماره موبایل معتبر نیست (مثال: 09123456789)." },
      { status: 400 }
    );
  }
  if (!service || service.length < 2) {
    return NextResponse.json({ error: "خدمت یا محصول را انتخاب کنید." }, { status: 400 });
  }
  if (!isValidEmailOrEmpty(customerEmail)) {
    return NextResponse.json({ error: "ایمیل معتبر نیست." }, { status: 400 });
  }

  try {
    const [business] = await db
      .select({ id: businesses.id, name: businesses.name, status: businesses.status })
      .from(businesses)
      .where(and(eq(businesses.id, businessId), eq(businesses.status, "active")))
      .limit(1);
    if (!business) {
      return NextResponse.json(
        { error: "این کسب‌وکار در حال حاضر امکان دریافت سفارش ندارد." },
        { status: 404 }
      );
    }

    const itemId = body.itemId ? parseId(body.itemId) : null;
    let itemTitle: string | null = null;
    let unitPrice: number | null = null;
    if (itemId) {
      const [item] = await db
        .select({
          id: showcaseItems.id,
          title: showcaseItems.title,
          price: showcaseItems.price,
        })
        .from(showcaseItems)
        .where(and(eq(showcaseItems.id, itemId), eq(showcaseItems.businessId, businessId)))
        .limit(1);
      if (!item) {
        return NextResponse.json({ error: "محصول انتخاب‌شده یافت نشد." }, { status: 400 });
      }
      itemTitle = item.title;
      unitPrice = parseMoney(item.price);
    }

    const [created] = await db
      .insert(orders)
      .values({
        orderNumber: createOrderNumber(),
        businessId,
        itemId,
        itemTitle,
        unitPrice,
        totalAmount: unitPrice === null ? null : unitPrice * quantity,
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        service,
        quantity,
        requestedDate,
        preferredTime,
        deliveryAddress,
        note,
        status: "pending",
      })
      .returning({ id: orders.id, orderNumber: orders.orderNumber });

    if (!created) {
      return NextResponse.json({ error: "ثبت سفارش انجام نشد." }, { status: 500 });
    }

    await logAudit({
      actorType: "system",
      action: "order.create",
      target: `order:${created.id}`,
      detail: `${business.name} — ${service}`,
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    });

    return NextResponse.json({ ok: true, order: created }, { status: 201 });
  } catch (error) {
    console.error("[orders] create failed", error);
    return NextResponse.json(
      { error: "سامانه سفارش موقتاً در دسترس نیست. اتصال دیتابیس را بررسی کنید." },
      { status: 503 }
    );
  }
}
