import { NextResponse } from "next/server";
import { db } from "@/db";
import { businesses } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentOwner } from "@/lib/auth";
import { slugify } from "@/lib/utils";

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

  const name = String(body.name ?? "").trim();
  const categoryId = Number(body.categoryId);
  const cityId = Number(body.cityId);

  if (name.length < 3) {
    return NextResponse.json(
      { error: "نام کسب‌وکار باید حداقل ۳ حرف باشد." },
      { status: 400 }
    );
  }
  if (!categoryId || !cityId) {
    return NextResponse.json(
      { error: "دسته و شهر را انتخاب کنید." },
      { status: 400 }
    );
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

  const str = (v: unknown) => (v ? String(v) : null);

  const [created] = await db
    .insert(businesses)
    .values({
      name,
      slug,
      categoryId,
      cityId,
      ownerId: owner.id,
      district: str(body.district),
      tagline: str(body.tagline),
      description: str(body.description),
      address: str(body.address),
      phone: str(body.phone),
      mobile: str(body.mobile),
      email: str(body.email),
      website: str(body.website),
      logoUrl: str(body.logoUrl),
      coverUrl: str(body.coverUrl),
      instagram: str(body.instagram),
      telegram: str(body.telegram),
      whatsapp: str(body.whatsapp),
      workHours: str(body.workHours),
      lat: str(body.lat),
      lng: str(body.lng),
      hasLicense: Boolean(body.hasLicense),
      unionMember: Boolean(body.unionMember),
      hasGuarantee: Boolean(body.hasGuarantee),
      hasShowcase: Boolean(body.hasShowcase),
      featured: false,
      verified: false,
    })
    .returning({ id: businesses.id, slug: businesses.slug });

  return NextResponse.json({ ok: true, business: created });
}
