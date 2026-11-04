export const SECTION_TYPES = [
  "hero",
  "promo_banner",
  "featured_products",
  "category_grid",
  "rich_text",
  "faq",
  "about_page",
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];
export type SectionStatus = "draft" | "published";

export type HeroAlign = "split" | "left" | "center";
export type HeroFont = "serif" | "sans";

/** Floating pill pinned to a slide — x/y are percentages of the slide box. */
export interface HeroTag {
  label: string;
  value: string;
  x: number;
  y: number;
}

/** Extra featured-product card pinned anywhere on a slide. */
export interface HeroChip {
  productSlug: string;
  blurb: string;
  x: number;
  y: number;
}

export interface HeroCta {
  label: string;
  href: string;
}

export interface HeroTestimonial {
  name: string;
  role: string;
  avatarUrl: string;
  ctaLabel: string;
  href: string;
}

export interface HeroSlide {
  id: string;
  eyebrow: string;
  heading: string;
  subheading: string;
  imageUrl: string;
  alt: string;
  align: HeroAlign;
  headingFont: HeroFont;
  tags: HeroTag[];
  chips: HeroChip[];
  /** Product shown in the floating glass card — resolved server-side by slug. */
  featuredProductSlug: string;
  productBlurb: string;
  testimonial: HeroTestimonial | null;
  cta: HeroCta | null;
}

export interface HeroContent {
  slides: HeroSlide[];
}

/** Flash-sale promo banner — sale product resolved server-side by slug. */
export interface PromoBannerContent {
  eyebrow: string;
  lines: string[];
  cta: HeroCta;
  discountText: string;
  productSlug: string;
  imageUrl: string;
  alt: string;
}

export type AboutTileTone = "cream" | "sky" | "pink";

/** One mosaic row — an image paired with a tinted text card. */
export interface AboutTile {
  title: string;
  body: string;
  imageUrl: string;
  alt: string;
  tone: AboutTileTone;
}

export interface AboutItem {
  title: string;
  body: string;
}

export interface AboutPageContent {
  heading: string;
  subheading: string;
  tiles: AboutTile[];
  valuesHeading: string;
  values: AboutItem[];
  why: {
    eyebrow: string;
    heading: string;
    body: string;
    imageUrl: string;
    alt: string;
    items: AboutItem[];
  };
}

/** Serialized content section — plain JSON only. */
export interface ContentSection<T = unknown> {
  key: string;
  type: SectionType;
  status: SectionStatus;
  data: T;
  version: number;
  updatedAt: string;
}
