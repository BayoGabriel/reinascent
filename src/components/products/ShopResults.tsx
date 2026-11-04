import { getWishlistSlugs } from "@/features/wishlist/service";
import type { Product } from "@/features/products/types";
import { ProductCard } from "./ProductCard";
import { ShopToolbar } from "./ShopToolbar";

interface ShopResultsProps {
  searchParams: Promise<{ q?: string; category?: string }>;
  products: Product[];
  categories: string[];
  /** Shown when the catalog itself is empty (not a filter miss). */
  emptyMessage: string;
}

/** Toolbar + filtered product grid — reads `searchParams` and the visitor's
 *  wishlist at request time, so it always renders inside a Suspense boundary. */
export async function ShopResults({
  searchParams,
  products: all,
  categories,
  emptyMessage,
}: ShopResultsProps) {
  const { q = "", category = "" } = await searchParams;
  const needle = q.trim().toLowerCase();
  const products = all.filter(
    (p) =>
      (!category || p.badge === category) &&
      (!needle ||
        `${p.name} ${p.tagline} ${p.description}`
          .toLowerCase()
          .includes(needle)),
  );
  const wishlist = new Set(await getWishlistSlugs());
  return (
    <>
      <ShopToolbar categories={categories} query={q} category={category} />
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        {products.length === 0 ? (
          <p className="py-16 text-center text-cocoa">
            {needle || category
              ? "No scents match — try another word or category."
              : emptyMessage}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={{
                  slug: p.slug,
                  name: p.name,
                  imageUrl: p.images[0]?.url ?? "",
                  alt: p.images[0]?.alt ?? p.name,
                  price: p.price,
                  href: `/products/${p.slug}`,
                  wishlisted: wishlist.has(p.slug),
                }}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
