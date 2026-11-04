import { cn } from "@/lib/utils";

/** Brand glyph for saved cards — Mastercard's circles, text for the rest. */
export function CardBrand({
  brand,
  className,
}: {
  brand: string;
  className?: string;
}) {
  if (brand.toLowerCase() === "mastercard") {
    return (
      <span className={cn("inline-flex", className)} aria-label="Mastercard">
        <span className="size-4 rounded-full bg-red-500" />
        <span className="-ml-1.5 size-4 rounded-full bg-amber-400 opacity-90" />
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border border-line bg-white px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#1F253F]",
        className,
      )}
    >
      {brand}
    </span>
  );
}
