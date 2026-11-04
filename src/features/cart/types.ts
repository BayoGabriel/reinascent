/** A stored cart line — only identifiers + quantity persist; display
 *  fields are hydrated from the products collection at read time so
 *  names/prices/images always reflect the live catalog. */
export interface StoredCartItem {
  slug: string;
  size: string;
  qty: number;
}

export interface CartItem {
  slug: string;
  size: string;
  qty: number;
  name: string;
  ref: string;
  price: number;
  imageUrl: string;
  alt: string;
  href: string;
  lineTotal: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  count: number;
}
