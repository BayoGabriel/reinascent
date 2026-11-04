import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { env } from "@/lib/env";
import { ServiceError } from "@/lib/errors";
import { logger } from "@/lib/logger";

/**
 * Paystack hosted-checkout adapter. The storefront never touches card data:
 * we initialize a transaction server-side, redirect the shopper to Paystack's
 * authorization_url, and confirm payment only through server-side
 * verification (callback + webhook), never from browser claims alone.
 */

const API_BASE = "https://api.paystack.co";
const TIMEOUT_MS = 15_000;

export interface InitializeInput {
  email: string;
  /** Amount in minor units (kobo/cents). */
  amount: number;
  currency: string;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}

export interface VerifiedTransaction {
  reference: string;
  status: string;
  amount: number;
  currency: string;
  channel: string | null;
  paidAt: string | null;
}

export function paystackConfigured(): boolean {
  return env.paystackSecretKey != null;
}

function requireKey(): string {
  const key = env.paystackSecretKey;
  if (!key) {
    throw new ServiceError(
      "internal",
      "Online payment is not configured.",
      503,
    );
  }
  return key;
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: {
      Authorization: `Bearer ${requireKey()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const body = (await res.json().catch(() => null)) as {
    status?: boolean;
    message?: string;
    data?: T;
  } | null;
  if (!res.ok || !body?.status || body.data == null) {
    logger.warn("paystack api failure", { path, status: res.status });
    throw new ServiceError(
      "internal",
      "Payment provider request failed.",
      502,
    );
  }
  return body.data;
}

/** Create a transaction; returns the hosted checkout URL to redirect to. */
export async function initializeTransaction(
  input: InitializeInput,
): Promise<{ authorizationUrl: string; reference: string }> {
  const data = await call<{ authorization_url: string; reference: string }>(
    "/transaction/initialize",
    {
      method: "POST",
      body: JSON.stringify({
        email: input.email,
        amount: input.amount,
        currency: input.currency,
        reference: input.reference,
        callback_url: input.callbackUrl,
        metadata: input.metadata,
      }),
    },
  );
  return { authorizationUrl: data.authorization_url, reference: data.reference };
}

/** Server-side source of truth for a charge's outcome. */
export async function verifyTransaction(
  reference: string,
): Promise<VerifiedTransaction> {
  const data = await call<{
    reference: string;
    status: string;
    amount: number;
    currency: string;
    channel?: string;
    paid_at?: string;
  }>(`/transaction/verify/${encodeURIComponent(reference)}`);
  return {
    reference: data.reference,
    status: data.status,
    amount: data.amount,
    currency: data.currency,
    channel: data.channel ?? null,
    paidAt: data.paid_at ?? null,
  };
}

/** Timing-safe check of `x-paystack-signature` against the raw body. */
export function isValidWebhookSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  const key = env.paystackSecretKey;
  if (!key || !signature) return false;
  const expected = createHmac("sha512", key).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
