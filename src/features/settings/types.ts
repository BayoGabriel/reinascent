export interface NavLink {
  label: string;
  href: string;
}

export interface BrandInfo {
  name: string;
  tagline: string;
  logoUrl: string;
}

export interface FooterLink extends NavLink {
  badge: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export type SocialNetwork =
  | "twitter"
  | "linkedin"
  | "facebook"
  | "instagram"
  | "github"
  | "dribbble";

export interface SocialLink {
  network: SocialNetwork;
  href: string;
}

export interface FooterContent {
  tagline: string;
  columns: FooterColumn[];
  social: SocialLink[];
}

/** Serialized site settings — plain JSON only. */
export interface SiteSettings {
  brand: BrandInfo;
  navLinks: NavLink[];
  cta: NavLink;
  footer: FooterContent;
}
