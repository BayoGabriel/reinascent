import type { Announcement } from "./types";

/**
 * Shown when the database isn't reachable or has no active announcements,
 * so the storefront never renders an empty header.
 */
export const fallbackAnnouncements: Announcement[] = [
  {
    id: "seed-delivery",
    text: "Delivery Nationwide",
    href: null,
    variant: "default",
    icon: "truck",
    isActive: true,
    order: 0,
    startsAt: null,
    endsAt: null,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "seed-sale",
    text: "Luxury Sale — up to 20% off select pieces",
    href: "/products",
    variant: "sale",
    icon: "tag",
    isActive: true,
    order: 10,
    startsAt: null,
    endsAt: null,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "seed-arrivals",
    text: "New arrivals in-store & online",
    href: "/products",
    variant: "info",
    icon: "sparkles",
    isActive: true,
    order: 20,
    startsAt: null,
    endsAt: null,
    createdAt: "",
    updatedAt: "",
  },
];
