import type { Product } from "./types";

const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

type SeedProduct = Omit<Product, "id" | "createdAt" | "updatedAt">;

const REVIEW = {
  author: "Taj Ibrahim",
  role: "Client Service Supervisor",
  rating: 5,
  date: "12th August 2025",
  text: "Beautiful craftsmanship and the scent lingers for hours. Packaging was immaculate and delivery was quicker than expected — this has become a fixture in our entryway.",
  avatarUrl: "",
};

const p = (data: SeedProduct): SeedProduct => data;

/** Demo catalog shown when the products collection is empty or unreachable. */
export const fallbackProducts: SeedProduct[] = [
  p({
    slug: "amber-damp-incense",
    name: "Amber Damp Incense",
    tagline: "Hand-rolled sticks in a keepsake brass burner",
    price: 152,
    compareAtPrice: null,
    badge: "New Arrival",
    description:
      "A slow-burning amber blend with notes of labdanum, cedar, and warm resin. Each bundle ships with a hand-finished brass mabkhara, cast and engraved by our workshop partners.",
    sizes: ["500g - 1kg", "2kg - 5kg", "6kg - 10kg", "10kg +"],
    images: [
      { url: img("photo-1616486338812-3dadae4b4ace"), alt: "Amber incense burner" },
      { url: img("photo-1586023492125-27b2c045efd7"), alt: "Burner detail" },
      { url: img("photo-1600210492486-724fe5c67fb0"), alt: "Styled set" },
    ],
    ratingValue: 4.5,
    ratingCount: 128,
    reviews: [REVIEW],
    isActive: true,
    isFeatured: true,
  }),
  p({
    slug: "noir-oil-burner",
    name: "Noir Oil Burner",
    tagline: "Sculptural ceramic burner for essential oils",
    price: 349,
    compareAtPrice: 420,
    badge: "Best Seller",
    description:
      "Matte-black stoneware with a hand-glazed reservoir. The open flame cup casts a soft halo — equal parts ritual object and quiet sculpture.",
    sizes: ["500g - 1kg", "2kg - 5kg"],
    images: [
      { url: img("photo-1586023492125-27b2c045efd7"), alt: "Noir oil burner" },
      { url: img("photo-1616594039964-ae9021a400a0"), alt: "Burner in situ" },
    ],
    ratingValue: 4.8,
    ratingCount: 96,
    reviews: [REVIEW],
    isActive: true,
    isFeatured: true,
  }),
  p({
    slug: "brass-mabkhara",
    name: "Brass Mabkhara",
    tagline: "Ornate engraved brass incense burner",
    price: 725,
    compareAtPrice: null,
    badge: "New Arrival",
    description:
      "A statement mabkhara in polished brass with hand-engraved arabesque panels. The raised charcoal tray keeps heat away from surfaces.",
    sizes: ["500g - 1kg"],
    images: [
      { url: img("photo-1600210492486-724fe5c67fb0"), alt: "Brass mabkhara" },
      { url: img("photo-1616486338812-3dadae4b4ace"), alt: "Engraving detail" },
    ],
    ratingValue: 4.7,
    ratingCount: 54,
    reviews: [REVIEW],
    isActive: true,
    isFeatured: true,
  }),
  p({
    slug: "golden-bakhoor-set",
    name: "Golden Bakhoor Set",
    tagline: "Engraved burner with premium bakhoor chips",
    price: 499,
    compareAtPrice: 599,
    badge: "Sale",
    description:
      "Our signature gifting set: a gilt burner on a walnut base, paired with three tins of aged oud bakhoor and natural charcoal rounds.",
    sizes: ["2kg - 5kg", "6kg - 10kg"],
    images: [
      { url: img("photo-1616594039964-ae9021a400a0"), alt: "Golden bakhoor set" },
      { url: img("photo-1556228453-efd6c1ff04f6"), alt: "Bakhoor chips" },
    ],
    ratingValue: 4.6,
    ratingCount: 77,
    reviews: [REVIEW],
    isActive: true,
    isFeatured: false,
  }),
  p({
    slug: "smoke-sandalwood",
    name: "Smoke & Sandalwood",
    tagline: "Carved stone incense bowl, sandalwood blend",
    price: 265,
    compareAtPrice: null,
    badge: "",
    description:
      "A low, hand-carved stone bowl paired with our calming sandalwood sticks. Weighty, cool to the touch, and endlessly reusable.",
    sizes: ["500g - 1kg", "2kg - 5kg"],
    images: [
      { url: img("photo-1556228453-efd6c1ff04f6"), alt: "Stone incense bowl" },
      { url: img("photo-1618220179428-22790b461013"), alt: "Sandalwood sticks" },
    ],
    ratingValue: 4.4,
    ratingCount: 61,
    reviews: [REVIEW],
    isActive: true,
    isFeatured: false,
  }),
  p({
    slug: "serenity-diffuser",
    name: "Serenity Diffuser",
    tagline: "Reed diffuser and candle pairing",
    price: 180,
    compareAtPrice: null,
    badge: "",
    description:
      "A minimalist pairing for everyday calm — a black-glass reed diffuser and a soy candle poured in small batches, scented with fig and amber.",
    sizes: ["500g - 1kg"],
    images: [
      { url: img("photo-1618220179428-22790b461013"), alt: "Serenity diffuser" },
      { url: img("photo-1513519245088-0e12902e5a38"), alt: "Candle pairing" },
    ],
    ratingValue: 4.3,
    ratingCount: 40,
    reviews: [REVIEW],
    isActive: true,
    isFeatured: false,
  }),
];
