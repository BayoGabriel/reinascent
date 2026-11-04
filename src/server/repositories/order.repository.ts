import "server-only";

import { ObjectId, type Collection } from "mongodb";

import { tryGetDb } from "@/server/db/optional";
import type {
  FulfillmentStatus,
  Order,
  OrderCustomer,
  OrderItem,
  OrderShipping,
  PaymentStatus,
} from "@/features/orders/types";

const COLLECTION = "orders";

/** Stored purchase line — snapshotted at order time. `productSlug`/`variant`
 *  are the canonical field paths (review eligibility queries them). */
export interface OrderItemDocument {
  productSlug: string;
  name: string;
  ref: string;
  variant: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
  imageUrl: string;
  alt: string;
}

/**
 * Purchase record. Checkout writes the full snapshot; review eligibility
 * only needs "this user bought this product" (`findPurchasedItem`).
 * `userId` is the hex user id (null for guest orders); `guestToken` is the
 * ske_guest cookie that placed the order.
 */
export interface OrderDocument {
  _id: ObjectId;
  orderNumber: string;
  /** SHA-256 of the shareable access token — the raw token never persists. */
  accessTokenHash: string;
  guestToken: string | null;
  userId: string | null;
  items: OrderItemDocument[];
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
  paidAt: Date | null;
  fulfillmentStatus: FulfillmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type NewOrder = Omit<
  OrderDocument,
  "_id" | "paymentChannel" | "paidAt" | "createdAt" | "updatedAt"
>;

export interface OrderRepository {
  insert(order: NewOrder): Promise<OrderDocument>;
  findByOrderNumber(orderNumber: string): Promise<OrderDocument | null>;
  findByReference(reference: string): Promise<OrderDocument | null>;
  /** Conditional pending→paid transition; true only for the first caller. */
  markPaid(
    reference: string,
    channel: string | null,
    paidAt: Date,
  ): Promise<boolean>;
  /**
   * The line item this user purchased for `productSlug`, or null when they
   * never bought it. Returned item carries qty/variant for review UI.
   */
  findPurchasedItem(
    userId: string,
    productSlug: string,
  ): Promise<Pick<OrderItemDocument, "qty" | "variant"> | null>;
  /** Account-scoped history, newest first. */
  listByUser(userId: string, limit: number): Promise<OrderDocument[]>;
  /** Admin listing with optional payment/fulfillment filters. */
  listAll(
    filter: { paymentStatus?: PaymentStatus; fulfillmentStatus?: FulfillmentStatus },
    limit: number,
    skip: number,
  ): Promise<OrderDocument[]>;
  countAll(
    filter?: { paymentStatus?: PaymentStatus; fulfillmentStatus?: FulfillmentStatus },
  ): Promise<number>;
  /** Paid revenue + order count in [from, to) — dashboard deltas. */
  salesSummary(
    from: Date,
    to: Date,
  ): Promise<{ revenue: number; orders: number }>;
  /** Paid revenue grouped by calendar day — chart series. */
  dailySales(from: Date): Promise<{ date: string; total: number; count: number }[]>;
  /** Best sellers by units sold across paid orders. */
  topProducts(
    limit: number,
  ): Promise<{ slug: string; name: string; qty: number; revenue: number }[]>;
  statusCounts(): Promise<Record<string, number>>;
  setFulfillment(
    orderNumber: string,
    status: FulfillmentStatus,
  ): Promise<boolean>;
}

export function createOrderRepository(
  collection: Collection<OrderDocument>,
): OrderRepository {
  return {
    async insert(order) {
      const now = new Date();
      const doc = {
        ...order,
        _id: new ObjectId(),
        paymentChannel: null,
        paidAt: null,
        createdAt: now,
        updatedAt: now,
      };
      await collection.insertOne(doc);
      return doc;
    },
    async findByOrderNumber(orderNumber) {
      return collection.findOne({ orderNumber });
    },
    async findByReference(reference) {
      return collection.findOne({ paymentReference: reference });
    },
    async markPaid(reference, channel, paidAt) {
      const result = await collection.updateOne(
        { paymentReference: reference, paymentStatus: { $ne: "paid" } },
        {
          $set: {
            paymentStatus: "paid",
            paymentChannel: channel,
            paidAt,
            updatedAt: new Date(),
          },
        },
      );
      return result.modifiedCount === 1;
    },
    async findPurchasedItem(userId, productSlug) {
      const doc = await collection.findOne(
        { userId, "items.productSlug": productSlug, paymentStatus: "paid" },
        { projection: { "items.$": 1 } },
      );
      const item = doc?.items[0];
      return item ? { qty: item.qty, variant: item.variant } : null;
    },
    async listByUser(userId, limit) {
      return collection
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
    },
    async listAll(filter, limit, skip) {
      return collection
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();
    },
    async countAll(filter = {}) {
      return collection.countDocuments(filter);
    },
    async salesSummary(from, to) {
      const [row] = await collection
        .aggregate<{ revenue: number; orders: number }>([
          {
            $match: {
              paymentStatus: "paid",
              paidAt: { $gte: from, $lt: to },
            },
          },
          { $group: { _id: null, revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
        ])
        .toArray();
      return row ?? { revenue: 0, orders: 0 };
    },
    async dailySales(from) {
      const rows = await collection
        .aggregate<{ _id: string; total: number; count: number }>([
          { $match: { paymentStatus: "paid", paidAt: { $gte: from } } },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$paidAt" },
              },
              total: { $sum: "$total" },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ])
        .toArray();
      return rows.map((r) => ({ date: r._id, total: r.total, count: r.count }));
    },
    async topProducts(limit) {
      return collection
        .aggregate<{ slug: string; name: string; qty: number; revenue: number }>([
          { $match: { paymentStatus: "paid" } },
          { $unwind: "$items" },
          {
            $group: {
              _id: "$items.productSlug",
              name: { $first: "$items.name" },
              qty: { $sum: "$items.qty" },
              revenue: { $sum: "$items.lineTotal" },
            },
          },
          { $sort: { qty: -1 } },
          { $limit: limit },
          {
            $project: {
              _id: 0,
              slug: "$_id",
              name: 1,
              qty: 1,
              revenue: 1,
            },
          },
        ])
        .toArray();
    },
    async statusCounts() {
      const rows = await collection
        .aggregate<{ _id: string; count: number }>([
          { $group: { _id: "$paymentStatus", count: { $sum: 1 } } },
        ])
        .toArray();
      return Object.fromEntries(rows.map((r) => [r._id, r.count]));
    },
    async setFulfillment(orderNumber, status) {
      const result = await collection.updateOne(
        { orderNumber },
        { $set: { fulfillmentStatus: status, updatedAt: new Date() } },
      );
      return result.modifiedCount === 1;
    },
  };
}

let indexReady: Promise<unknown> | null = null;

/** Null when the database is unavailable — callers degrade accordingly. */
export async function getOrderRepository(): Promise<OrderRepository | null> {
  const db = await tryGetDb();
  if (!db) return null;
  const collection = db.collection<OrderDocument>(COLLECTION);
  indexReady ??= Promise.all([
    collection.createIndex({ orderNumber: 1 }, { unique: true }),
    collection.createIndex({ paymentReference: 1 }, { unique: true }),
    collection.createIndex({ guestToken: 1, createdAt: -1 }),
    collection.createIndex({ userId: 1, "items.productSlug": 1 }),
    collection.createIndex({ userId: 1, createdAt: -1 }),
  ]).catch(() => "");
  return createOrderRepository(collection);
}

/** Serialize a document for UI — drops ownership secrets. */
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


