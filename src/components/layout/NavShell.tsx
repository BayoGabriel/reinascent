"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Fixed navbar shell — transparent over the page top on every route
 *  (`.nav-overlay` lightens its contents) and solid white once the user
 *  scrolls. Also resets the scroll position to the top on navigation. */
export function NavShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    setScrolled(false);
  }, [pathname]);

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
