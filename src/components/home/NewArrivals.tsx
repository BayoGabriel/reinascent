import { ProductCard } from "@/components/products/ProductCard";
import { listNewArrivals } from "@/features/products/service";
import { getWishlistSlugs } from "@/features/wishlist/service";

/** "New Arrivals" grid — newest products by `createdAt` (seeds use the badge). */
export async function NewArrivals() {
  const products = await listNewArrivals(3);
  const wishlist = new Set(await getWishlistSlugs());
  if (!products.length) return null;
  return (
    <section
      aria-labelledby="new-arrivals"
      className="mx-auto w-full max-w-7xl px-4 py-20 font-instrument sm:px-6"
    >
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <h2
          id="new-arrivals"
          className="text-4xl font-medium tracking-tight text-[#1F253F] sm:text-5xl"
        >
          New arrivals
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-[#1F253F]/60">
          Fresh pours and new carvings straight from the workshop — discover the
          latest incense, burners, and blends before they sell through.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={{
              name: p.name,
              imageUrl: p.images[0]?.url ?? "",
              alt: p.images[0]?.alt ?? p.name,
              price: p.price,
              href: `/products/${p.slug}`,
              slug: p.slug,
              wishlisted: wishlist.has(p.slug),
            }}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        ))}
      </div>
    </section>
  );
}
