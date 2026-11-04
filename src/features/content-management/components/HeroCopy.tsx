import type { ResolvedSlide } from "./HeroCarousel";
import { cn } from "@/lib/utils";

interface HeroCopyProps {
  slide: ResolvedSlide;
  center?: boolean;
  className?: string;
}

/** Eyebrow + heading + subheading block shared by every slide variant. */
export function HeroCopy({ slide, center, className }: HeroCopyProps) {
  return (
    <div className={cn(className)}>
      {slide.eyebrow && (
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-soft">
          {slide.eyebrow}
        </p>
      )}
      <h1
        className={cn(
          "text-4xl leading-[1.05] tracking-tight text-white sm:text-5xl xl:text-6xl",
          slide.headingFont === "sans"
            ? "font-sans font-bold"
            : "font-serif font-medium",
        )}
      >
        {slide.heading}
      </h1>
      {slide.subheading && (
        <p
          className={cn(
            "mt-4 text-sm leading-relaxed text-white/80",
            center && "mx-auto max-w-md",
          )}
        >
          {slide.subheading}
        </p>
      )}
    </div>
  );
}
