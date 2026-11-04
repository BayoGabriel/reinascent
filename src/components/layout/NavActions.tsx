import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

interface NavActionsProps {
  cartCount?: number;
}

const iconLink =
  "nav-fg text-black transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 rounded";

export function NavActions({ cartCount = 0 }: NavActionsProps) {
  return (
    <div className="flex items-center justify-end gap-6 sm:gap-8">
      <Link href="/wishlist" aria-label="Wishlist" className={iconLink}>
        <Icon name="heartSolid" filled className="size-6" />
      </Link>
      <Link href="/cart" aria-label="Cart" className={`relative ${iconLink}`}>
        <Icon name="bagSolid" filled className="size-6" />
        {cartCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-black text-[9px] font-semibold text-white">
            {cartCount > 9 ? "9+" : cartCount}
          </span>
        )}
      </Link>
      <Link href="/account" aria-label="Account" className={iconLink}>
        <Icon name="userSolid" filled className="size-6" />
      </Link>
    </div>
  );
}
