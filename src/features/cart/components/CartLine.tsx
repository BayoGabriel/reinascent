import Image from "next/image";
import Link from "next/link";
import { removeFromCart, updateCartQty } from "../actions";
import type { CartItem } from "../types";

/** One cart row — qty stepper and remove are server-action forms. */
export function CartLine({ item }: { item: CartItem }) {
  return (
    <div className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-4 py-6 sm:grid-cols-[5rem_1fr_auto_auto_2rem] sm:gap-6">
      <Link
        href={item.href}
        className="relative block size-18 overflow-hidden rounded-2xl bg-stone-100 sm:size-20"
      >
        {item.imageUrl && (
          <Image src={item.imageUrl} alt={item.alt} fill sizes="80px" className="object-cover" />
        )}
      </Link>
      <div className="min-w-0">
        <Link href={item.href} className="block truncate text-sm font-semibold text-[#1F253F] hover:text-cocoa">
          {item.name}
        </Link>
        <p className="mt-0.5 text-xs text-cocoa/60">
          {item.ref}
          {item.size && ` · ${item.size}`}
        </p>
      </div>
      <form
        action={updateCartQty}
        className="col-start-3 flex items-center rounded-full border border-line"
      >
        <input type="hidden" name="slug" value={item.slug} />
        <input type="hidden" name="size" value={item.size} />
        <button
          type="submit"
          name="qty"
          value={item.qty + 1}
          aria-label="Increase quantity"
          className="px-3 py-2 text-sm text-cocoa transition-colors hover:text-[#1F253F]"
        >
          +
        </button>
        <span className="min-w-6 text-center text-sm font-medium text-[#1F253F]">{item.qty}</span>
        <button
          type="submit"
          name="qty"
          value={item.qty - 1}
          aria-label="Decrease quantity"
          className="px-3 py-2 text-sm text-cocoa transition-colors hover:text-[#1F253F]"
        >
          −
        </button>
      </form>
      <p className="col-start-2 text-sm font-medium text-[#1F253F] sm:col-start-auto">
        ${item.lineTotal.toFixed(2)}
      </p>
      <form action={removeFromCart} className="col-start-3 row-start-1 sm:col-start-auto sm:row-start-auto">
        <input type="hidden" name="slug" value={item.slug} />
        <input type="hidden" name="size" value={item.size} />
        <button
          type="submit"
          aria-label={`Remove ${item.name}`}
          className="p-1 text-cocoa/50 transition-colors hover:text-[#1F253F]"
        >
          ×
        </button>
      </form>
    </div>
  );
}
