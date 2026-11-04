"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Resets scroll to the top on every route change. Rendered inside a
 *  Suspense boundary since `usePathname` bails out of prerendering. */
export function ScrollToTop() {
  const pathname = usePathname();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
