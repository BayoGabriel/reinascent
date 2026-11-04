import { updateTag } from "next/cache";

import { ServiceError } from "@/lib/errors";
import { getOrderRepository } from "@/server/repositories/order.repository";
import { getProductRepository } from "@/server/repositories/product.repository";
import { saveReviewPhotos } from "@/server/storage/review-photos";
import { notFound, serviceUnavailable, type ServiceResult } from "@/types/api";
import type { ReviewSubmission } from "./schema";
import { getProductBySlug } from "./service";
import type { Product, ProductReview } from "./types";

const TAG = "products";

export type ReviewStatus =
  | "eligible"
  | "not_purchased"
  | "already_reviewed"
  | "unavailable";

export interface ReviewContext {
  product: Product;
  status: ReviewStatus;
  /** Purchased line item (qty/variant) for the review page header. */
  orderItem: { qty: number; variant: string } | null;
}

/**
 * Per-user review context — never cached: it depends on the caller's orders
 * and whether they already reviewed the product.
 */
export async function getReviewContext(
  userId: string,
  slug: string,
): Promise<ReviewContext | null> {
  const product = await getProductBySlug(slug);
  if (!product) return null;
  const orderRepo = await getOrderRepository();
  if (!orderRepo) return { product, status: "unavailable", orderItem: null };
  const orderItem = await orderRepo.findPurchasedItem(userId, slug);
  if (!orderItem) return { product, status: "not_purchased", orderItem: null };
  if (product.reviews.some((r) => r.userId === userId)) {
    return { product, status: "already_reviewed", orderItem };
  }
  return { product, status: "eligible", orderItem };
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "12th August 2025" — matches the seeded review date style. */
function formatReviewDate(d: Date): string {
  const day = d.getDate();
  const suf = day % 10 === 1 && day !== 11 ? "st"
    : day % 10 === 2 && day !== 12 ? "nd"
    : day % 10 === 3 && day !== 13 ? "rd" : "th";
  return `${day}${suf} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Submit a verified-purchase review. Purchase proof comes from the orders
 * collection — never from client claims. One review per user per product.
 */
export async function submitReview(
  author: { userId: string; displayName: string },
  input: ReviewSubmission & { photos: File[] },
): Promise<ServiceResult<null>> {
  const repo = await getProductRepository();
  const orderRepo = await getOrderRepository();
  if (!repo || !orderRepo) return serviceUnavailable();
  if (!(await repo.findBySlug(input.slug))) return notFound("Product");
  const purchased = await orderRepo.findPurchasedItem(author.userId, input.slug);
  if (!purchased) {
    return {
      ok: false,
      status: 403,
      code: "forbidden",
      message: "You can only review products you've purchased.",
    };
  }
  let photoIds: string[];
  try {
    photoIds = await saveReviewPhotos(author.userId, input.photos);
  } catch (error) {
    if (error instanceof ServiceError) {
      return { ok: false, status: error.status, code: error.code, message: error.message };
    }
    throw error;
  }
  const review: ProductReview = {
    userId: author.userId,
    author: author.displayName,
    role: "Verified Buyer",
    rating: input.rating,
    date: formatReviewDate(new Date()),
    title: input.title,
    text: input.body,
    photoIds,
    avatarUrl: "",
  };
  const result = await repo.appendReview(input.slug, review);
  if (result === "missing") return notFound("Product");
  if (result === "duplicate") {
    return {
      ok: false,
      status: 409,
      code: "conflict",
      message: "You've already reviewed this product.",
    };
  }
  updateTag(TAG);
  return { ok: true, data: null };
}
