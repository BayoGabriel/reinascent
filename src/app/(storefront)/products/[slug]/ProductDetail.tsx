import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { ProductCard } from "@/components/products/ProductCard";
import { BuyBox } from "@/features/products/components/BuyBox";
import { ProductGallery } from "@/features/products/components/ProductGallery";
import { RatingSummary } from "@/features/products/components/RatingSummary";
import { ReviewCard } from "@/features/products/components/ReviewCard";
import { getProductBySlug, listProducts } from "@/features/products/service";
import { getWishlistSlugs } from "@/features/wishlist/service";

interface ProductDetailProps {
  params: Promise<{ slug: string }>;
}

/** Full PDP composition — gallery, buy box, reviews, related products. */
export async function ProductDetail({ params }: ProductDetailProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const related = (await listProducts(8)).filter((p) => p.slug !== slug).slice(0, 4);
  const wishlist = new Set(await getWishlistSlugs());
  return (
    <article className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <Link
        href="/products"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-cocoa transition-colors hover:text-[#1F253F]"
      >
        <Icon name="arrowUpRight" className="size-3.5 rotate-[225deg]" /> Back
      </Link>
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <ProductGallery images={product.images} />
        <BuyBox
          slug={product.slug}
          name={product.name}
          wishlisted={wishlist.has(product.slug)}
          price={product.price}
          compareAtPrice={product.compareAtPrice}
          badge={product.badge}
          description={product.description}
          sizes={product.sizes}
        />
      </div>
      <section aria-labelledby="reviews" className="mt-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 id="reviews" className="text-lg font-semibold text-[#1F253F]">
            Ratings and Reviews
          </h2>
          <Link
            href={`/products/${product.slug}/review`}
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-1.5 text-xs font-medium text-cocoa transition-colors hover:border-ink hover:text-[#1F253F]"
          >
            Write a review <Icon name="arrowUpRight" className="size-3" />
          </Link>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
          <RatingSummary
            ratingValue={product.ratingValue}
            ratingCount={product.ratingCount}
            reviews={product.reviews}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {product.reviews.map((r, i) => (
              <ReviewCard key={`${r.author}-${i}`} review={r} />
            ))}
          </div>
        </div>
      </section>
      {related.length > 0 && (
        <section aria-labelledby="related" className="mt-16">
          <h2 id="related" className="mb-6 font-serif text-3xl font-medium text-[#1F253F]">
            You Might Also Like
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
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
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
