import { NextResponse, type NextRequest } from "next/server";

import { confirmPayment } from "@/features/orders/service";
import { getOrderRepository } from "@/server/repositories/order.repository";
import { ServiceError } from "@/lib/errors";
import { logger } from "@/lib/logger";

/**
 * Paystack redirects the shopper here after hosted checkout. The browser
 * return is never trusted on its own — confirmPayment re-verifies the
 * charge with Paystack's API before marking the order paid.
 */
export async function GET(request: NextRequest) {
  const reference =
    request.nextUrl.searchParams.get("reference") ??
    request.nextUrl.searchParams.get("trxref");
  const base = request.nextUrl.origin;

  if (!reference) {
    return NextResponse.redirect(`${base}/checkout?error=missing-reference`);
  }

  try {
    const order = await confirmPayment(reference);
    return NextResponse.redirect(
      `${base}/orders/${order.orderNumber}?paid=1`,
    );
  } catch (error) {
    // Verification failed or is still processing — send the shopper to the
    // order page if we can resolve it, else back to checkout with a flag.
    const repo = await getOrderRepository();
    const order = repo ? await repo.findByReference(reference) : null;
    if (order) {
      return NextResponse.redirect(
        `${base}/orders/${order.orderNumber}?payment=failed`,
      );
    }
    if (!(error instanceof ServiceError)) {
      logger.error("paystack callback failed", {
        reason: error instanceof Error ? error.name : "unknown",
      });
    }
    return NextResponse.redirect(`${base}/checkout?error=payment-failed`);
  }
}
