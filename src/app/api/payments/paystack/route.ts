import { confirmPayment } from "@/features/orders/service";
import { isValidWebhookSignature } from "@/server/payments/paystack";
import { logger } from "@/lib/logger";

/**
 * Paystack webhook — the authoritative payment signal. The signature is
 * verified against the raw body, and charge.success still goes through
 * verifyTransaction before any order is marked paid (idempotent, so
 * webhook + browser-callback races and retries are safe).
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");
  if (!isValidWebhookSignature(rawBody, signature)) {
    return Response.json({ error: { code: "unauthorized" } }, { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: { code: "bad_request" } }, { status: 400 });
  }

  if (event.event === "charge.success" && event.data?.reference) {
    try {
      await confirmPayment(event.data.reference);
    } catch (error) {
      // Non-2xx tells Paystack to retry — confirmPayment is idempotent.
      logger.error("webhook confirm failed", {
        reason: error instanceof Error ? error.name : "unknown",
      });
      return Response.json(
        { error: { code: "internal" } },
        { status: 500 },
      );
    }
  }
  return Response.json({ data: { received: true } });
}
