"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductImage } from "../types";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: ProductImage[];
}

/** PDP gallery — story-style progress bars on top, thumbnail rail below. */
export function ProductGallery({ images }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const current = images[Math.min(active, images.length - 1)];
  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-stone-100 sm:aspect-square">
        {images.length > 1 && (
          <div className="absolute inset-x-4 top-4 z-10 flex gap-1.5">
            {images.map((img, i) => (
              <span
                key={img.url}
                className={cn(
                  "h-0.5 flex-1 rounded-full transition-colors",
                  i === active ? "bg-white" : "bg-white/40",
                )}
              />
            ))}
          </div>
        )}
        <Image
          src={current.url}
          alt={current.alt}
          fill
          priority
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((img, i) => (
            <button
              key={img.url + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={cn(
                "relative aspect-square w-20 overflow-hidden rounded-xl outline-none transition-shadow sm:w-24",
                i === active
                  ? "ring-2 ring-gold"
                  : "opacity-70 hover:opacity-100 focus-visible:ring-2 focus-visible:ring-gold",
              )}
            >
              <Image src={img.url} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
