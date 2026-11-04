import "server-only";

import type { OrderDocument } from "@/server/repositories/order.repository";
import type { Order, OrderItem } from "./types";

/** Serialize an order document for UI — drops ownership secrets
 *  (accessTokenHash, guestToken) and maps doc field names to the public
 *  API naming (`productSlug`→`slug`, `variant`→`size`). */
export function toOrder(doc: OrderDocument): Order {
  const items: OrderItem[] = doc.items.map((i) => ({
    slug: i.productSlug,
    name: i.name,
    ref: i.ref,
    size: i.variant,
    qty: i.qty,
    unitPrice: i.unitPrice,
    lineTotal: i.lineTotal,
    imageUrl: i.imageUrl,
    alt: i.alt,
  }));
  return {
    id: doc._id.toHexString(),
    orderNumber: doc.orderNumber,
    items,
    customer: doc.customer,
    shipping: doc.shipping,
    subtotal: doc.subtotal,
    shippingFee: doc.shippingFee,
    total: doc.total,
    currency: doc.currency,
    paymentStatus: doc.paymentStatus,
    paymentMethod: doc.paymentMethod,
    paymentReference: doc.paymentReference,
    paymentChannel: doc.paymentChannel,
    paidAt: doc.paidAt?.toISOString() ?? null,
    fulfillmentStatus: doc.fulfillmentStatus,
    createdAt: doc.createdAt.toISOString(),
  };
}
