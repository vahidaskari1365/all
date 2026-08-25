import { NextResponse } from "next/server";
import { db } from "@/db";
import { businesses, categories, cities } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentOwner } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { cleanText, isValidEmailOrEmpty, isValidLatLng, isValidLng, safeUrl } from "@/lib/validate";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const owner = await getCurrentOwner();
  if (!owner) {
    return NextResponse.json({ error: "ابتدا وارد شوید." }, { status: 401 });
  }
  if (!owner.approved) {
    return NextResponse.json(
      { error: "حساب شما هنوز توسط مدیریت تأیید نشده است. پس از تأیید می‌توانید کسب‌وکار ثبت کنید." },
      { status: 403 }
    );
  }

  const rl = rateLimit(clientKey(request, `biz-create:${owner.id}`), {
    limit: 10,
    windowMs: 24 * 60 * 60 * 1000,
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "سقف ثبت کسب‌وکار امروز پر شده است." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const name = cleanText(body.name, 120);
  const categoryId = Number(body.categoryId);
  const cityId = Number(body.cityId);

  if (name.length < 3) {
    return NextResponse.json(
      { error: "نام کسب‌وکار باید حداقل ۳ حرف باشد." },
      { status: 400 }
    );
  }
  if (!Number.isInteger(categoryId) || !Number.isInteger(cityId)) {
    return NextResponse.json({ error: "دسته و شهر را انتخاب کنید." }, { status: 400 });
  }

  // دسته و شهر باید واقعاً موجود باشند
  const [cat, cit] = await Promise.all([
    db.select({ id: categories.id }).from(categories).where(eq(categories.id, categoryId)).limit(1),
    db.select({ id: cities.id }).from(cities).where(eq(cities.id, cityId)).limit(1),
  ]);
  if (!cat.length || !cit.length) {
    return NextResponse.json({ error: "دسته یا شهر نامعتبر است." }, { status: 400 });
  }

  const email = cleanText(body.email, 120) || null;
  if (email && !isValidEmailOrEmpty(email)) {
    return NextResponse.json({ error: "ایمیل معتبر نیست." }, { status: 400 });
  }
  const website = safeUrl(cleanText(body.website, 160));
  if (!isValidLatLng(String(body.lat ?? "")) || !isValidLng(String(body.lng ?? ""))) {
    return NextResponse.json({ error: "مختصات موقعیت معتبر نیست." }, { status: 400 });
  }

  // ساخت slug یکتا
  let slug = slugify(name);
  let attempt = 0;
  while (
    (
      await db
        .select({ id: businesses.id })
        .from(businesses)
        .where(eq(businesses.slug, slug))
        .limit(1)
    ).length > 0
  ) {
    attempt += 1;
    slug = `${slugify(name)}-${attempt}`;
    if (attempt > 20) {
      slug = `${slugify(name)}-${Date.now().toString(36)}`;
      break;
    }
  }

  const str = (v: unknown, max: number) => {
    const s = cleanText(v, max);
    return s || null;
  };

  const [created] = await db
    .insert(businesses)
    .values({
      name,
      slug,
      categoryId,
      cityId,
      ownerId: owner.id,
      district: str(body.district, 120),
      tagline: str(body.tagline, 220),
      description: str(body.description, 3000),
      address: str(body.address, 600),
      phone: str(body.phone, 40),
      mobile: str(body.mobile, 40),
      email,
      website,
      logoUrl: safeUrl(cleanText(body.logoUrl, 500)),
      coverUrl: safeUrl(cleanText(body.coverUrl, 500)),
      instagram: str(body.instagram, 160),
      telegram: str(body.telegram, 160),
      whatsapp: str(body.whatsapp, 40),
      workHours: str(body.workHours, 200),
      lat: str(body.lat, 30),
      lng: str(body.lng, 30),
      hasLicense: Boolean(body.hasLicense),
      unionMember: Boolean(body.unionMember),
      hasGuarantee: Boolean(body.hasGuarantee),
      hasShowcase: Boolean(body.hasShowcase),
      featured: false,
      verified: false,
      // تا تأیید مدیریت، عمومی نمایش داده نمی‌شود
      status: "pending",
    })
    .returning({ id: businesses.id, slug: businesses.slug });

  await logAudit({
    actorType: "owner",
    actorId: owner.id,
    actorName: owner.name,
    action: "business.create",
    target: `business:${created.id}`,
    detail: name,
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
  });

  return NextResponse.json({ ok: true, business: created });
}
