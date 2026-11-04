"use client";

import { useTransition } from "react";

import { setDefaultCardAction } from "@/features/account/actions";
import type { SavedCard } from "../types";
import { CardBrand } from "./card-brand";

/** Saved cards — checking a row makes it the default payment method. */
export function SavedCardList({ cards }: { cards: SavedCard[] }) {
  const [pending, startTransition] = useTransition();
  return (
    <ul className="divide-y divide-line">
      {cards.map((card) => (
        <li key={card.id} className="flex items-center gap-4 py-5">
          <input
            type="checkbox"
            checked={card.isDefault}
            disabled={pending || card.isDefault}
            onChange={() =>
              startTransition(() => setDefaultCardAction(card.id))
            }
            aria-label={`Set ${card.brand} ending ${card.last4} as default`}
            className="size-4.5 shrink-0 accent-gold"
          />
          <CardBrand brand={card.brand} />
          <span className="ml-auto text-right">
            <span className="block font-mono text-sm tracking-[0.15em] text-[#1F253F]">
              •••• •••• •••• {card.last4}
            </span>
            <span className="block text-xs text-cocoa/70">
              {card.brand}
              {card.isDefault ? " · Default" : ""}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
