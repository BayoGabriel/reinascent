import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { toggleWishlistItem } from "../actions";

interface WishlistToggleProps {
  slug: string;
  name: string;
  wishlisted: boolean;
  /** Button chrome — size and colors vary between card and buy-box contexts. */
  className?: string;
  iconClassName?: string;
}

/** Heart toggle — submits a Server Action, so it works without client JS and
 *  for both anonymous guests and signed-in accounts. */
export function WishlistToggle({
  slug,
  name,
  wishlisted,
  className,
  iconClassName = "size-4",
}: WishlistToggleProps) {
  return (
    <form action={toggleWishlistItem}>
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit"
        aria-label={
          wishlisted
            ? `Remove ${name} from wishlist`
            : `Add ${name} to wishlist`
        }
        aria-pressed={wishlisted}
        className={cn(
          "grid place-items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
          className,
        )}
      >
        <Icon
          name="heart"
          className={cn(iconClassName, wishlisted && "fill-current text-red-500")}
        />
      </button>
    </form>
  );
}
