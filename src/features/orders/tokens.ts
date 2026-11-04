import { createHash, randomBytes } from "node:crypto";

/**
 * Order identifiers and access tokens — pure helpers kept free of
 * "server-only" so they stay unit-testable.
 */

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no ambiguous chars

function randomChars(length: number): string {
  const bytes = randomBytes(length);
  let out = "";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return out;
}

/** Human-friendly, unguessable-enough order number, e.g. `RS-26M4X2-7F3Q`. */
export function generateOrderNumber(now = new Date()): string {
  const stamp = now.getTime().toString(36).toUpperCase().slice(-6);
  return `RS-${stamp}-${randomChars(4)}`;
}

/** Payment reference sent to Paystack — unique per charge attempt. */
export function generatePaymentReference(orderNumber: string): string {
  return `${orderNumber}-${randomChars(6)}`;
}

/** Raw capability token for shareable order links (emailed receipts). */
export function generateAccessToken(): string {
  return randomBytes(32).toString("hex");
}

/** Stored form of the access token — the raw value never persists. */
export function hashAccessToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
