import "server-only";

import {
  getOrderRepository,
  type NewOrder,
  type OrderDocument,
} from "@/server/repositories/order.repository";
import { toOrder } from "./serialize";
import { verifyTransaction } from "@/server/payments/paystack";
import { clearGuestCart } from "@/features/cart/service";
import { ServiceError } from "@/lib/errors";
import { toMinorUnits } from "@/lib/money";
import { logger } from "@/lib/logger";
import {
  generateOrderNumber,
  generatePaymentReference,
  hashAccessToken,
} from "./tokens";
import type { Order } from "./types";

const MAX_INSERT_ATTEMPTS = 3;

/** Persist a pending order; the payment reference derives from the final
 *  order number so retries on a number collision stay consistent. */
export async function createOrder(
  draft: Omit<
    NewOrder,
    "orderNumber" | "paymentReference" | "paymentStatus" | "fulfillmentStatus"
  >,
): Promise<OrderDocument> {
  const repo = await getOrderRepository();
  if (!repo) {
    throw new ServiceError("internal", "Checkout is unavailable.", 503);
  }
  for (let attempt = 0; attempt < MAX_INSERT_ATTEMPTS; attempt += 1) {
    const orderNumber = generateOrderNumber();
    try {
      return await repo.insert({
        ...draft,
        orderNumber,
        paymentReference: generatePaymentReference(orderNumber),
        paymentStatus: "pending",
        fulfillmentStatus: "unfulfilled",
      });
    } catch (error) {
      const duplicate =
        typeof error === "object" && error !== null && "code" in error
          ? (error as { code: number }).code === 11000
          : false;
      if (!duplicate || attempt === MAX_INSERT_ATTEMPTS - 1) throw error;
    }
  }
  throw new ServiceError("internal", "Could not create order.", 500);
}

/**
 * Confirm a Paystack charge: verify with the provider (never trust the
 * browser redirect or the webhook body), then transition pending→paid
 * exactly once and clear the ordering guest's cart. Idempotent — safe for
 * callback + webhook races and webhook retries.
 */
export async function confirmPayment(reference: string): Promise<Order> {
  const repo = await getOrderRepository();
  if (!repo) throw new ServiceError("internal", "Service unavailable.", 503);

  const order = await repo.findByReference(reference);
  if (!order) {
    logger.warn("payment reference with no order", { reference });
    throw new ServiceError("not_found", "Unknown payment reference.", 404);
  }
  if (order.paymentStatus === "paid") return toOrder(order);

  const tx = await verifyTransaction(reference);
  const paid =
    tx.status === "success" &&
    tx.reference === order.paymentReference &&
    tx.amount === toMinorUnits(order.total) &&
    tx.currency.toUpperCase() === order.currency.toUpperCase();

  if (!paid) {
    logger.warn("payment verification mismatch", {
      orderNumber: order.orderNumber,
      status: tx.status,
    });
    throw new ServiceError("bad_request", "Payment could not be verified.");
  }

  await repo.markPaid(
    reference,
    tx.channel,
    tx.paidAt ? new Date(tx.paidAt) : new Date(),
  );
  // Non-critical cleanup — a stuck cart must not fail payment confirmation.
  if (order.guestToken) await clearGuestCart(order.guestToken).catch(() => {});
  const fresh = await repo.findByReference(reference);
  return toOrder(fresh ?? { ...order, paymentStatus: "paid" });
}

/** Who may view an order: owning guest cookie, owning account, or the
 *  shareable access token (constant-time via stored hash). */
export async function getOrderForViewer(
  orderNumber: string,
  viewer: { guestToken: string | null; userId: string | null; accessToken?: string },
): Promise<Order | null> {
  const repo = await getOrderRepository();
  if (!repo) return null;
  const doc = await repo.findByOrderNumber(orderNumber);
  if (!doc) return null;
  const allowed =
    (viewer.guestToken != null && doc.guestToken === viewer.guestToken) ||
    (viewer.userId != null && doc.userId === viewer.userId) ||
    (viewer.accessToken != null &&
      hashAccessToken(viewer.accessToken) === doc.accessTokenHash);
  return allowed ? toOrder(doc) : null;
}
