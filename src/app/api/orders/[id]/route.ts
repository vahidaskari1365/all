import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { businesses, orders } from "@/db/schema";
import { getCurrentOwner } from "@/lib/auth";
import { cleanText, parseId } from "@/lib/validate";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const ORDER_STATUSES = ["pending", "confirmed", "completed", "canceled"] as const;
type OrderStatus = (typeof ORDER_STATUSES)[number];

/** تغییر وضعیت سفارش توسط صاحب همان کسب‌وکار */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const owner = await getCurrentOwner();
  if (!owner) {
    return NextResponse.json({ error: "ابتدا وارد شوید." }, { status: 401 });
  }

  const { id: idParam } = await params;
  const orderId = parseId(idParam);
  if (!orderId) {
    return NextResponse.json({ error: "شناسه سفارش نامعتبر است." }, { status: 400 });
  }

  let body: { status?: unknown; ownerNote?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const status = String(body.status ?? "") as OrderStatus;
  if (!(ORDER_STATUSES as readonly string[]).includes(status)) {
    return NextResponse.json({ error: "وضعیت سفارش نامعتبر است." }, { status: 400 });
  }

  try {
    const [ownedOrder] = await db
      .select({
        id: orders.id,
        businessId: orders.businessId,
        businessOwnerId: businesses.ownerId,
      })
      .from(orders)
      .innerJoin(businesses, eq(businesses.id, orders.businessId))
      .where(and(eq(orders.id, orderId), eq(businesses.ownerId, owner.id)))
      .limit(1);
    if (!ownedOrder) {
      return NextResponse.json({ error: "سفارش یافت نشد یا دسترسی مجاز نیست." }, { status: 404 });
    }

    const [updated] = await db
      .update(orders)
      .set({
        status,
        ownerNote: cleanText(body.ownerNote, 500) || null,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning({ id: orders.id, status: orders.status });

    await logAudit({
      actorType: "owner",
      actorId: owner.id,
      actorName: owner.name,
      action: "order.set_status",
      target: `order:${orderId}`,
      detail: `status=${status}`,
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    });

    return NextResponse.json({ ok: true, order: updated });
  } catch (error) {
    console.error("[orders] update failed", error);
    return NextResponse.json({ error: "به‌روزرسانی سفارش انجام نشد." }, { status: 503 });
  }
}
