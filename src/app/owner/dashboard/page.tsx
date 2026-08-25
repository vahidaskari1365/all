import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Hourglass } from "lucide-react";
import { getCurrentOwner } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import { db } from "@/db";
import { businesses, orders, showcaseItems } from "@/db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import {
  getActiveSubscription,
  getCategories,
  getCities,
  getLatestSubscription,
  getPlans,
} from "@/lib/queries";
import { OwnerDashboard } from "@/components/owner-dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const owner = await getCurrentOwner();
  if (!owner) redirect("/owner");

  const [rows, categories, cities, plans] = await Promise.all([
    db
      .select()
      .from(businesses)
      .where(eq(businesses.ownerId, owner.id))
      .orderBy(businesses.createdAt),
    getCategories(),
    getCities(),
    getPlans(),
  ]);

  const orderRows = rows.length
    ? await db
        .select()
        .from(orders)
        .where(inArray(orders.businessId, rows.map((business) => business.id)))
        .orderBy(desc(orders.createdAt))
    : [];

  // بارگذاری آیتم‌های ویترین هر کسب‌وکار
  const itemsByBiz = await Promise.all(
    rows.map((b) =>
      db
        .select()
        .from(showcaseItems)
        .where(eq(showcaseItems.businessId, b.id))
        .orderBy(showcaseItems.createdAt)
    )
  );

  // وضعیت اشتراک هر کسب‌وکار
  const subsByBiz = await Promise.all(
    rows.map(async (b) => {
      const [active, latest] = await Promise.all([
        getActiveSubscription(b.id),
        getLatestSubscription(b.id),
      ]);
      return { active, latest };
    })
  );

  const businessesWithMeta = rows.map((b, i) => ({
    ...b,
    category: categories.find((c) => c.id === b.categoryId) ?? null,
    city: cities.find((c) => c.id === b.cityId) ?? null,
    items: itemsByBiz[i].map((it) => ({
      id: it.id,
      type: it.type,
      title: it.title,
      description: it.description,
      imageUrl: it.imageUrl,
      price: it.price,
      unit: it.unit,
    })),
    subscription: subsByBiz[i].active,
    latestSubscription: subsByBiz[i].latest,
    orders: orderRows.filter((order) => order.businessId === b.id),
  }));

  return (
    <>
      <div className="border-b border-slate-200 bg-white">
        <div className="container-px mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 py-3">
          {owner.approved ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-primary-700">
              <ShieldCheck className="h-4 w-4" />
              حساب شما تأیید شده است
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600">
              <Hourglass className="h-4 w-4" />
              حساب شما در انتظار تأیید مدیریت است — ثبت کسب‌وکار پس از تأیید فعال
              می‌شود.
            </span>
          )}
          <div className="flex items-center gap-2">
            <Link
              href="/owner"
              className="hidden text-xs font-bold text-slate-400 hover:text-slate-600 sm:block"
            >
              صفحه ورود
            </Link>
            <LogoutButton />
          </div>
        </div>
      </div>

      <OwnerDashboard
        ownerName={owner.name}
        ownerApproved={owner.approved}
        businesses={businessesWithMeta}
        categories={categories}
        cities={cities}
        plans={plans}
      />
    </>
  );
}
