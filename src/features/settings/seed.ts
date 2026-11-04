import type { SiteSettings } from "./types";

/** Defaults matching the approved header design. */
export const settingsFallback: SiteSettings = {
  brand: { name: "Raina Scents", tagline: "", logoUrl: "" },
  navLinks: [
    { label: "Shop", href: "/products" },
    { label: "Best sellers", href: "/top-sellers" },
    { label: "Bundle & SAVE", href: "/products" },
    { label: "Sale", href: "/flash-sale" },
    { label: "Wholesale", href: "/about" },
  ],
  cta: { label: "Shop Now", href: "/products" },
  footer: {
    tagline:
      "Hand-poured incense and carved brass burners — crafted to turn a house into a sanctuary.",
    columns: [
      {
        title: "Product",
        links: [
          { label: "Flash Sales", href: "/flash-sale", badge: "" },
          { label: "Shop", href: "/products", badge: "" },
          { label: "Arrivals", href: "/products", badge: "New" },
          { label: "Top Seller", href: "/top-sellers", badge: "" },
        ],
      },
      {
        title: "Company",
        links: [
          { label: "About us", href: "/about", badge: "" },
          { label: "Contact", href: "/about", badge: "" },
        ],
      },
      {
        title: "Social",
        links: [
          { label: "Twitter", href: "https://x.com", badge: "" },
          { label: "LinkedIn", href: "https://linkedin.com", badge: "" },
          { label: "Facebook", href: "https://facebook.com", badge: "" },
          { label: "Instagram", href: "https://instagram.com", badge: "" },
        ],
      },
      {
        title: "Legal",
        links: [
          { label: "Terms", href: "/about", badge: "" },
          { label: "Privacy", href: "/about", badge: "" },
          { label: "Cookies", href: "/about", badge: "" },
          { label: "Licenses", href: "/about", badge: "" },
        ],
      },
    ],
    social: [
      { network: "twitter", href: "https://x.com" },
      { network: "linkedin", href: "https://linkedin.com" },
      { network: "facebook", href: "https://facebook.com" },
      { network: "instagram", href: "https://instagram.com" },
      { network: "dribbble", href: "https://dribbble.com" },
    ],
  },
};
