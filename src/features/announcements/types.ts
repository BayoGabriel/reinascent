export const ANNOUNCEMENT_VARIANTS = ["default", "sale", "info", "warning"] as const;
export const ANNOUNCEMENT_ICONS = [
  "none",
  "truck",
  "tag",
  "sparkles",
  "megaphone",
  "info",
  "alert",
] as const;

export type AnnouncementVariant = (typeof ANNOUNCEMENT_VARIANTS)[number];
export type AnnouncementIcon = (typeof ANNOUNCEMENT_ICONS)[number];

/** Serialized shape sent to clients — plain JSON only. */
export interface Announcement {
  id: string;
  text: string;
  href: string | null;
  variant: AnnouncementVariant;
  icon: AnnouncementIcon;
  isActive: boolean;
  order: number;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}
