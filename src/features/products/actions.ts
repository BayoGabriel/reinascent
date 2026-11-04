"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { logger } from "@/lib/logger";
import { getCurrentUser } from "@/server/auth/current-user";
import { rateLimiter, rateLimitKey } from "@/server/security/rate-limit";
import { submitReview } from "./review-service";
import { reviewSubmissionSchema } from "./schema";
import type { ReviewFormState } from "./types";

export async function submitReviewAction(
  _prev: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const forwarded = (await headers()).get("x-forwarded-for");
  const key = rateLimitKey("review", forwarded);
  if (!rateLimiter.consume(`${key}:${user._id.toHexString()}`, 10, 60 * 60_000)) {
    return { message: "Too many attempts. Try again later." };
  }

  const parsed = reviewSubmissionSchema.safeParse({
    slug: formData.get("slug"),
    rating: Number(formData.get("rating")),
    title: formData.get("title"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const photos = formData
    .getAll("photos")
    .filter((f): f is File => f instanceof File && f.size > 0);

  const result = await submitReview(
    { userId: user._id.toHexString(), displayName: user.displayName },
    { ...parsed.data, photos },
  );
  if (!result.ok) {
    if (result.status >= 500) {
      logger.error("Review submission failed", { status: result.status });
    }
    return { message: result.message };
  }
  redirect(`/products/${parsed.data.slug}`);
}
