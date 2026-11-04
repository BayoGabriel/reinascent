import Link from "next/link";
import type { NavLink } from "@/features/settings/types";
import { cn } from "@/lib/utils";

interface NavLinksProps {
  links: NavLink[];
  className?: string;
  linkClassName?: string;
  onNavigate?: () => void;
}

export function NavLinks({ links, className, linkClassName, onNavigate }: NavLinksProps) {
  return (
    <ul className={cn("flex items-center gap-10 font-nav", className)}>
      {links.map((link) => (
        <li key={link.href + link.label}>
          <Link
            href={link.href}
            onClick={onNavigate}
            className={cn(
              "nav-link text-sm font-medium text-black/50 transition-opacity hover:text-black",
              linkClassName,
            )}
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
