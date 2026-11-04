/**
 * Purchase-record bootstrap (npm run order:seed).
 *
 * Inserts a completed, paid order so a user is eligible to review a product.
 * Real orders come from checkout + Paystack confirmation; this script exists
 * for local development and testing only.
 *
 * Usage:
 *   npm run order:seed -- <user-email> <product-slug> [qty] [variant...]
 *
 * Run with the react-server condition so "server-only" modules resolve:
 *   node --conditions=react-server --import tsx scripts/seed-order.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: [".env.local", ".env"], quiet: true });

import { env } from "@/lib/env";
import { getDb, getMongoClient } from "@/server/db/mongodb";
import type { OrderDocument } from "@/server/repositories/order.repository";
import {
  generateAccessToken,
  generateOrderNumber,
  generatePaymentReference,
  hashAccessToken,
} from "@/features/orders/tokens";

async function main(): Promise<number> {
  const [email, slug, qtyArg, ...variantParts] = process.argv.slice(2);
  if (!email || !slug) {
    console.error(
      "Usage: npm run order:seed -- <user-email> <product-slug> [qty] [variant...]",
    );
    return 1;
  }
  const qty = Math.max(1, Number.parseInt(qtyArg ?? "1", 10) || 1);
  const variant = variantParts.join(" ").trim();

  const db = await getDb();
  const user = await db
    .collection("users")
    .findOne({ email: email.trim().toLowerCase() });
  if (!user) {
    console.error(`No user found with email ${email}`);
    return 1;
  }
  const product = await db.collection("products").findOne({ slug });
  if (!product) {
    console.error(`No product found with slug ${slug}`);
    return 1;
  }

  const lineTotal = product.price * qty;
  const orderNumber = generateOrderNumber();
  const now = new Date();
  const doc: Omit<OrderDocument, "_id"> = {
    orderNumber,
    accessTokenHash: hashAccessToken(generateAccessToken()),
    guestToken: null,
    userId: user._id.toHexString(),
    items: [
      {
        productSlug: slug,
        name: product.name,
        ref: "",
        variant,
        qty,
        unitPrice: product.price,
        lineTotal,
        imageUrl: product.images?.[0]?.url ?? "",
        alt: product.images?.[0]?.alt ?? product.name,
      },
    ],
    customer: { name: user.displayName, email: user.email, phone: "" },
    shipping: { address: "", method: "Seed" },
    subtotal: lineTotal,
    shippingFee: 0,
    total: lineTotal,
    currency: env.paystackCurrency,
    paymentStatus: "paid",
    paymentMethod: "seed",
    paymentReference: generatePaymentReference(orderNumber),
    paymentChannel: null,
    paidAt: now,
    fulfillmentStatus: "fulfilled",
    createdAt: now,
    updatedAt: now,
  };
  const orders = db.collection("orders");
  await orders.insertOne(doc);
  console.log(
    `Recorded paid order ${orderNumber}: ${email} → ${slug} (qty ${qty}${variant ? `, ${variant}` : ""})`,
  );
  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((error) => {
    console.error(
      "order:seed failed:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  })
  .finally(async () => {
    (await getMongoClient()).close();
  });
