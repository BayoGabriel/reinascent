import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Icon } from "@/components/ui/Icon";
import { formatPrice } from "@/lib/money";
import { PageHeader } from "@/features/admin/components/page-header";
import { getAdminOrder } from "@/features/admin/service";
import { setOrderStatusAction } from "@/features/admin/actions";
import { StatusBadge } from "@/features/account/components/status-badge";
import { OrderItemRow } from "@/features/orders/components/OrderItemRow";
import { OrderSection } from "@/features/orders/components/OrderSection";
import { DetailRow } from "@/features/orders/components/DetailRow";

export const metadata: Metadata = { title: "Order — Raina Scents Admin" };

export default function AdminOrderPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <OrderContent params={params} />
    </Suspense>
  );
}

const btn =
  "rounded-full px-4 py-2 text-xs font-medium transition-colors";

async function OrderContent({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  await connection();
  const { orderNumber } = await params;
  const order = await getAdminOrder(orderNumber);
  if (!order) notFound();
  const fulfill = setOrderStatusAction.bind(null, order.orderNumber, "fulfilled");
  const unfulfill = setOrderStatusAction.bind(null, order.orderNumber, "unfulfilled");
  const cancel = setOrderStatusAction.bind(null, order.orderNumber, "cancelled");
  return (
    <>
      <Link href="/admin/orders" className="mb-4 inline-flex items-center gap-1.5 text-sm text-cocoa hover:text-[#1F253F]">
        <Icon name="arrowUpRight" className="size-3.5 rotate-[225deg]" /> Orders
      </Link>
      <PageHeader
        title={order.orderNumber}
        description={`Placed ${new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(order.createdAt))}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={order.paymentStatus} />
            <StatusBadge status={order.fulfillmentStatus} />
          </div>
        }
      />
      <div className="mb-6 flex flex-wrap gap-3 rounded-2xl border border-line bg-white p-4 shadow-sm">
        {order.fulfillmentStatus !== "fulfilled" && (
          <form action={fulfill}>
            <button className={`${btn} bg-emerald-600 text-white hover:bg-emerald-700`}>Mark fulfilled</button>
          </form>
        )}
        {order.fulfillmentStatus === "fulfilled" && (
          <form action={unfulfill}>
            <button className={`${btn} border border-line text-cocoa hover:border-cocoa/40`}>Mark unfulfilled</button>
          </form>
        )}
        {order.fulfillmentStatus !== "cancelled" && (
          <form action={cancel}>
            <button className={`${btn} border border-red-200 text-red-600 hover:bg-red-50`}>Cancel order</button>
          </form>
        )}
        <Link href={`/orders/${order.orderNumber}`} className={`${btn} ml-auto border border-line text-cocoa hover:border-cocoa/40`}>
          Customer view
        </Link>
      </div>
      <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4">
          {order.items.map((item) => (
            <OrderItemRow key={`${item.slug}:${item.size}`} item={item} />
          ))}
        </div>
        <dl className="mt-6 grid gap-x-10 border-t border-line pt-5 sm:grid-cols-2">
          <DetailRow label="Product(s) Total" value={formatPrice(order.subtotal)} />
          <DetailRow label="Shipping" value={order.shippingFee > 0 ? formatPrice(order.shippingFee) : "Free"} />
          <DetailRow label="Order Total" value={formatPrice(order.total)} />
          <DetailRow label="Reference" value={order.paymentReference} />
        </dl>
        <div className="mt-8 flex flex-col gap-8">
          <OrderSection title="Customer">
            <DetailRow label="Name" value={order.customer.name} />
            <DetailRow label="Email" value={order.customer.email} />
            <DetailRow label="Phone" value={order.customer.phone} />
          </OrderSection>
          <OrderSection title="Shipping">
            <DetailRow label="Address" value={order.shipping.address} />
            <DetailRow label="Method" value={order.shipping.method} />
          </OrderSection>
          <OrderSection title="Payment">
            <DetailRow label="Method" value={order.paymentMethod} />
            <DetailRow label="Channel" value={order.paymentChannel ?? "—"} />
            <DetailRow label="Paid at" value={order.paidAt ? new Date(order.paidAt).toLocaleString() : "—"} />
          </OrderSection>
        </div>
      </div>
    </>
  );
}
