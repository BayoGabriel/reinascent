import { formatPrice } from "@/lib/money";
import { DetailRow } from "./DetailRow";
import type { Order } from "../types";

export function formatOrderDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(iso));
}

/** Two-column money/customer recap between items and address sections. */
export function OrderTotals({ order }: { order: Order }) {
  return (
    <dl className="mt-8 grid gap-x-10 border-t border-line pt-6 sm:grid-cols-2">
      <DetailRow label="Product(s) Total" value={formatPrice(order.subtotal)} />
      <DetailRow
        label="Shipping"
        value={order.shippingFee > 0 ? formatPrice(order.shippingFee) : "Free"}
      />
      <DetailRow label="Name" value={order.customer.name} />
      <DetailRow label="Promotion Discount" value="—" />
      <DetailRow label="Order Total" value={formatPrice(order.total)} />
    </dl>
  );
}
