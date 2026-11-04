import "server-only";

import { env } from "@/lib/env";
import { ServiceError } from "@/lib/errors";
import { toMinorUnits } from "@/lib/money";
import {
  initializeTransaction,
  paystackConfigured,
} from "@/server/payments/paystack";
import { getCart } from "@/features/cart/service";
import { createOrder } from "@/features/orders/service";
import {
  generateAccessToken,
  hashAccessToken,
} from "@/features/orders/tokens";
import type { OrderItemDocument } from "@/server/repositories/order.repository";
import type { CheckoutInput } from "./schema";

export interface CheckoutContext {
  guestToken: string | null;
  userId: string | null;
}

/**
 * Begin checkout: snapshot the server-side cart into a pending order, then
 * initialize a Paystack transaction and hand back the hosted checkout URL.
 * All pricing is recomputed here — client-submitted amounts are ignored.
 */
export async function beginCheckout(
  input: CheckoutInput,
  ctx: CheckoutContext,
): Promise<{ authorizationUrl: string }> {
  if (!paystackConfigured()) {
    throw new ServiceError(
      "internal",
      "Online payment is not configured yet.",
      503,
    );
  }
  const cart = await getCart();
  if (!cart.items.length) {
    throw new ServiceError("bad_request", "Your cart is empty.", 400);
  }

  const shippingFee = env.shippingFee;
  const total = cart.subtotal + shippingFee;
  const currency = env.paystackCurrency;
  const items: OrderItemDocument[] = cart.items.map((i) => ({
    productSlug: i.slug,
    name: i.name,
    ref: i.ref,
    variant: i.size,
    qty: i.qty,
    unitPrice: i.price,
    lineTotal: i.lineTotal,
    imageUrl: i.imageUrl,
    alt: i.alt,
  }));

  const order = await createOrder({
    accessTokenHash: hashAccessToken(generateAccessToken()),
    guestToken: ctx.guestToken,
    userId: ctx.userId,
    items,
    customer: { name: input.name, email: input.email, phone: input.phone },
    shipping: { address: input.address, method: "Standard Shipping" },
    subtotal: cart.subtotal,
    shippingFee,
    total,
    currency,
    paymentMethod: "Paystack",
  });

  const tx = await initializeTransaction({
    email: input.email,
    amount: toMinorUnits(total),
    currency,
    reference: order.paymentReference,
    callbackUrl: `${env.appBaseUrl}/checkout/callback`,
    metadata: { orderNumber: order.orderNumber },
  });
  return { authorizationUrl: tx.authorizationUrl };
}
