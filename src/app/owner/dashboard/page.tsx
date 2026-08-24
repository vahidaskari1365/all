import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { getCurrentOwner } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import { db } from "@/db";
import { businesses, showcaseItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCategories, getCities } from "@/lib/queries";
import { OwnerDashboard } from "@/components/owner-dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const owner = await getCurrentOwner();
  if (!owner) redirect("/owner");

  const [rows, categories, cities] = await Promise.all([
    db
      .select()
      .from(businesses)
      .where(eq(businesses.ownerId, owner.id))
      .orderBy(businesses.createdAt),
    getCategories(),
    getCities(),
  ]);

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

  const businessesWithItems = rows.map((b, i) => ({
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
  }));

  return (
    <>
      <div className="border-b border-slate-200 bg-white">
        <div className="container-px mx-auto flex max-w-6xl items-center justify-between py-3">
          <span className="flex items-center gap-1.5 text-xs font-bold text-primary-700">
            <ShieldCheck className="h-4 w-4" />
            حساب شما تأیید شده است — پنل فعال
          </span>
          <LogoutButton />
        </div>
      </div>

      <OwnerDashboard
        ownerName={owner.name}
        businesses={businessesWithItems}
        categories={categories}
        cities={cities}
      />
    </>
  );
}


