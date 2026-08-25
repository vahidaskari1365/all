import { NextResponse } from "next/server";
import { db } from "@/db";
import { businesses, categories, cities } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentOwner } from "@/lib/auth";
import { cleanText, isValidEmailOrEmpty, isValidLatLng, isValidLng, parseId, safeUrl } from "@/lib/validate";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const owner = await getCurrentOwner();
  if (!owner) {
    return NextResponse.json({ error: "ابتدا وارد شوید." }, { status: 401 });
  }

  const { id: idParam } = await params;
  const businessId = parseId(idParam);
  if (!businessId) {
    return NextResponse.json({ error: "شناسه نامعتبر." }, { status: 400 });
  }

  const [existing] = await db
    .select({ id: businesses.id, ownerId: businesses.ownerId, name: businesses.name })
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

  const str = (v: unknown, max: number) =>
    v === undefined ? undefined : cleanText(v, max) || null;

  const patch: Record<string, unknown> = {};
  const textKeys: Array<[string, number]> = [
    ["name", 120],
    ["district", 120],
    ["tagline", 220],
    ["description", 3000],
    ["address", 600],
    ["phone", 40],
    ["mobile", 40],
    ["email", 120],
    ["website", 160],
    ["instagram", 160],
    ["telegram", 160],
    ["whatsapp", 40],
    ["workHours", 200],
    ["lat", 30],
    ["lng", 30],
  ];
  for (const [k, max] of textKeys) {
    if (body[k] !== undefined) patch[k] = str(body[k], max);
  }
  // آدرس‌های تصویر فقط به‌صورت URL امن
  for (const k of ["logoUrl", "coverUrl"]) {
    if (body[k] !== undefined) patch[k] = safeUrl(cleanText(body[k], 500));
  }

  for (const k of ["categoryId", "cityId"]) {
    if (body[k] !== undefined) patch[k] = Number(body[k]);
  }
  if (patch.categoryId !== undefined) {
    const [c] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.id, Number(patch.categoryId)))
      .limit(1);
    if (!c) return NextResponse.json({ error: "دسته نامعتبر است." }, { status: 400 });
  }
  if (patch.cityId !== undefined) {
    const [c] = await db
      .select({ id: cities.id })
      .from(cities)
      .where(eq(cities.id, Number(patch.cityId)))
      .limit(1);
    if (!c) return NextResponse.json({ error: "شهر نامعتبر است." }, { status: 400 });
  }

  for (const k of ["hasLicense", "unionMember", "hasGuarantee", "hasShowcase"]) {
    if (body[k] !== undefined) patch[k] = Boolean(body[k]);
  }

  if (patch.name !== undefined && String(patch.name).length < 3) {
    return NextResponse.json({ error: "نام کسب‌وکار کوتاه است." }, { status: 400 });
  }
  if (patch.email !== undefined && !isValidEmailOrEmpty(String(patch.email))) {
    return NextResponse.json({ error: "ایمیل معتبر نیست." }, { status: 400 });
  }
  if (
    (patch.lat !== undefined && !isValidLatLng(String(patch.lat))) ||
    (patch.lng !== undefined && !isValidLng(String(patch.lng)))
  ) {
    return NextResponse.json({ error: "مختصات موقعیت معتبر نیست." }, { status: 400 });
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: true, changed: false });
  }

  await db.update(businesses).set(patch).where(eq(businesses.id, businessId));

  await logAudit({
    actorType: "owner",
    actorId: owner.id,
    actorName: owner.name,
    action: "business.update",
    target: `business:${businessId}`,
    detail: `fields: ${Object.keys(patch).join(", ")}`,
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
  });

  return NextResponse.json({ ok: true, changed: true });
}
