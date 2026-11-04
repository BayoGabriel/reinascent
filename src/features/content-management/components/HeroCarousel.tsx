"use client";

import { useEffect, useState } from "react";
import type { HeroSlide as HeroSlideData } from "../types";
import type { HeroProductRef } from "./HeroSection";
import { HeroSlide } from "./HeroSlide";
import { cn } from "@/lib/utils";

export interface ResolvedChip {
  product: HeroProductRef;
  blurb: string;
  x: number;
  y: number;
}

export type ResolvedSlide = HeroSlideData & {
  product: HeroProductRef | null;
  resolvedChips: ResolvedChip[];
};

const AUTOPLAY_MS = 6500;

/** Full-bleed hero slideshow with crossfade + story-style progress bars. */
export function HeroCarousel({ slides }: { slides: ResolvedSlide[] }) {
  const [active, setActive] = useState(0);
  const count = slides.length;
  useEffect(() => {
    if (count < 2) return;
    const t = setInterval(() => setActive((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [count]);
  return (
    <div className="relative h-[560px] w-full overflow-hidden bg-ink sm:h-[620px] lg:h-[680px]">
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          aria-hidden={i !== active}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-out",
            i === active ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <HeroSlide slide={slide} active={i === active} />
        </div>
      ))}
      {count > 1 && (
        <div className="absolute bottom-7 left-1/2 z-10 flex w-40 -translate-x-1/2 gap-2 sm:left-10 sm:translate-x-0">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="group flex h-4 flex-1 items-center outline-none"
            >
              <span
                className={cn(
                  "h-0.5 flex-1 rounded-full transition-colors",
                  i === active ? "bg-white" : "bg-white/35 group-hover:bg-white/60",
                )}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
