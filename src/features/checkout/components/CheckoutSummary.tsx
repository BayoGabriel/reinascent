import Image from "next/image";
import type { Cart } from "@/features/cart/types";
import { formatPrice } from "@/lib/money";

interface CheckoutSummaryProps {
  cart: Cart;
  shippingFee: number;
}

/** Read-only order recap — authoritative totals are recomputed server-side
 *  in the placeOrder action; this is display only. */
export function CheckoutSummary({ cart, shippingFee }: CheckoutSummaryProps) {
  return (
    <aside className="rounded-3xl border border-line bg-white/60 p-6 sm:p-8">
      <h2 className="font-serif text-xl font-medium text-[#1F253F]">Order Summary</h2>
      <ul className="mt-5 flex flex-col gap-4">
        {cart.items.map((item) => (
          <li key={`${item.slug}:${item.size}`} className="flex items-center gap-4">
            <span className="relative block size-14 shrink-0 overflow-hidden rounded-2xl bg-stone-100">
              {item.imageUrl && (
                <Image
                  src={item.imageUrl}
                  alt={item.alt}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-[#1F253F]">
                {item.name}
              </span>
              <span className="text-xs text-cocoa/60">
                Qty {item.qty}
                {item.size && ` · ${item.size}`}
              </span>
            </span>
            <span className="text-sm font-medium text-[#1F253F]">
              {formatPrice(item.lineTotal)}
            </span>
          </li>
        ))}
      </ul>
      <dl className="mt-6 space-y-2.5 border-t border-line pt-5 text-sm">
        <div className="flex justify-between text-cocoa">
          <dt>Subtotal</dt>
          <dd>{formatPrice(cart.subtotal)}</dd>
        </div>
        <div className="flex justify-between text-cocoa">
          <dt>Shipping (Standard)</dt>
          <dd>{shippingFee > 0 ? formatPrice(shippingFee) : "Free"}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-3 text-base font-semibold text-[#1F253F]">
          <dt>Total</dt>
          <dd>{formatPrice(cart.subtotal + shippingFee)}</dd>
        </div>
      </dl>
    </aside>
  );
}
