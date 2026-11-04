"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { addToCart } from "@/features/cart/actions";
import { WishlistToggle } from "@/features/wishlist/components/WishlistToggle";
import { cn } from "@/lib/utils";

interface BuyBoxProps {
  slug: string;
  name: string;
  wishlisted: boolean;
  price: number;
  compareAtPrice: number | null;
  badge: string;
  description: string;
  sizes: string[];
}

/** Price, description, size picker, and the purchase affordances. */
export function BuyBox({ slug, name, wishlisted, price, compareAtPrice, badge, description, sizes }: BuyBoxProps) {
  const [size, setSize] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <div className="flex flex-col gap-5">
      {badge && (
        <span className="w-fit rounded-full border border-line bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-cocoa">
          {badge}
        </span>
      )}
      <h1 className="font-serif text-4xl font-medium tracking-tight text-[#1F253F] sm:text-5xl">
        {name}
      </h1>
      <p className="flex items-baseline gap-3">
        <span className="text-2xl font-semibold text-[#1F253F]">${price.toLocaleString()}</span>
        {compareAtPrice != null && compareAtPrice > price && (
          <span className="text-sm text-cocoa/60 line-through">
            ${compareAtPrice.toLocaleString()}
          </span>
        )}
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await addToCart({ slug, size: size ?? sizes[0] ?? "", qty: 1 });
              router.push("/cart");
            })
          }
          className="flex-1 rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-cocoa focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:opacity-60"
        >
          <span className="inline-flex items-center gap-2">
            {pending ? "Adding…" : "Buy Now"} <Icon name="arrowUpRight" className="size-4" />
          </span>
        </button>
        <WishlistToggle
          slug={slug}
          name={name}
          wishlisted={wishlisted}
          className="size-12 shrink-0 border border-line text-cocoa hover:border-gold hover:text-gold"
          iconClassName="size-5"
        />
      </div>
      {description && (
        <p className="text-sm leading-relaxed text-[#1F253F]/60">{description}</p>
      )}
      {sizes.length > 0 && (
        <fieldset>
          <legend className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-cocoa">
            Select Preferred Size
          </legend>
          <div className="flex flex-wrap gap-2.5">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s === size ? null : s)}
                aria-pressed={s === size}
                className={cn(
                  "rounded-full border px-4 py-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                  s === size
                    ? "border-ink bg-ink text-white"
                    : "border-line text-cocoa hover:border-ink",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </fieldset>
      )}
    </div>
  );
}
