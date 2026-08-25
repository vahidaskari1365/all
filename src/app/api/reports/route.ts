import { NextResponse } from "next/server";
import { db } from "@/db";
import { businesses, reports as businessReports } from "@/db/schema";
import { eq } from "drizzle-orm";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { cleanText, isValidEmail, normalizePhone, parseId } from "@/lib/validate";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const REPORT_CATEGORIES = ["wrong-info", "closed", "duplicate", "other"] as const;

/** گزارش مردمی اطلاعات نادرست — عمومی، بدون نیاز به ورود */
export async function POST(request: Request) {
  const rl = rateLimit(clientKey(request, "public-report"), {
    limit: 4,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "تعداد گزارش‌های شما زیاد است. کمی بعد دوباره تلاش کنید." },
      { status: 429 }
    );
  }

  let body: {
    businessId?: unknown;
    category?: unknown;
    message?: unknown;
    reporterName?: unknown;
    reporterPhone?: unknown;
    reporterEmail?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const businessId = parseId(body.businessId);
  if (!businessId) {
    return NextResponse.json({ error: "کسب‌وکار مشخص نیست." }, { status: 400 });
  }
  const [business] = await db
    .select({ id: businesses.id })
    .from(businesses)
    .where(eq(businesses.id, businessId))
    .limit(1);
  if (!business) {
    return NextResponse.json({ error: "کسب‌وکار یافت نشد." }, { status: 404 });
  }

  const category = String(body.category ?? "");
  if (!(REPORT_CATEGORIES as readonly string[]).includes(category)) {
    return NextResponse.json({ error: "دسته گزارش نامعتبر است." }, { status: 400 });
  }

  const message = cleanText(body.message, 1000);
  if (message.length < 10) {
    return NextResponse.json(
      { error: "توضیحات گزارش باید حداقل ۱۰ حرف باشد." },
      { status: 400 }
    );
  }

  const reporterName = cleanText(body.reporterName, 120) || null;
  const reporterPhoneRaw = normalizePhone(String(body.reporterPhone ?? "")) || null;
  const reporterEmailRaw = cleanText(String(body.reporterEmail ?? ""), 190).toLowerCase();
  const reporterEmail =
    reporterEmailRaw && isValidEmail(reporterEmailRaw) ? reporterEmailRaw : null;

  const [created] = await db
    .insert(businessReports)
    .values({
      businessId,
      category: category as (typeof REPORT_CATEGORIES)[number],
      message,
      reporterName,
      reporterPhone: reporterPhoneRaw,
      status: "pending",
    })
    .returning({ id: businessReports.id });

  await logAudit({
    actorType: "system",
    action: "report.create",
    target: `business:${businessId}`,
    detail: `category=${category}`,
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
  });

  return NextResponse.json({ ok: true, id: created?.id });
}
