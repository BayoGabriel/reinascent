import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";

import { AccountGreeting } from "@/features/account/components/account-greeting";
import { EmptyState } from "@/features/account/components/empty-state";
import { SavedCardList } from "@/features/account/components/saved-card-list";
import { listCards } from "@/features/account/cards";
import { requireUser } from "@/server/auth/current-user";

export const metadata: Metadata = { title: "Saved Cards — Raina Scents" };

export default function SavedCardsPage() {
  return (
    <Suspense fallback={null}>
      <SavedCardsContent />
    </Suspense>
  );
}

async function SavedCardsContent() {
  await connection();
  const user = await requireUser();
  const cards = await listCards(user._id.toHexString());
  return (
    <div className="flex flex-col gap-8">
      <AccountGreeting title="Saved Cards" name={user.displayName} />
      {cards.length ? (
        <SavedCardList cards={cards} />
      ) : (
        <EmptyState
          title="No saved cards"
          body="Add a card from Payment Methods and it will appear here."
          cta={{ href: "/account/payment-methods", label: "Add a card" }}
        />
      )}
    </div>
  );
}
