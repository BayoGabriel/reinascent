import Link from "next/link";
import type { BrandInfo } from "@/features/settings/types";
import { Logo } from "./Logo";

export function BrandLogo({ brand }: { brand: BrandInfo }) {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label={`${brand.name} home`}>
      {brand.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- admin-provided URL
        <img src={brand.logoUrl} alt={brand.name} className="h-9 w-auto object-contain" />
      ) : (
        <Logo className="nav-fg h-6 w-auto text-black" />
      )}
      {brand.tagline && (
        <span className="nav-fg hidden text-[9px] uppercase tracking-[0.4em] text-gold sm:block">
          {brand.tagline}
        </span>
      )}
    </Link>
  );
}
