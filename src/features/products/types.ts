export interface ProductImage {
  url: string;
  alt: string;
}

/** Max photos attachable to a review — shared by client UI and storage. */
export const MAX_REVIEW_PHOTOS = 4;

export interface ProductReview {
  author: string;
  role: string;
  rating: number;
  date: string;
  text: string;
  avatarUrl: string;
  /** Present on customer-submitted reviews; absent on seeded/admin content. */
  userId?: string;
  title?: string;
  photoIds?: string[];
}

/** Result envelope returned by review Server Actions to form components. */
export interface ReviewFormState {
  message?: string;
  fieldErrors?: Partial<
    Record<"slug" | "rating" | "title" | "body" | "photos", string[]>
  >;
}

/** Serialized product — plain JSON only (slug is the public identifier). */
export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  price: number;
  compareAtPrice: number | null;
  badge: string;
  description: string;
  sizes: string[];
  images: ProductImage[];
  ratingValue: number;
  ratingCount: number;
  reviews: ProductReview[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}
