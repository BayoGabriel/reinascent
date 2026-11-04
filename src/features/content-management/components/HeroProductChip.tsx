import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import type { HeroProductRef } from "./HeroSection";
import { cn } from "@/lib/utils";

interface HeroProductChipProps {
  product: HeroProductRef;
  blurb: string;
  /** glass = translucent dark over busy slides; solid = white card. */
  variant?: "glass" | "solid";
  className?: string;
  style?: CSSProperties;
}

/** Featured-product card shown on a hero slide — whole card links to the PDP. */
export function HeroProductChip({
  product,
  blurb,
  variant = "glass",
  className,
  style,
}: HeroProductChipProps) {
  const solid = variant === "solid";
  return (
    <div
      style={style}
      className={cn(
        "relative flex w-72 max-w-[calc(100vw-3rem)] items-center gap-3 rounded-2xl p-3",
        solid
          ? "bg-white/95 text-[#1F253F] shadow-lg"
          : "bg-white/15 text-white backdrop-blur-md",
        className,
      )}
    >
      <span
        className={cn(
          "relative size-14 shrink-0 overflow-hidden rounded-xl",
          solid ? "bg-stone-100" : "bg-white/30",
        )}
      >
        <Image
          src={product.imageUrl}
          alt={product.alt}
          fill
          sizes="56px"
          className="object-cover"
        />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block truncate text-xs font-bold uppercase tracking-wide",
            solid ? "text-[#1F253F]" : "text-white",
          )}
        >
          {product.name}
        </span>
        {blurb && (
          <span
            className={cn(
              "mt-0.5 line-clamp-2 block text-[11px] leading-snug",
              solid ? "text-cocoa/80" : "text-white/75",
            )}
          >
            {blurb}
          </span>
        )}
        <span
          className={cn(
            "mt-1 inline-flex items-center gap-1 text-[11px] font-semibold",
            solid ? "text-cocoa" : "text-gold-soft",
          )}
        >
          Check product <Icon name="arrowUpRight" className="size-3" />
        </span>
      </span>
      <Link
        href={product.href}
        aria-label={`View ${product.name}`}
        className="absolute inset-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      />
      <span
        className={cn("relative text-sm font-semibold", solid ? "text-[#1F253F]" : "text-white")}
      >
        ${product.price}
      </span>
    </div>
  );
}
