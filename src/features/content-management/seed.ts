import type {
  AboutPageContent,
  HeroContent,
  PromoBannerContent,
} from "./types";

/** Fallback About page when no published about.page exists. */
export const aboutPageFallback: AboutPageContent = {
  heading: "About Us",
  subheading:
    "Small-batch incense, carved brass, and scents for slow evenings — hand-poured and packed with care.",
  tiles: [
    {
      title: "Perspective and Insights",
      body: "Notes on ritual, provenance, and the makers behind each piece — straight from the workshop.",
      imageUrl: "/assets/images/hero1.svg",
      alt: "Diffuser and candle on a styled tray",
      tone: "cream",
    },
    {
      title: "Our Mission",
      body: "To turn everyday rooms into sanctuaries with honest materials and small-batch craft.",
      imageUrl: "/assets/images/hero2.svg",
      alt: "Reed diffuser beside a lit candle",
      tone: "sky",
    },
    {
      title: "Our Vision",
      body: "A slower kind of luxury — objects made to be kept, burned, and passed on.",
      imageUrl: "/assets/images/hero3.svg",
      alt: "Ornate incense burner with rising smoke",
      tone: "pink",
    },
  ],
  valuesHeading: "Our Core Values",
  values: [
    {
      title: "Trustworthiness",
      body: "Every blend is traceable — we publish what goes into each pour.",
    },
    {
      title: "Integrity",
      body: "Honest materials, fair sourcing, and prices that reflect the craft.",
    },
    {
      title: "Customer-Centricity",
      body: "Small batches, quick answers, and packaging made to be kept.",
    },
    {
      title: "Resilience",
      body: "A workshop built to last — slow growth, steady quality, no shortcuts.",
    },
  ],
  why: {
    eyebrow: "Why choose us",
    heading: "Crafted for comfort, designed for serenity",
    body: "Every burner and blend is finished by hand — checked for pour, grain, and scent throw before it ships.",
    imageUrl: "/assets/images/hero2.svg",
    alt: "Diffuser and candle glowing in a dim room",
    items: [
      {
        title: "Craftsmanship",
        body: "Hand-finished brass and stoneware, checked piece by piece before it leaves the workshop.",
      },
      {
        title: "Ingredients",
        body: "Clean waxes and resins — no fillers, nothing you can't pronounce.",
      },
      {
        title: "Care",
        body: "Wrapped to survive the journey, with refills for every vessel we sell.",
      },
    ],
  },
};

/** Fallback flash-sale banner when no published home.flash_sale exists. */
export const promoBannerFallback: PromoBannerContent = {
  eyebrow: "Flash Sale",
  lines: [
    "Get your favorite Incense at a discount rate,",
    "Get your favorite",
  ],
  cta: { label: "Proceed to Payment", href: "/products/golden-bakhoor-set" },
  discountText: "40% OFF",
  productSlug: "golden-bakhoor-set",
  imageUrl: "",
  alt: "Golden bakhoor burner",
};

/** Fallback hero slideshow matching the approved design when nothing is stored. */
export const heroFallback: HeroContent = {
  slides: [
    {
      id: "beyond-the-surface",
      eyebrow: "Ozone Kissed Aromatics",
      heading: "BEYOND THE SURFACE",
      subheading: "",
      imageUrl: "/assets/images/hero1.svg",
      alt: "Reed diffusers in dark glass beside an amber candle",
      align: "split",
      headingFont: "sans",
      tags: [
        { label: "Mindful Craft", value: "", x: 30, y: 14 },
        { label: "Detoxifying", value: "", x: 8, y: 38 },
        { label: "All Spaces", value: "", x: 42, y: 38 },
        { label: "Small Batch", value: "", x: 74, y: 30 },
        { label: "Ozone Infused", value: "", x: 55, y: 55 },
      ],
      chips: [],
      featuredProductSlug: "serenity-diffuser",
      productBlurb:
        "A minimalist pairing for everyday calm — black-glass reeds and a hand-poured candle.",
      testimonial: null,
      cta: null,
    },
    {
      id: "intense-scent",
      eyebrow: "",
      heading: "Intense Scent That Moves With You",
      subheading:
        "Feel the warmth in every room — premium incense and burners crafted for slow evenings.",
      imageUrl: "/assets/images/hero2.svg",
      alt: "Black reed diffuser against a deep red wall",
      align: "left",
      headingFont: "serif",
      tags: [
        { label: "Longer Burn", value: "30%", x: 62, y: 48 },
        { label: "Deeper Calm", value: "20%", x: 78, y: 60 },
        { label: "Richer Notes", value: "25%", x: 60, y: 74 },
        { label: "Cleaner Air", value: "15%", x: 42, y: 82 },
      ],
      chips: [],
      featuredProductSlug: "amber-damp-incense",
      productBlurb: "Hand-rolled amber sticks with a keepsake brass burner.",
      testimonial: {
        name: "Farah Khater",
        role: "Client Service Supervisor",
        avatarUrl: "",
        ctaLabel: "Add to cart",
        href: "/products/amber-damp-incense",
      },
      cta: null,
    },
    {
      id: "fresh-scents",
      eyebrow: "",
      heading: "Fresh Scents for Every Occasion",
      subheading:
        "Choose from a wide variety of blends — tailored to your taste and delivered within hours.",
      imageUrl: "/assets/images/hero2.svg",
      alt: "Diffuser trio arranged on a bright console",
      align: "center",
      headingFont: "sans",
      tags: [
        { label: "", value: "", x: 24, y: 28 },
        { label: "", value: "", x: 70, y: 12 },
        { label: "", value: "", x: 86, y: 62 },
        { label: "", value: "", x: 38, y: 70 },
      ],
      chips: [
        {
          productSlug: "serenity-diffuser",
          blurb: "Reed diffuser and candle pairing for everyday calm.",
          x: 8,
          y: 12,
        },
        {
          productSlug: "brass-mabkhara",
          blurb: "Ornate engraved brass incense burner.",
          x: 64,
          y: 8,
        },
        {
          productSlug: "golden-bakhoor-set",
          blurb: "Gilt burner on walnut, paired with aged oud bakhoor.",
          x: 38,
          y: 68,
        },
      ],
      featuredProductSlug: "",
      productBlurb: "",
      testimonial: null,
      cta: { label: "Shop Now", href: "/products" },
    },
  ],
};
