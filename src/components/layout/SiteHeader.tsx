import { Navbar } from "./Navbar";
import { NavShell } from "./NavShell";

/** Storefront header — the announcement bar is disabled by design (its
 *  backend — service, API, admin endpoints — remains intact). */
export function SiteHeader() {
  return (
    <header>
      <NavShell>
        <Navbar />
      </NavShell>
    </header>
  );
}
