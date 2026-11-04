/** Order domain types — the order is an immutable purchase snapshot:
 *  product names, prices, and images are copied at checkout so later
 *  catalog edits never rewrite order history. */

export type PaymentStatus = "pending" | "paid" | "failed";
export type FulfillmentStatus = "unfulfilled" | "fulfilled" | "cancelled";

/** Snapshotted cart line — display fields are frozen at purchase time. */
export interface OrderItem {
  slug: string;
  name: string;
  ref: string;
  size: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
  imageUrl: string;
  alt: string;
}

export interface OrderCustomer {
  name: string;
  email: string;
  phone: string;
}

export interface OrderShipping {
  address: string;
  method: string;
}

/** Serialized order — plain JSON only (orderNumber is the public id). */
export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  customer: OrderCustomer;
  shipping: OrderShipping;
  subtotal: number;
  shippingFee: number;
  total: number;
  currency: string;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  paymentReference: string;
  paymentChannel: string | null;
  paidAt: string | null;
  fulfillmentStatus: FulfillmentStatus;
  createdAt: string;
}
