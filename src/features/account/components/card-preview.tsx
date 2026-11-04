import type { SavedCard } from "../types";
import { CardBrand } from "./card-brand";

/** Stylized card visual — displays saved metadata only, never a real PAN. */
export function CardPreview({ card }: { card: SavedCard | null }) {
  const name = card?.nameOnCard.toUpperCase() ?? "YOUR NAME";
  const number = card ? `•••• •••• •••• ${card.last4}` : "•••• •••• •••• ••••";
  const expiry = card
    ? `${String(card.expMonth).padStart(2, "0")}/${String(card.expYear).slice(-2)}`
    : "MM/YY";
  return (
    <div
      aria-hidden="true"
      className="rounded-2xl bg-gradient-to-br from-sky-200 via-fuchsia-300 to-orange-200 p-5"
    >
      <div className="flex aspect-[8/5] flex-col justify-between rounded-xl border border-white/40 bg-white/20 p-4 backdrop-blur-sm">
        <div className="flex items-start justify-between">
          <span className="text-xs font-semibold tracking-wide text-[#1F253F]/80">
            Raina Scents.
          </span>
          <svg viewBox="0 0 24 24" className="size-5 text-[#1F253F]/60" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
            <path d="M8.5 8.5a5 5 0 0 1 0 7M12 6a8 8 0 0 1 0 12M15.5 3.5a11 11 0 0 1 0 17" />
          </svg>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="flex gap-6 text-[10px] uppercase tracking-wider text-[#1F253F]/70">
              <span>{name}</span>
              <span>{expiry}</span>
            </p>
            <p className="mt-1 font-mono text-sm tracking-[0.18em] text-[#1F253F]">
              {number}
            </p>
          </div>
          <CardBrand brand={card?.brand ?? "mastercard"} />
        </div>
      </div>
    </div>
  );
}
