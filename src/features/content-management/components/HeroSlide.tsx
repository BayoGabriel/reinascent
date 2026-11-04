import Image from "next/image";
import Link from "next/link";
import type { ResolvedSlide } from "./HeroCarousel";
import { HeroCopy } from "./HeroCopy";
import { HeroProductChip } from "./HeroProductChip";
import { HeroTagPill } from "./HeroTagPill";
import { HeroTestimonialCard } from "./HeroTestimonialCard";

interface HeroSlideProps {
  slide: ResolvedSlide;
  active: boolean;
}

/** One hero slide — copy placement is driven by the slide's `align` variant. */
export function HeroSlide({ slide, active }: HeroSlideProps) {
  const { product } = slide;
  return (
    <div className="absolute inset-0">
      <Image
        src={slide.imageUrl}
        alt={slide.alt}
        fill
        priority={active}
        sizes="100vw"
        className="object-cover"
      />
      <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30" />
      {slide.tags.map((tag, i) => (
        <HeroTagPill key={`${tag.label}-${i}`} tag={tag} />
      ))}
      {slide.resolvedChips.map((chip) => (
        <HeroProductChip
          key={chip.product.href}
          product={chip.product}
          blurb={chip.blurb}
          variant="solid"
          className="absolute hidden w-64 md:flex"
          style={{ left: `${chip.x}%`, top: `${chip.y}%` }}
        />
      ))}
      <div className="absolute inset-0 mx-auto flex max-w-7xl flex-col px-4 pb-24 pt-14 sm:px-6">
        {slide.align === "split" && (
          <div className="mt-auto grid items-end gap-8 lg:grid-cols-2">
            <HeroCopy slide={slide} className="max-w-xl" />
            {product && (
              <HeroProductChip
                product={product}
                blurb={slide.productBlurb}
                className="lg:justify-self-end"
              />
            )}
          </div>
        )}
        {slide.align === "left" && (
          <>
            <HeroCopy slide={slide} className="max-w-xl" />
            <div className="mt-auto flex max-w-sm flex-col gap-3">
              {product && <HeroProductChip product={product} blurb={slide.productBlurb} />}
              {slide.testimonial && (
                <HeroTestimonialCard testimonial={slide.testimonial} />
              )}
            </div>
          </>
        )}
        {slide.align === "center" && (
          <>
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <HeroCopy slide={slide} center className="max-w-2xl" />
              {slide.cta && (
                <Link
                  href={slide.cta.href}
                  className="mt-7 rounded-full bg-ink px-7 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-cocoa focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {slide.cta.label}
                </Link>
              )}
            </div>
            {product && (
              <HeroProductChip
                product={product}
                blurb={slide.productBlurb}
                className="absolute bottom-20 left-4 sm:left-6"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
