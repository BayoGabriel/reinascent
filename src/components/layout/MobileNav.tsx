"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { NavLink } from "@/features/settings/types";
import { Icon } from "@/components/ui/Icon";
import { SearchInput } from "@/components/ui/SearchInput";

export function MobileNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="nav-fg rounded p-1 text-black transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
      >
        <Icon name={open ? "close" : "menu"} className="size-6" />
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full z-40 border-b border-line bg-cream shadow-xl">
          <nav aria-label="Mobile" className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-5">
            {links.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-line/60 py-3 font-nav text-xl text-black/50 transition-colors last:border-0 hover:text-black"
              >
                {link.label}
              </Link>
            ))}
            <SearchInput className="mt-3" />
          </nav>
        </div>
      )}
    </div>
  );
}
