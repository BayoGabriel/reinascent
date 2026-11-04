"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { rateLimiter, rateLimitKey } from "@/server/security/rate-limit";
import { getGuestSessionId } from "@/server/guest/guest-session";
import { getCurrentUser } from "@/server/auth/current-user";
import { ServiceError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { beginCheckout } from "./service";
import { checkoutInputSchema } from "./schema";

export interface CheckoutFormState {
  error: string | null;
  fieldErrors?: Record<string, string[]>;
}

/** Validates shipping details, creates the pending order, and redirects to
 *  Paystack's hosted checkout. All pricing is recomputed server-side. */
export async function placeOrder(
  _prev: CheckoutFormState,
  formData: FormData,
): Promise<CheckoutFormState> {
  const ip = (await headers()).get("x-forwarded-for");
  if (!rateLimiter.consume(rateLimitKey("checkout", ip), 10, 60_000)) {
    return { error: "Too many attempts — please wait a minute and retry." };
  }

  const parsed = checkoutInputSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
  });
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return {
      error: "Please correct the highlighted fields.",
      fieldErrors: flat.fieldErrors as Record<string, string[]>,
    };
  }

  let authorizationUrl: string;
  try {
    const user = await getCurrentUser();
    ({ authorizationUrl } = await beginCheckout(parsed.data, {
      guestToken: await getGuestSessionId(),
      userId: user?._id.toHexString() ?? null,
    }));
  } catch (error) {
    if (error instanceof ServiceError) {
      return { error: error.message };
    }
    logger.error("checkout failed", {
      reason: error instanceof Error ? error.name : "unknown",
    });
    return { error: "Checkout failed — please try again." };
  }
  // Outside try/catch — redirect() throws NEXT_REDIRECT to signal navigation.
  redirect(authorizationUrl);
}
