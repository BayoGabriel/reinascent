import { Suspense } from "react";
import { Navbar } from "./Navbar";
import { NavShell } from "./NavShell";
import { ScrollToTop } from "./ScrollToTop";

/** Storefront header — the announcement bar is disabled by design (its
 *  backend — service, API, admin endpoints — remains intact). */
export function SiteHeader() {
  return (
    <header>
      <Suspense fallback={null}>
        <ScrollToTop />
      </Suspense>
      <NavShell>
        <Navbar />
      </NavShell>
    </header>
  );
}
