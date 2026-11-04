"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Fixed navbar shell — transparent over the page top on every route
 *  (`.nav-overlay` lightens its contents) and solid white once the user
 *  scrolls. Route changes scroll to the top via Next's default restoration,
 *  which also fires the scroll listener and resets this bar. */
export function NavShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      aria-label="Main"
      className={cn(
        "fixed inset-x-0 top-0 z-50 font-nav transition-colors duration-300",
        scrolled ? "border-b border-line bg-white" : "nav-overlay",
      )}
    >
      {children}
    </nav>
  );
}
