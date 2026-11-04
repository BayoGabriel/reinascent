import Link from "next/link";
import { notFound } from "next/navigation";

import { Icon } from "@/components/ui/Icon";
import { ReviewForm } from "@/features/products/components/ReviewForm";
import { ReviewProductCard } from "@/features/products/components/ReviewProductCard";
import {
  getReviewContext,
  type ReviewStatus,
} from "@/features/products/review-service";
import { requireUser } from "@/server/auth/current-user";

const NOTICE: Record<Exclude<ReviewStatus, "eligible">, string> = {
  not_purchased: "You can only review products you've purchased.",
  already_reviewed: "You've already reviewed this product.",
  unavailable: "Reviews are temporarily unavailable. Please try again later.",
};

/** Signed-in, verified-purchase gate around the review form. */
export async function ReviewGate({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireUser();
  const ctx = await getReviewContext(user._id.toHexString(), slug);
  if (!ctx) notFound();
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href={`/products/${slug}`}
        className="mb-8 inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-xs font-medium text-cocoa transition-colors hover:text-[#1F253F]"
      >
        <Icon name="arrowUpRight" className="size-3 rotate-[225deg]" /> Back
      </Link>
      <h1 className="text-center font-serif text-3xl font-semibold text-[#1F253F] sm:text-4xl">
        Rate This Product
      </h1>
      <ReviewProductCard product={ctx.product} orderItem={ctx.orderItem} />
      {ctx.status === "eligible" ? (
        <ReviewForm slug={slug} />
      ) : (
        <p
          role="status"
          className="mt-10 rounded-2xl border border-line bg-cream/60 px-6 py-5 text-center text-sm text-cocoa"
        >
          {NOTICE[ctx.status]}
        </p>
      )}
    </article>
  );
}
