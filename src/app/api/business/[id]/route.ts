import { NextResponse } from "next/server";
import { db } from "@/db";
import { businesses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentOwner } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const owner = await getCurrentOwner();
  if (!owner) {
    return NextResponse.json({ error: "ابتدا وارد شوید." }, { status: 401 });
  }

  const { id } = await params;
  const businessId = Number(id);
  if (!businessId) {
    return NextResponse.json({ error: "شناسه نامعتبر." }, { status: 400 });
  }

  const [existing] = await db
    .select({ id: businesses.id, ownerId: businesses.ownerId })
    .from(businesses)
    .where(eq(businesses.id, businessId))
    .limit(1);
  if (!existing || existing.ownerId !== owner.id) {
    return NextResponse.json({ error: "دسترسی مجاز نیست." }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const str = (v: unknown) => (v === undefined ? undefined : v ? String(v) : null);
  const num = (v: unknown) =>
    v === undefined ? undefined : v === null || v === "" ? null : Number(v);

  const patch: Record<string, unknown> = {};
  const textKeys = [
    "name",
    "district",
    "tagline",
    "description",
    "address",
    "phone",
    "mobile",
    "email",
    "website",
    "logoUrl",
    "coverUrl",
    "instagram",
    "telegram",
    "whatsapp",
    "workHours",
    "lat",
    "lng",
  ];
  for (const k of textKeys) {
    if (body[k] !== undefined) patch[k] = str(body[k]);
  }
  for (const k of ["categoryId", "cityId"]) {
    if (body[k] !== undefined) patch[k] = num(body[k]);
  }
  for (const k of ["hasLicense", "unionMember", "hasGuarantee", "hasShowcase"]) {
    if (body[k] !== undefined) patch[k] = Boolean(body[k]);
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: true, changed: false });
  }

  await db.update(businesses).set(patch).where(eq(businesses.id, businessId));
  return NextResponse.json({ ok: true, changed: true });
}
