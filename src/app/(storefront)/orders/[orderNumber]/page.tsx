import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { DetailRow } from "@/features/orders/components/DetailRow";
import { OrderItemRow } from "@/features/orders/components/OrderItemRow";
import { OrderSection } from "@/features/orders/components/OrderSection";
import { OrderStatusBanner } from "@/features/orders/components/OrderStatusBanner";
import {
  OrderTotals,
  formatOrderDate,
} from "@/features/orders/components/OrderTotals";
import { getOrderForViewer } from "@/features/orders/service";
import { getGuestSessionId } from "@/server/guest/guest-session";
import { getCurrentUser } from "@/server/auth/current-user";

export const metadata: Metadata = { title: "Order Details — Raina Scents" };

interface PageProps {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default function OrderDetailsPage({ params, searchParams }: PageProps) {
  return (
    <Suspense fallback={null}>
      <OrderContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function OrderContent({ params, searchParams }: PageProps) {
  const { orderNumber } = await params;
  const sp = await searchParams;
  const token = typeof sp.token === "string" ? sp.token : undefined;
  const user = await getCurrentUser().catch(() => null);
  const order = await getOrderForViewer(orderNumber, {
    guestToken: await getGuestSessionId(),
    userId: user?._id.toHexString() ?? null,
    accessToken: token,
  });
  if (!order) notFound();
  const failed = sp.payment === "failed";

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <Link
        href="/products"
        className="inline-flex items-center gap-1.5 text-sm text-cocoa transition-colors hover:text-[#1F253F]"
      >
        <Icon name="arrowUpRight" className="size-3.5 rotate-[225deg]" /> Back
      </Link>
      <h1 className="my-8 text-center font-serif text-3xl font-medium tracking-tight text-[#1F253F] sm:text-4xl">
        Order Details
      </h1>
      <OrderStatusBanner paymentStatus={order.paymentStatus} failed={failed} />
      <div className="mt-8 flex flex-col gap-4">
        {order.items.map((item) => (
          <OrderItemRow key={`${item.slug}:${item.size}`} item={item} />
        ))}
      </div>
      <OrderTotals order={order} />
      <div className="mt-10 flex flex-col gap-9">
        <OrderSection title="Shipping Address">
          <DetailRow label="Name" value={order.customer.name} />
          <DetailRow label="Telephone" value={order.customer.phone} />
          <DetailRow label="Address" value={order.shipping.address} />
          <DetailRow label="Email" value={order.customer.email} />
        </OrderSection>
        <OrderSection title="Shipping Method">
          <p className="text-sm text-[#1F253F]">{order.shipping.method}</p>
        </OrderSection>
        <OrderSection title="Payment Method">
          <p className="text-sm text-[#1F253F]">
            {order.paymentMethod}
            {order.paymentChannel ? ` — ${order.paymentChannel}` : ""}
          </p>
        </OrderSection>
        <OrderSection title="Order Information">
          <DetailRow label="Order No" value={order.orderNumber} />
          <DetailRow
            label="Order Date"
            value={formatOrderDate(order.createdAt)}
          />
        </OrderSection>
      </div>
    </section>
  );
}
