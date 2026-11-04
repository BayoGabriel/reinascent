import Image from "next/image";

import type { Product } from "../types";

interface ReviewProductCardProps {
  product: Product;
  /** Purchased line item — shows "Qty: n, variant" when available. */
  orderItem: { qty: number; variant: string } | null;
}

/** Purchased-product summary shown at the top of the review page. */
export function ReviewProductCard({
  product,
  orderItem,
}: ReviewProductCardProps) {
  const image = product.images[0];
  return (
    <div className="mt-8 flex items-center gap-6">
      <span className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-stone-200 sm:size-28">
        {image && (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes="112px"
            className="object-cover"
          />
        )}
      </span>
      <span className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-[#1F253F]">{product.name}</span>
        {orderItem && (
          <span className="text-[#1F253F]/60">
            Qty: {orderItem.qty}
            {orderItem.variant ? `, ${orderItem.variant}` : ""}
          </span>
        )}
        <span className="font-semibold text-[#1F253F]">
          ${product.price.toLocaleString()}
        </span>
      </span>
    </div>
  );
}
