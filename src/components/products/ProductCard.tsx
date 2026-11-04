import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { addToCart } from "@/features/cart/actions";
import { WishlistToggle } from "@/features/wishlist/components/WishlistToggle";

export interface ProductCardData {
  name: string;
  imageUrl: string;
  alt: string;
  price: number;
  href: string;
  slug?: string;
  wishlisted?: boolean;
}

interface ProductCardProps {
  product: ProductCardData;
  sizes: string;
}

/** Catalog tile — wishlist/cart buttons are placeholders until those features land. */
export function ProductCard({ product, sizes }: ProductCardProps) {
  return (
    <article className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-stone-200">
      <Image
        src={product.imageUrl}
        alt={product.alt}
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />
      <span className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/30" />
      <h3 className="absolute left-5 top-5 max-w-[60%] text-sm font-medium text-white drop-shadow">
        {product.name}
      </h3>
      <Link
        href={product.href}
        aria-label={`View ${product.name}`}
        className="absolute inset-0 rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold"
      />
      <div className="absolute right-4 top-4 flex items-center gap-1.5">
        {product.slug ? (
          <WishlistToggle
            slug={product.slug}
            name={product.name}
            wishlisted={product.wishlisted ?? false}
            className="size-8 text-white/90 hover:text-gold-soft"
          />
        ) : (
          <button
            type="button"
            aria-label={`Add ${product.name} to wishlist`}
            className="grid size-8 place-items-center rounded-full text-white/90 transition-colors hover:text-gold-soft"
          >
            <Icon name="heart" className="size-4" />
          </button>
        )}
        {product.slug ? (
          <form action={addToCart.bind(null, { slug: product.slug })}>
            <button
              type="submit"
              aria-label={`Add ${product.name} to cart`}
              className="grid size-8 place-items-center rounded-full text-white/90 transition-colors hover:text-gold-soft"
            >
              <Icon name="bag" className="size-4" />
            </button>
          </form>
        ) : (
          <button
            type="button"
            aria-label={`Add ${product.name} to cart`}
            className="grid size-8 place-items-center rounded-full text-white/90 transition-colors hover:text-gold-soft"
          >
            <Icon name="bag" className="size-4" />
          </button>
        )}
      </div>
      <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
        <p className="text-sm text-white/90 drop-shadow">
          Price:{" "}
          <span className="font-semibold text-white">
            ${product.price.toLocaleString()}
          </span>
        </p>
        <Link
          href={product.href}
          className="inline-flex items-center gap-2 rounded-full bg-ink/90 py-2 pl-4 pr-1.5 text-xs font-medium text-white transition-colors hover:bg-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          Buy Now
          <span className="grid size-6 place-items-center rounded-full bg-white text-[#1F253F]">
            <Icon name="arrowUpRight" className="size-3.5" />
          </span>
        </Link>
      </div>
    </article>
  );
}
