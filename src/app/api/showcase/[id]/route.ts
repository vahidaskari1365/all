import { NextResponse } from "next/server";
import { db } from "@/db";
import { showcaseItems, businesses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentOwner } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const owner = await getCurrentOwner();
  if (!owner) {
    return NextResponse.json({ error: "ابتدا وارد شوید." }, { status: 401 });
  }

  const { id } = await params;
  const itemId = Number(id);
  if (!itemId) {
    return NextResponse.json({ error: "شناسه نامعتبر." }, { status: 400 });
  }

  const [item] = await db
    .select({ businessId: showcaseItems.businessId })
    .from(showcaseItems)
    .where(eq(showcaseItems.id, itemId))
    .limit(1);
  if (!item) {
    return NextResponse.json({ error: "آیتم یافت نشد." }, { status: 404 });
  }

  const [biz] = await db
    .select({ ownerId: businesses.ownerId })
    .from(businesses)
    .where(eq(businesses.id, item.businessId))
    .limit(1);
  if (!biz || biz.ownerId !== owner.id) {
    return NextResponse.json({ error: "دسترسی مجاز نیست." }, { status: 403 });
  }

  await db.delete(showcaseItems).where(eq(showcaseItems.id, itemId));
  return NextResponse.json({ ok: true });
}
