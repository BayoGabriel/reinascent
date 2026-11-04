import Image from "next/image";
import Link from "next/link";
import type { HeroTestimonial } from "../types";
import { cn } from "@/lib/utils";

interface HeroTestimonialCardProps {
  testimonial: HeroTestimonial;
  className?: string;
}

/** Small quote-byline card with a CTA pill, floating on a hero slide. */
export function HeroTestimonialCard({ testimonial, className }: HeroTestimonialCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl bg-white/15 p-3 backdrop-blur-md",
        className,
      )}
    >
      {testimonial.avatarUrl ? (
        <span className="relative size-9 shrink-0 overflow-hidden rounded-full bg-white/30">
          <Image src={testimonial.avatarUrl} alt="" fill sizes="36px" className="object-cover" />
        </span>
      ) : (
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gold/80 font-serif text-sm font-semibold text-[#1F253F]">
          {testimonial.name.slice(0, 1)}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-bold text-white">
          {testimonial.name}
        </span>
        <span className="block truncate text-[11px] text-white/70">
          {testimonial.role}
        </span>
      </span>
      {testimonial.ctaLabel && (
        <Link
          href={testimonial.href}
          className="shrink-0 rounded-full bg-white px-4 py-2 text-[11px] font-semibold text-[#1F253F] transition-colors hover:bg-gold-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          {testimonial.ctaLabel}
        </Link>
      )}
    </div>
  );
}
