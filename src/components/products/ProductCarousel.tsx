"use client";

import { useRef } from "react";
import { ProductCard, type ProductCardData } from "./ProductCard";

interface ProductCarouselProps {
  title: string;
  products: ProductCardData[];
}

/** Horizontal product carousel with prev/next scroll buttons. */
export function ProductCarousel({ title, products }: ProductCarouselProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const id = `carousel-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const scroll = (dir: 1 | -1) =>
    scroller.current?.scrollBy({
      left: dir * scroller.current.clientWidth * 0.75,
      behavior: "smooth",
    });
  const btn =
    "grid size-9 place-items-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold";
  const chevron =
    "size-4 fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]";
  return (
    <section
      aria-labelledby={id}
      className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6"
    >
      <div className="mb-8 flex items-end justify-between gap-4">
        <h2
          id={id}
          className="text-3xl font-semibold tracking-tight text-[#1F253F] sm:text-4xl"
        >
          {title}
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Scroll to previous products"
            className={`${btn} bg-ink/85 text-white hover:bg-ink`}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className={chevron}>
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Scroll to next products"
            className={`${btn} border border-line bg-white text-[#1F253F] hover:border-ink/40`}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className={chevron}>
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
      <div
        ref={scroller}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((p) => (
          <div
            key={p.href}
            className="w-[300px] shrink-0 snap-start sm:w-[380px]"
          >
            <ProductCard product={p} sizes="(min-width: 640px) 380px, 300px" />
          </div>
        ))}
      </div>
    </section>
  );
}
