import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { Icon } from "@/components/ui/Icon";
import { WishlistGrid } from "@/features/wishlist/components/WishlistGrid";

export const metadata: Metadata = { title: "Wish List — Raina Scents" };

export default function WishlistPage() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <Link
        href="/products"
        className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-1.5 text-sm text-cocoa transition-colors hover:text-[#1F253F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        <Icon name="arrowUpRight" className="size-3.5 rotate-[225deg]" /> Back
      </Link>
      <h1 className="mt-10 text-center font-serif text-4xl font-medium tracking-tight text-[#1F253F] sm:text-5xl">
        Wish List
      </h1>
      <div className="mt-10">
        <Suspense
          fallback={
            <p className="py-16 text-center text-cocoa">
              Loading your wish list…
            </p>
          }
        >
          <WishlistGrid />
        </Suspense>
      </div>
    </section>
  );
}
