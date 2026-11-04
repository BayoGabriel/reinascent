import Link from "next/link";
import { getSiteSettings } from "@/features/settings/service";
import { Logo } from "./Logo";
import { SocialIcon } from "./SocialIcon";

/** Storefront footer — tagline, link columns, and socials from site_settings. */
export async function SiteFooter() {
  "use cache";
  const settings = await getSiteSettings();
  const { brand, footer } = settings;
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line bg-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-6">
        <div className="sm:col-span-2">
          <Logo className="h-6 w-auto text-[#1F253F]" />
          <span className="sr-only">{brand.name}</span>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#1F253F]/60">
            {footer.tagline}
          </p>
        </div>
        {footer.columns.map((col) => (
          <nav
            key={col.title}
            aria-label={col.title}
            className="flex flex-col gap-4"
          >
            <h3 className="text-sm font-medium text-[#1F253F]/50">{col.title}</h3>
            {col.links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="w-fit text-sm font-semibold text-[#1F253F]/70 transition-colors hover:text-[#1F253F]"
              >
                {link.label}
                {link.badge && (
                  <span className="ml-2 text-xs font-medium text-emerald-600">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 text-sm text-[#1F253F]/50 sm:flex-row">
          <p>
            © {year} {brand.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {footer.social.map((link) => (
              <a
                key={link.network}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                aria-label={link.network}
                className="text-[#1F253F]/40 transition-colors hover:text-[#1F253F]"
              >
                <SocialIcon network={link.network} className="size-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
