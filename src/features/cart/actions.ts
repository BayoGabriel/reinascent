"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { rateLimiter, rateLimitKey } from "@/server/security/rate-limit";
import {
  addCartItem,
  removeCartItem,
  setCartItemQty,
} from "./service";
import { cartItemInputSchema, cartQtySchema } from "./schema";

async function allowed(): Promise<boolean> {
  const ip = (await headers()).get("x-forwarded-for");
  return rateLimiter.consume(rateLimitKey("cart", ip), 60, 60_000);
}

export async function addToCart(input: {
  slug: string;
  size?: string;
  qty?: number;
}): Promise<void> {
  if (!(await allowed())) return;
  const parsed = cartItemInputSchema.safeParse(input);
  if (!parsed.success) return;
  await addCartItem(parsed.data);
  revalidatePath("/cart");
}

/** Form action for the qty stepper — clicked button carries the new qty. */
export async function updateCartQty(formData: FormData): Promise<void> {
  if (!(await allowed())) return;
  const parsed = cartQtySchema.safeParse({
    slug: formData.get("slug"),
    size: formData.get("size") ?? "",
    qty: Number(formData.get("qty")),
  });
  if (!parsed.success) return;
  await setCartItemQty(parsed.data);
  revalidatePath("/cart");
}

export async function removeFromCart(formData: FormData): Promise<void> {
  if (!(await allowed())) return;
  const slug = formData.get("slug");
  const size = formData.get("size");
  if (typeof slug !== "string" || !slug) return;
  await removeCartItem(slug, typeof size === "string" ? size : "");
  revalidatePath("/cart");
}
