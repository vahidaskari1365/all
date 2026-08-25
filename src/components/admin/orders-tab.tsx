"use client";

import { ActionButton, AdminBadge, AdminCard, AdminTable, STATUS_LABEL, STATUS_TONE, Fa } from "@/components/admin/ui";
import { setOrderStatus } from "@/lib/admin-actions";
import { CheckCircle2, ExternalLink, Phone, XCircle } from "lucide-react";

type AdminOrder = {
  id: number;
  orderNumber: string;
  businessId: number;
  itemTitle: string | null;
  totalAmount: number | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  service: string;
  quantity: number;
  requestedDate: string | null;
  preferredTime: string | null;
  deliveryAddress: string | null;
  note: string | null;
  status: string;
  createdAt: Date;
  business: { id: number; name: string; slug: string } | null;
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "در انتظار بررسی",
  confirmed: "تأییدشده",
  completed: "تکمیل‌شده",
  canceled: "لغوشده",
};

export function OrdersTab({ orders }: { orders: AdminOrder[] }) {
  return (
    <AdminCard title={`سفارش‌های مشتریان (${orders.length})`}>
      <div className="mb-4 flex flex-wrap gap-2 text-xs text-slate-500">
        <AdminBadge tone="amber">{orders.filter((order) => order.status === "pending").length} در انتظار</AdminBadge>
        <AdminBadge tone="sky">{orders.filter((order) => order.status === "confirmed").length} تأییدشده</AdminBadge>
        <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 ring-1 ring-slate-200">
          سفارش‌ها از فرم عمومی کسب‌وکارها ثبت می‌شوند.
        </span>
      </div>
      <AdminTable head={["کد سفارش", "کسب‌وکار", "مشتری", "درخواست", "زمان", "وضعیت", "عملیات"]}>
        {orders.map((order) => (
          <tr key={order.id} className="align-top hover:bg-slate-50/60">
            <td className="whitespace-nowrap px-4 py-3">
              <p className="font-mono text-[11px] font-black text-primary-700" dir="ltr">{order.orderNumber}</p>
              <p className="mt-1 text-[10px] text-slate-400"><Fa value={new Date(order.createdAt).toLocaleDateString("fa-IR")} /></p>
            </td>
            <td className="px-4 py-3">
              {order.business ? (
                <a href={`/business/${order.business.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-ink hover:text-primary-700">
                  {order.business.name}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : "—"}
            </td>
            <td className="px-4 py-3">
              <p className="font-bold text-ink">{order.customerName}</p>
              <a href={`tel:${order.customerPhone}`} dir="ltr" className="mt-1 inline-flex items-center gap-1 text-[11px] text-primary-700 hover:underline">
                <Phone className="h-3 w-3" /> {order.customerPhone}
              </a>
              {order.customerEmail && <p dir="ltr" className="mt-1 text-[10px] text-slate-400">{order.customerEmail}</p>}
            </td>
            <td className="max-w-[220px] px-4 py-3">
              <p className="font-bold text-ink">{order.service}</p>
              {order.itemTitle && <p className="mt-1 text-[11px] text-slate-500">{order.itemTitle} · تعداد {order.quantity}</p>}
              {!order.itemTitle && <p className="mt-1 text-[11px] text-slate-500">تعداد {order.quantity}</p>}
              {order.note && <p className="mt-2 rounded-lg bg-slate-50 p-2 text-[10px] leading-5 text-slate-500">{order.note}</p>}
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-[11px] text-slate-500">
              {order.requestedDate ?? "بدون تاریخ"}
              {order.preferredTime && <p className="mt-1">{order.preferredTime}</p>}
            </td>
            <td className="px-4 py-3">
              <AdminBadge tone={STATUS_TONE[order.status] ?? "slate"}>
                {ORDER_STATUS_LABELS[order.status] ?? STATUS_LABEL[order.status] ?? order.status}
              </AdminBadge>
            </td>
            <td className="px-4 py-3">
              <div className="flex flex-wrap gap-1.5">
                {order.status === "pending" && (
                  <ActionButton
                    action={() => setOrderStatus(order.id, "confirmed")}
                    className="bg-sky-50 text-sky-700 hover:bg-sky-100"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> تأیید
                  </ActionButton>
                )}
                {order.status === "confirmed" && (
                  <ActionButton
                    action={() => setOrderStatus(order.id, "completed")}
                    className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> تکمیل
                  </ActionButton>
                )}
                {order.status !== "canceled" && order.status !== "completed" && (
                  <ActionButton
                    action={() => setOrderStatus(order.id, "canceled")}
                    confirmText="آیا از لغو این سفارش مطمئن هستید؟"
                    className="bg-rose-50 text-rose-700 hover:bg-rose-100"
                  >
                    <XCircle className="h-3.5 w-3.5" /> لغو
                  </ActionButton>
                )}
              </div>
            </td>
          </tr>
        ))}
        {orders.length === 0 && (
          <tr>
            <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">هنوز سفارشی ثبت نشده است.</td>
          </tr>
        )}
      </AdminTable>
    </AdminCard>
  );
}
