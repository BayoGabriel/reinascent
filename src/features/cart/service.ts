import { getCartRepository } from "@/server/repositories/cart.repository";
import { ensureGuestSession, getGuestSessionId } from "@/server/guest/guest-session";
import { getProductsBySlugs } from "@/features/products/service";
import type { Cart, CartItem, StoredCartItem } from "./types";
import type { CartItemInput, CartQtyInput } from "./schema";

const EMPTY: Cart = { items: [], subtotal: 0, count: 0 };

/** Current guest's cart, hydrated with live product data. Not cached —
 *  it is specific to the request's guest cookie. */
export async function getCart(): Promise<Cart> {
  const token = await getGuestSessionId();
  const repo = await getCartRepository();
  if (!token || !repo) return EMPTY;
  const stored = await repo.getItems(token);
  if (!stored.length) return EMPTY;
  const products = await getProductsBySlugs(stored.map((i) => i.slug));
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const items: CartItem[] = stored.flatMap((item) => {
    const p = bySlug.get(item.slug);
    if (!p) return [];
    return [
      {
        slug: item.slug,
        size: item.size,
        qty: item.qty,
        name: p.name,
        ref: `#${p.id.slice(-6)}`,
        price: p.price,
        imageUrl: p.images[0]?.url ?? "",
        alt: p.images[0]?.alt ?? p.name,
        href: `/products/${p.slug}`,
        lineTotal: p.price * item.qty,
      },
    ];
  });
  return {
    items,
    subtotal: items.reduce((sum, i) => sum + i.lineTotal, 0),
    count: items.reduce((sum, i) => sum + i.qty, 0),
  };
}

async function mutate(
  fn: (items: StoredCartItem[]) => StoredCartItem[],
): Promise<void> {
  const repo = await getCartRepository();
  if (!repo) return;
  const token = await ensureGuestSession();
  const current = await repo.getItems(token);
  await repo.saveItems(token, fn(current));
}

/** Add (or merge into) a cart line — same slug+size shares a line. */
export async function addCartItem(input: CartItemInput): Promise<void> {
  await mutate((items) => {
    const idx = items.findIndex((i) => i.slug === input.slug && i.size === input.size);
    if (idx === -1) {
      return [...items, { slug: input.slug, size: input.size, qty: input.qty }];
    }
    const next = [...items];
    next[idx] = { ...next[idx], qty: Math.min(99, next[idx].qty + input.qty) };
    return next;
  });
}

/** Set a line's quantity; qty 0 removes the line. */
export async function setCartItemQty(input: CartQtyInput): Promise<void> {
  await mutate((items) =>
    input.qty <= 0
      ? items.filter((i) => !(i.slug === input.slug && i.size === input.size))
      : items.map((i) =>
          i.slug === input.slug && i.size === input.size
            ? { ...i, qty: input.qty }
            : i,
        ),
  );
}

export async function removeCartItem(slug: string, size: string): Promise<void> {
  await mutate((items) =>
    items.filter((i) => !(i.slug === slug && i.size === size)),
  );
}

/** Empty a guest's cart by token — used after a confirmed payment, where
 *  the ordering token comes from the order rather than the cookie jar. */
export async function clearGuestCart(token: string): Promise<void> {
  const repo = await getCartRepository();
  if (!repo) return;
  await repo.saveItems(token, []);
}
