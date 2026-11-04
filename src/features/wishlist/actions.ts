"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { rateLimiter, rateLimitKey } from "@/server/security/rate-limit";
import { toggleWishlistItem as toggleItem } from "./service";
import { wishlistSlugSchema } from "./schema";

async function allowed(): Promise<boolean> {
  const ip = (await headers()).get("x-forwarded-for");
  return rateLimiter.consume(rateLimitKey("wishlist", ip), 60, 60_000);
}

/** Form action for the heart toggle — a hidden `slug` field carries the target. */
export async function toggleWishlistItem(formData: FormData): Promise<void> {
  if (!(await allowed())) return;
  const parsed = wishlistSlugSchema.safeParse(formData.get("slug"));
  if (!parsed.success) return;
  await toggleItem(parsed.data);
  revalidatePath("/wishlist");
}
