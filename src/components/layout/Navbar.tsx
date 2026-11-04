import Link from "next/link";
import { getSiteSettings } from "@/features/settings/service";
import { BrandLogo } from "./BrandLogo";
import { MobileNav } from "./MobileNav";
import { NavActions } from "./NavActions";
import { NavLinks } from "./NavLinks";

/**
 * Storefront navbar — nav links, brand, and the CTA pill come from
 * site_settings so the admin can reorder/rename them without a deploy.
 */
export async function Navbar() {
  const settings = await getSiteSettings();
  return (
    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
      <div className="flex items-center gap-8 lg:gap-12">
        <MobileNav links={settings.navLinks} />
        <BrandLogo brand={settings.brand} />
        <NavLinks links={settings.navLinks} className="hidden gap-8 md:flex" />
      </div>
      <div className="flex items-center gap-4 sm:gap-6">
        <NavActions />
        {settings.cta?.label && (
          <Link
            href={settings.cta.href}
            className="nav-cta hidden rounded-full bg-black px-6 py-2 text-sm font-medium text-white transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 sm:inline-flex"
          >
            {settings.cta.label}
          </Link>
        )}
      </div>
    </div>
  );
}
