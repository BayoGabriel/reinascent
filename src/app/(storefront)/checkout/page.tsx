import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { getCart } from "@/features/cart/service";
import { getCurrentUser } from "@/server/auth/current-user";
import { env } from "@/lib/env";
import { formatPrice } from "@/lib/money";
import { CheckoutForm } from "@/features/checkout/components/CheckoutForm";
import { CheckoutSummary } from "@/features/checkout/components/CheckoutSummary";

export const metadata: Metadata = { title: "Checkout — Raina Scents" };

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutContent />
    </Suspense>
  );
}

async function CheckoutContent() {
  const cart = await getCart();
  const user = await getCurrentUser().catch(() => null);
  const shippingFee = env.shippingFee;
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <Link
        href="/cart"
        className="inline-flex items-center gap-1.5 text-sm text-cocoa transition-colors hover:text-[#1F253F]"
      >
        <Icon name="arrowUpRight" className="size-3.5 rotate-[225deg]" /> Back
      </Link>
      <h1 className="mt-6 mb-10 text-center font-serif text-3xl font-medium tracking-tight text-[#1F253F] sm:text-4xl">
        Checkout
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
        <div className="grid gap-10 lg:grid-cols-[1fr_24rem]">
          <div>
            <h2 className="mb-6 font-serif text-xl font-medium text-[#1F253F]">
              Shipping Details
            </h2>
            <CheckoutForm
              totalLabel={formatPrice(cart.subtotal + shippingFee)}
              defaultName={user?.displayName}
              defaultEmail={user?.email}
            />
          </div>
          <CheckoutSummary cart={cart} shippingFee={shippingFee} />
        </div>
      )}
    </section>
  );
}
