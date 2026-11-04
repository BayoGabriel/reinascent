import { getProductsBySlugs } from "@/features/products/service";
import { getHeroContent } from "../service";
import { HeroCarousel } from "./HeroCarousel";

export interface HeroProductRef {
  name: string;
  price: number;
  imageUrl: string;
  alt: string;
  href: string;
}

/** Homepage hero slideshow — slides come from content_sections, the featured
 *  item shown on each slide is resolved from the products collection. */
function toRef(p: {
  name: string;
  price: number;
  slug: string;
  images: { url: string; alt: string }[];
}): HeroProductRef {
  return {
    name: p.name,
    price: p.price,
    imageUrl: p.images[0]?.url ?? "",
    alt: p.images[0]?.alt ?? p.name,
    href: `/products/${p.slug}`,
  };
}

export async function HeroSection() {
  const { slides } = await getHeroContent();
  const slugs = [
    ...new Set(
      slides.flatMap((s) => [
        ...(s.featuredProductSlug ? [s.featuredProductSlug] : []),
        ...s.chips.map((c) => c.productSlug),
      ]),
    ),
  ];
  const products = await getProductsBySlugs(slugs);
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const resolved = slides.map((slide) => {
    const featured = slide.featuredProductSlug
      ? bySlug.get(slide.featuredProductSlug)
      : null;
    return {
      ...slide,
      product: featured ? toRef(featured) : null,
      resolvedChips: slide.chips.flatMap((chip) => {
        const p = bySlug.get(chip.productSlug);
        return p ? [{ ...chip, product: toRef(p) }] : [];
      }),
    };
  });
  return (
    <section aria-label="Featured" className="relative font-instrument">
      <HeroCarousel slides={resolved} />
    </section>
  );
}
