import { cache } from "react";

import { logger } from "@/lib/logger";
import { getCurrentUser } from "@/server/auth/current-user";
import {
  ensureGuestSession,
  getGuestSessionId,
} from "@/server/guest/guest-session";
import {
  getWishlistRepository,
  type WishlistOwner,
} from "@/server/repositories/wishlist.repository";
import { getProductsBySlugs } from "@/features/products/service";
import type { Wishlist, WishlistItem } from "./types";

const EMPTY: Wishlist = { items: [], count: 0 };

/** Owner for reads: the signed-in account when present, else the guest cookie. */
async function getOwner(): Promise<WishlistOwner | null> {
  const user = await getCurrentUser();
  if (user) return { userId: user._id.toHexString() };
  const token = await getGuestSessionId();
  return token ? { token } : null;
}

/** Owner for mutations: provisions a guest token when there is no account. */
async function ensureOwner(): Promise<WishlistOwner> {
  const user = await getCurrentUser();
  if (user) return { userId: user._id.toHexString() };
  return { token: await ensureGuestSession() };
}

/** Slugs on the current visitor's list — deduplicated within one render pass. */
export const getWishlistSlugs = cache(async (): Promise<string[]> => {
  const repo = await getWishlistRepository();
  const owner = await getOwner();
  if (!repo || !owner) return [];
  return repo.getSlugs(owner);
});

/** Current visitor's wishlist, hydrated with live product data. Not cached —
 *  it is specific to the request's session/guest cookie. */
export async function getWishlist(): Promise<Wishlist> {
  const slugs = await getWishlistSlugs();
  if (!slugs.length) return EMPTY;
  const products = await getProductsBySlugs(slugs);
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const items: WishlistItem[] = slugs.flatMap((slug) => {
    const p = bySlug.get(slug);
    if (!p) return [];
    return [
      {
        slug: p.slug,
        name: p.name,
        price: p.price,
        imageUrl: p.images[0]?.url ?? "",
        alt: p.images[0]?.alt ?? p.name,
        href: `/products/${p.slug}`,
      },
    ];
  });
  return { items, count: items.length };
}

async function mutate(fn: (slugs: string[]) => string[]): Promise<void> {
  const repo = await getWishlistRepository();
  if (!repo) return;
  const owner = await ensureOwner();
  const current = await repo.getSlugs(owner);
  await repo.saveSlugs(owner, fn(current));
}

/** Toggle a product on or off the list — guests and members alike. */
export async function toggleWishlistItem(slug: string): Promise<void> {
  await mutate((slugs) =>
    slugs.includes(slug) ? slugs.filter((s) => s !== slug) : [...slugs, slug],
  );
}

/** Move the anonymous wishlist onto the account at sign-in/registration.
 *  Best-effort: auth must not fail because a wishlist could not merge. */
export async function claimGuestWishlistForUser(
  userId: string,
): Promise<void> {
  const repo = await getWishlistRepository();
  const token = await getGuestSessionId();
  if (!repo || !token) return;
  try {
    const claimed = await repo.claimGuestWishlist(token, userId);
    if (claimed) logger.info("Guest wishlist claimed", { userId });
  } catch {
    logger.error("Guest wishlist claim failed", { userId });
  }
}
