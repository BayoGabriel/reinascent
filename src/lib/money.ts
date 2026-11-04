/**
 * Money helpers. Catalog prices are stored in major units (e.g. 152 → $152).
 * Payment providers charge in minor units (kobo/cents), so conversion is
 * centralized here — never multiply floats inline at call sites.
 */

/** Major units → integer minor units, rounded to the nearest minor unit. */
export function toMinorUnits(amount: number): number {
  return Math.round(amount * 100);
}

/** Minor units → major units. */
export function fromMinorUnits(amount: number): number {
  return amount / 100;
}

/** Storefront price display: `$1,234.50` — matches existing components. */
export function formatPrice(amount: number): string {
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Line total in exact minor units to avoid float drift on qty math. */
export function lineTotalMinor(unitPrice: number, qty: number): number {
  return toMinorUnits(unitPrice) * qty;
}
