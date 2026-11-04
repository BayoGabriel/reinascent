import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/money";
import type { OrderItem } from "../types";

/** Purchased line — image, name, options summary, and line total. */
export function OrderItemRow({ item }: { item: OrderItem }) {
  const options = [`Qty: ${item.qty}`, item.size].filter(Boolean).join(", ");
  return (
    <div className="flex items-center gap-5 rounded-2xl bg-stone-100/70 p-4">
      <Link
        href={`/products/${item.slug}`}
        className="relative block size-24 shrink-0 overflow-hidden rounded-xl bg-stone-200"
      >
        {item.imageUrl && (
          <Image
            src={item.imageUrl}
            alt={item.alt}
            fill
            sizes="96px"
            className="object-cover"
          />
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={`/products/${item.slug}`}
          className="text-sm font-medium text-[#1F253F] hover:text-cocoa"
        >
          {item.name}
        </Link>
        <p className="mt-1.5 text-xs text-cocoa/70">{options}</p>
        <p className="mt-1.5 text-sm font-medium text-[#1F253F]">
          {formatPrice(item.unitPrice)}
        </p>
      </div>
      <Link
        href={`/products/${item.slug}/review`}
        className="shrink-0 rounded-full border border-line px-3.5 py-1.5 text-xs font-medium text-cocoa transition-colors hover:border-ink hover:text-[#1F253F]"
      >
        Rate
      </Link>
    </div>
  );
}
