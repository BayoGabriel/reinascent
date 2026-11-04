import "server-only";

import { ServiceError } from "@/lib/errors";
import {
  getPaymentMethodRepository,
  type PaymentMethodDocument,
} from "@/server/repositories/payment-method.repository";
import type { CardInput } from "./schemas";
import type { SavedCard } from "./types";

function toSavedCard(doc: PaymentMethodDocument): SavedCard {
  return {
    id: doc._id.toHexString(),
    brand: doc.brand,
    last4: doc.last4,
    expMonth: doc.expMonth,
    expYear: doc.expYear,
    nameOnCard: doc.nameOnCard,
    isDefault: doc.isDefault,
  };
}

export async function listCards(userId: string): Promise<SavedCard[]> {
  const repo = await getPaymentMethodRepository();
  if (!repo) return [];
  return (await repo.listByUser(userId)).map(toSavedCard);
}

/** Card brand from the leading digits — display label only. */
function detectBrand(digits: string): string {
  if (/^4/.test(digits)) return "Visa";
  if (/^5[1-5]/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "Amex";
  if (/^6/.test(digits)) return "Discover";
  return "Card";
}

/**
 * Persist the card's display-safe metadata. The full PAN and CVV are used
 * only to validate the entry — they are never stored. A production adapter
 * would exchange them for a Paystack authorization code (`providerRef`).
 */
export async function saveCard(
  userId: string,
  input: CardInput,
): Promise<void> {
  const repo = await getPaymentMethodRepository();
  if (!repo) {
    throw new ServiceError("internal", "Payments are unavailable.", 503);
  }
  const patch = {
    brand: detectBrand(input.cardNumber),
    last4: input.cardNumber.slice(-4),
    expMonth: input.expMonth,
    expYear: input.expYear,
    nameOnCard: input.nameOnCard,
    providerRef: null,
  };
  const updated = await repo.updateDefault(userId, patch);
  if (!updated) await repo.insert({ userId, ...patch });
}

export async function setDefaultCard(
  userId: string,
  cardId: string,
): Promise<boolean> {
  const repo = await getPaymentMethodRepository();
  if (!repo) return false;
  return repo.setDefault(userId, cardId);
}
