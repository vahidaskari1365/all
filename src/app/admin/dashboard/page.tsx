import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Store,
  Users,
  Flag,
  CreditCard,
  Palette,
  Hourglass,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import { getCurrentAdmin } from "@/lib/auth";
import {
  getAdminBlogPosts,
  getAdminBusinesses,
  getAdminCategories,
  getAdminCities,
  getAdminDesigners,
  getAdminOwners,
  getAdminPlans,
  getAdminReferrals,
  getAdminReports,
  getAdminStats,
  getAdminSubscriptions,
  getAuditLogs,
  getAdminAdmins,
} from "@/lib/admin-queries";
import { AdminShell } from "@/components/admin/shell";
import { AdminBadge, AdminTable, Fa, STATUS_LABEL, STATUS_TONE } from "@/components/admin/ui";
import { BusinessesTab } from "@/components/admin/businesses-tab";
import { OwnersTab } from "@/components/admin/owners-tab";
import { TaxonomyTab } from "@/components/admin/taxonomy-tab";
import { ReportsTab } from "@/components/admin/reports-tab";
import { PlansTab } from "@/components/admin/plans-tab";
import { SubscriptionsTab } from "@/components/admin/subscriptions-tab";
import { DesignersTab } from "@/components/admin/designers-tab";
import { ReferralsTab } from "@/components/admin/referrals-tab";
import { BlogTab } from "@/components/admin/blog-tab";
import { AdminsManager } from "@/components/admin/admins-tab";
import { toFa } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TABS = [
  "overview",
  "businesses",
  "owners",
  "taxonomy",
  "reports",
  "plans",
  "subscriptions",
  "designers",
  "referrals",
  "blog",
  "audit",
  "admins",
];

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin");

  const sp = await searchParams;
  const tab = TABS.includes(sp.tab ?? "") ? sp.tab! : "overview";

  let content: React.ReactNode = null;
  let title = "";

  switch (tab) {
    case "overview": {
      title = "نمای کلی";
      const [stats, businesses, reports, subscriptions, audit, adminsList] =
        await Promise.all([
          getAdminStats(),
          getAdminBusinesses(),
          getAdminReports(),
          getAdminSubscriptions(),
          getAuditLogs(8),
          getAdminAdmins(),
        ]);
      const pendingBiz = businesses.filter((b) => b.status === "pending");
      content = (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard icon={<Store className="h-5 w-5" />} label="کل کسب‌وکارها" value={stats.businesses} tone="bg-primary-50 text-primary-700" />
            <StatCard icon={<Hourglass className="h-5 w-5" />} label="در انتظار تأیید" value={stats.pendingBiz} tone="bg-amber-50 text-amber-700" />
            <StatCard icon={<Users className="h-5 w-5" />} label="کاربر در انتظار" value={stats.pendingOwners} tone="bg-sky-50 text-sky-700" />
            <StatCard icon={<Flag className="h-5 w-5" />} label="گزارش باز" value={stats.pendingReports} tone="bg-rose-50 text-rose-700" />
            <StatCard icon={<CreditCard className="h-5 w-5" />} label="اشتراک فعال" value={stats.activeSubs} tone="bg-violet-50 text-violet-700" />
            <StatCard icon={<Palette className="h-5 w-5" />} label="نمونه‌کار در انتظار" value={stats.pendingDesigners} tone="bg-emerald-50 text-emerald-700" />
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <section className="card overflow-hidden">
              <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-extrabold text-ink">
                  کسب‌وکارهای در انتظار تأیید
                </h2>
                <Link href="/admin/dashboard?tab=businesses" className="text-xs font-bold text-primary-700 hover:underline">
                  مشاهده همه
                </Link>
              </header>
              <div className="divide-y divide-slate-100">
                {pendingBiz.length === 0 && (
                  <p className="p-6 text-center text-sm text-slate-400">
                    موردی در انتظار تأیید نیست.
                  </p>
                )}
                {pendingBiz.slice(0, 6).map((b) => (
                  <div key={b.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink">{b.name}</p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {b.category?.name} • {b.city?.name}
                      </p>
                    </div>
                    <AdminBadge tone="amber">در انتظار</AdminBadge>
                  </div>
                ))}
              </div>
            </section>

            <section className="card overflow-hidden">
              <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-extrabold text-ink">
                  آخرین گزارش‌های مردمی
                </h2>
                <Link href="/admin/dashboard?tab=reports" className="text-xs font-bold text-primary-700 hover:underline">
                  مشاهده همه
                </Link>
              </header>
              <div className="divide-y divide-slate-100">
                {reports.length === 0 && (
                  <p className="p-6 text-center text-sm text-slate-400">
                    گزارشی ثبت نشده است.
                  </p>
                )}
                {reports.slice(0, 6).map((r) => (
                  <div key={r.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink">
                        {r.business?.name ?? "کسب‌وکار حذف‌شده"}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-slate-400">
                        {r.message}
                      </p>
                    </div>
                    <AdminBadge tone={STATUS_TONE[r.status] ?? "slate"}>
                      {STATUS_LABEL[r.status] ?? r.status}
                    </AdminBadge>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <section className="card overflow-hidden">
              <header className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-extrabold text-ink">
                  آخرین سوابق مدیریتی
                </h2>
              </header>
              <AdminTable head={["زمان", "مدیر", "عملیات", "جزئیات"]}>
                {audit.slice(0, 8).map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/60">
                    <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                      <Fa value={new Date(l.createdAt).toLocaleString("fa-IR")} />
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">{l.actorName ?? "—"}</td>
                    <td className="px-4 py-2.5">
                      <AdminBadge tone="sky">{l.action}</AdminBadge>
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-2.5 text-slate-400">
                      {l.detail ?? l.target ?? "—"}
                    </td>
                  </tr>
                ))}
                {audit.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                      هنوز رویدادی ثبت نشده است.
                    </td>
                  </tr>
                )}
              </AdminTable>
            </section>

            <AdminsManager admins={adminsList} currentRole={admin.role} currentId={admin.id} />
          </div>
        </div>
      );
      break;
    }
    case "businesses": {
      title = "مدیریت کسب‌وکارها";
      const businesses = await getAdminBusinesses();
      content = <BusinessesTab businesses={businesses} />;
      break;
    }
    case "owners": {
      title = "مدیریت صاحبان کسب‌وکار";
      const owners = await getAdminOwners();
      content = <OwnersTab owners={owners} />;
      break;
    }
    case "taxonomy": {
      title = "دسته‌بندی‌ها و شهرها";
      const [categories, cities] = await Promise.all([getAdminCategories(), getAdminCities()]);
      content = <TaxonomyTab categories={categories} cities={cities} />;
      break;
    }
    case "reports": {
      title = "گزارش‌های مردمی";
      const reports = await getAdminReports();
      content = <ReportsTab reports={reports} />;
      break;
    }
    case "plans": {
      title = "پلن‌های اشتراک";
      const plans = await getAdminPlans();
      content = <PlansTab plans={plans} />;
      break;
    }
    case "subscriptions": {
      title = "اشتراک‌ها";
      const subscriptions = await getAdminSubscriptions();
      content = <SubscriptionsTab subscriptions={subscriptions} />;
      break;
    }
    case "designers": {
      title = "طراحان کارت‌ویزیت";
      const designers = await getAdminDesigners();
      content = <DesignersTab designers={designers} />;
      break;
    }
    case "referrals": {
      title = "معرفی‌ها و پورسانت";
      const referrals = await getAdminReferrals();
      content = <ReferralsTab referrals={referrals} />;
      break;
    }
    case "blog": {
      title = "مدیریت بلاگ";
      const posts = await getAdminBlogPosts();
      content = <BlogTab posts={posts} />;
      break;
    }
    case "audit": {
      title = "سوابق مدیریتی";
      const audit = await getAuditLogs(300);
      content = (
        <AdminTable head={["زمان", "نوع عامل", "عامل", "عملیات", "هدف", "جزئیات", "IP"]}>
          {audit.map((l) => (
            <tr key={l.id} className="hover:bg-slate-50/60">
              <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                <Fa value={new Date(l.createdAt).toLocaleString("fa-IR")} />
              </td>
              <td className="px-4 py-2.5">
                <AdminBadge tone={l.actorType === "admin" ? "violet" : l.actorType === "owner" ? "sky" : "slate"}>
                  {l.actorType}
                </AdminBadge>
              </td>
              <td className="px-4 py-2.5 text-slate-600">{l.actorName ?? "—"}</td>
              <td className="px-4 py-2.5 font-bold text-ink">{l.action}</td>
              <td className="px-4 py-2.5 text-slate-500">{l.target ?? "—"}</td>
              <td className="max-w-[240px] truncate px-4 py-2.5 text-slate-400">
                {l.detail ?? "—"}
              </td>
              <td className="px-4 py-2.5 text-slate-400" dir="ltr">
                {l.ip ?? "—"}
              </td>
            </tr>
          ))}
          {audit.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                رویدادی ثبت نشده است.
              </td>
            </tr>
          )}
        </AdminTable>
      );
      break;
    }
    case "admins": {
      title = "مدیران سامانه";
      const adminsList = await getAdminAdmins();
      content = (
        <AdminsManager admins={adminsList} currentRole={admin.role} currentId={admin.id} />
      );
      break;
    }
  }

  return (
    <AdminShell adminName={admin.name} adminRole={admin.role} tab={tab}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-ink sm:text-2xl">{title}</h1>
          <p className="mt-1 text-xs text-slate-400">
            <Fa value={new Date().toLocaleDateString("fa-IR")} /> — همه تغییرات در
            سوابق مدیریتی ثبت می‌شود.
          </p>
        </div>
        <Link
          href="/admin/auth"
          className="transition-transform hover:scale-[1.03]"
          title="مدیریت احراز دومرحله‌ای"
        >
          <AdminBadge tone={admin.totpEnabled ? "green" : "amber"}>
            <ShieldCheck className="h-3.5 w-3.5" />
            {admin.totpEnabled ? "احراز دومرحله‌ای فعال" : "فعال‌سازی احراز دومرحله‌ای"}
          </AdminBadge>
        </Link>
      </div>
      {content}
    </AdminShell>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="card p-4">
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}>
        {icon}
      </span>
      <p className="mt-3 text-2xl font-black text-ink">
        <Fa value={value} />
      </p>
      <p className="mt-1 text-[11px] font-medium text-slate-400">{label}</p>
    </div>
  );
}
