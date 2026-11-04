/** A stored wishlist entry — only the slug persists; display fields are
 *  hydrated from the products collection at read time so names, prices,
 *  and images always reflect the live catalog. */
export interface WishlistItem {
  slug: string;
  name: string;
  price: number;
  imageUrl: string;
  alt: string;
  href: string;
}

export interface Wishlist {
  items: WishlistItem[];
  count: number;
}
