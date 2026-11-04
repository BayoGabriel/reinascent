import Link from "next/link";

import { ProductCard } from "@/components/products/ProductCard";
import { getWishlist } from "../service";

/** The visitor's saved products — reads the request's session/guest cookie,
 *  so it always renders inside a Suspense boundary. */
export async function WishlistGrid() {
  const wishlist = await getWishlist();
  if (!wishlist.items.length) {
    return (
      <div className="py-16 text-center">
        <p className="text-cocoa">
          Your wish list is empty — save pieces you love and they&apos;ll wait
          here.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-cocoa focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          Browse the shop
        </Link>
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {wishlist.items.map((item) => (
        <ProductCard
          key={item.slug}
          product={{
            slug: item.slug,
            name: item.name,
            imageUrl: item.imageUrl,
            alt: item.alt,
            price: item.price,
            href: item.href,
            wishlisted: true,
          }}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
      ))}
    </div>
  );
}
