import { createHmac } from "node:crypto";

import { describe, expect, it } from "vitest";

import { formatPrice, lineTotalMinor, toMinorUnits } from "@/lib/money";
import { checkoutInputSchema } from "@/features/checkout/schema";
import {
  generateAccessToken,
  generateOrderNumber,
  generatePaymentReference,
  hashAccessToken,
} from "@/features/orders/tokens";
import { isValidWebhookSignature } from "@/server/payments/paystack";

describe("money helpers", () => {
  it("converts major units to integer minor units", () => {
    expect(toMinorUnits(152)).toBe(15200);
    expect(toMinorUnits(123.45)).toBe(12345);
    expect(toMinorUnits(0.1)).toBe(10);
  });

  it("computes line totals without float drift", () => {
    expect(lineTotalMinor(19.99, 3)).toBe(5997);
  });

  it("formats prices like the storefront", () => {
    expect(formatPrice(1765)).toBe("$1,765.00");
    expect(formatPrice(123.45)).toBe("$123.45");
  });
});

describe("order tokens", () => {
  it("generates prefixed, unguessable order numbers", () => {
    const n = generateOrderNumber();
    expect(n).toMatch(/^RS-[0-9A-Z]+-[0-9A-Z]{4}$/);
    expect(generateOrderNumber()).not.toBe(n);
  });

  it("derives payment references from the order number", () => {
    expect(generatePaymentReference("RS-ABC-1234")).toMatch(
      /^RS-ABC-1234-[0-9A-Z]{6}$/,
    );
  });

  it("hashes access tokens deterministically", () => {
    const token = generateAccessToken();
    expect(token).toMatch(/^[0-9a-f]{64}$/);
    expect(hashAccessToken(token)).toBe(hashAccessToken(token));
    expect(hashAccessToken(token)).not.toBe(token);
  });
});

describe("checkoutInputSchema", () => {
  const valid = {
    name: "Abdulazeez Abubakar Sadiq",
    email: "abubakarsadiq@example.com",
    phone: "+23470975858",
    address: "No 123, Trademore estate, Lugbe Abuja",
  };

  it("accepts a complete shipping form", () => {
    expect(checkoutInputSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects bad email, phone, and short fields", () => {
    for (const patch of [
      { email: "nope" },
      { phone: "abc" },
      { name: "x" },
      { address: "No" },
    ]) {
      expect(checkoutInputSchema.safeParse({ ...valid, ...patch }).success).toBe(
        false,
      );
    }
  });
});

describe("paystack webhook signature", () => {
  it("accepts a valid HMAC-SHA512 signature", () => {
    process.env.PAYSTACK_SECRET_KEY = "sk_test_secret";
    const body = JSON.stringify({ event: "charge.success" });
    const sig = createHmac("sha512", "sk_test_secret")
      .update(body)
      .digest("hex");
    expect(isValidWebhookSignature(body, sig)).toBe(true);
  });

  it("rejects wrong or missing signatures", () => {
    process.env.PAYSTACK_SECRET_KEY = "sk_test_secret";
    expect(isValidWebhookSignature("{}", "deadbeef")).toBe(false);
    expect(isValidWebhookSignature("{}", null)).toBe(false);
  });
});
