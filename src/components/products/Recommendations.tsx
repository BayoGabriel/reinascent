import { ProductCarousel } from "./ProductCarousel";
import { listFeaturedProducts } from "@/features/products/service";
import { getWishlistSlugs } from "@/features/wishlist/service";

/** "Explore our recommendations" — featured products in a scrollable row. */
export async function Recommendations() {
  const products = await listFeaturedProducts(9);
  if (!products.length) return null;
  const wishlist = new Set(await getWishlistSlugs());
  return (
    <ProductCarousel
      title="Explore our recommendations"
      products={products.map((p) => ({
        name: p.name,
        imageUrl: p.images[0]?.url ?? "",
        alt: p.images[0]?.alt ?? p.name,
        price: p.price,
        href: `/products/${p.slug}`,
        slug: p.slug,
        wishlisted: wishlist.has(p.slug),
      }))}
    />
  );
}
