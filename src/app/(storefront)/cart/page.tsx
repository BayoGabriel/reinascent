import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { CartLine } from "@/features/cart/components/CartLine";
import { FlashSaleBanner } from "@/features/content-management/components/FlashSaleBanner";
import { getCart } from "@/features/cart/service";

export const metadata: Metadata = { title: "Your Cart — Raina Scents" };

export default function CartPage() {
  return (
    <Suspense fallback={null}>
      <CartContent />
    </Suspense>
  );
}

/** Guest cart — works without sign-in via the ske_guest cookie. */
async function CartContent() {
  const cart = await getCart();
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <Link
        href="/products"
        className="inline-flex items-center gap-1.5 text-sm text-cocoa transition-colors hover:text-[#1F253F]"
      >
        <Icon name="arrowUpRight" className="size-3.5 rotate-[225deg]" /> Back
      </Link>
      <h1 className="mt-6 mb-8 text-center font-serif text-3xl font-medium tracking-tight text-[#1F253F] sm:text-4xl">
        Your Cart
      </h1>
      {cart.items.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-cocoa">Your cart is empty.</p>
          <Link
            href="/products"
            className="mt-5 inline-block rounded-full bg-ink px-6 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-cocoa"
          >
            Shop the collection
          </Link>
        </div>
      ) : (
        <>
          <div className="divide-y divide-line border-y border-line">
            {cart.items.map((item) => (
              <CartLine key={`${item.slug}:${item.size}`} item={item} />
            ))}
          </div>
          <div className="mt-8 flex items-baseline justify-between">
            <p className="font-serif text-2xl font-medium text-[#1F253F]">Sub Total</p>
            <p className="text-lg font-semibold text-[#1F253F]">
              ${cart.subtotal.toFixed(2)}
            </p>
          </div>
          <Link
            href="/checkout"
            className="mx-auto mt-6 flex w-full max-w-md items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-cocoa"
          >
            Proceed to Payment <Icon name="arrowRight" className="size-4" />
          </Link>
        </>
      )}
      <div className="mt-14">
        <FlashSaleBanner />
      </div>
    </section>
  );
}
