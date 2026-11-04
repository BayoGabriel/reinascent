import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import type { Metadata } from "next";

import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/money";
import { PageHeader } from "@/features/admin/components/page-header";
import { listAdminOrders } from "@/features/admin/service";
import { StatusBadge } from "@/features/account/components/status-badge";
import type { FulfillmentStatus, PaymentStatus } from "@/features/orders/types";

export const metadata: Metadata = { title: "Orders — Raina Scents Admin" };

const FILTERS = [
  { key: "", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "paid", label: "Paid" },
  { key: "failed", label: "Failed" },
];

export default function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return (
    <Suspense fallback={null}>
      <OrdersContent searchParams={searchParams} />
    </Suspense>
  );
}

async function OrdersContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await connection();
  const sp = await searchParams;
  const payment = (sp.payment ?? "") as PaymentStatus | "";
  const fulfillment = (sp.fulfillment ?? "") as FulfillmentStatus | "";
  const orders = await listAdminOrders(
    {
      paymentStatus: payment || undefined,
      fulfillmentStatus: fulfillment || undefined,
    },
    100,
  );
  return (
    <>
      <PageHeader title="Orders" description={`${orders.length} orders`} />
      <div className="mb-5 flex gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key ? `/admin/orders?payment=${f.key}` : "/admin/orders"}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm transition-colors",
              payment === f.key
                ? "bg-ink text-white"
                : "border border-line text-cocoa hover:border-cocoa/40",
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-cocoa/60">
              <th className="px-5 py-3.5 font-medium">Order</th>
              <th className="px-4 py-3.5 font-medium">Customer</th>
              <th className="px-4 py-3.5 font-medium">Date</th>
              <th className="px-4 py-3.5 font-medium">Payment</th>
              <th className="px-4 py-3.5 font-medium">Fulfillment</th>
              <th className="px-5 py-3.5 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {orders.map((o) => (
              <tr key={o.id} className="transition-colors hover:bg-cream/40">
                <td className="px-5 py-3.5">
                  <Link href={`/admin/orders/${o.orderNumber}`} className="font-medium text-[#1F253F] hover:text-gold">
                    {o.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3.5">
                  <p className="text-[#1F253F]">{o.customer.name}</p>
                  <p className="text-xs text-cocoa/60">{o.customer.email}</p>
                </td>
                <td className="px-4 py-3.5 text-cocoa">
                  {new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(o.createdAt))}
                </td>
                <td className="px-4 py-3.5"><StatusBadge status={o.paymentStatus} /></td>
                <td className="px-4 py-3.5"><StatusBadge status={o.fulfillmentStatus} /></td>
                <td className="px-5 py-3.5 text-right font-medium text-[#1F253F]">{formatPrice(o.total)}</td>
              </tr>
            ))}
            {!orders.length && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-cocoa/70">No orders match.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
