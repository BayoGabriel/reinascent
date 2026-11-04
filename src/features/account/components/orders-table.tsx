import Link from "next/link";

import { Icon } from "@/components/ui/Icon";
import { formatPrice } from "@/lib/money";
import type { Order } from "@/features/orders/types";
import { StatusBadge } from "./status-badge";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

/** Rows linking each order to its existing detail page. */
export function OrdersTable({ orders }: { orders: Order[] }) {
  return (
    <ul className="divide-y divide-line">
      {orders.map((order) => (
        <li key={order.id}>
          <Link
            href={`/orders/${order.orderNumber}`}
            className="group flex items-center gap-4 py-4 transition-colors hover:bg-cream/50 sm:gap-6"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[#1F253F]">
                Order {order.orderNumber}
              </p>
              <p className="mt-0.5 text-xs text-cocoa/70">
                {formatDate(order.createdAt)} ·{" "}
                {order.items.reduce((n, i) => n + i.qty, 0)} item(s)
              </p>
            </div>
            <StatusBadge status={order.paymentStatus} />
            <StatusBadge status={order.fulfillmentStatus} />
            <span className="w-20 text-right text-sm font-medium text-[#1F253F]">
              {formatPrice(order.total)}
            </span>
            <Icon
              name="chevronRight"
              className="size-4 text-cocoa/50 transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
