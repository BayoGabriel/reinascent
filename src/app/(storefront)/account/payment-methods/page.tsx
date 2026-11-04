import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";

import { AccountGreeting } from "@/features/account/components/account-greeting";
import { CardForm } from "@/features/account/components/card-form";
import { CardPreview } from "@/features/account/components/card-preview";
import { listCards } from "@/features/account/cards";
import { requireUser } from "@/server/auth/current-user";

export const metadata: Metadata = {
  title: "Payment Method — Raina Scents",
};

export default function PaymentMethodsPage() {
  return (
    <Suspense fallback={null}>
      <PaymentContent />
    </Suspense>
  );
}

async function PaymentContent() {
  await connection();
  const user = await requireUser();
  const cards = await listCards(user._id.toHexString());
  const defaultCard = cards.find((c) => c.isDefault) ?? cards[0] ?? null;
  return (
    <div className="flex flex-col gap-8">
      <AccountGreeting title="Payment Method" name={user.displayName} />
      <div className="mx-auto w-full max-w-md rounded-2xl bg-cream/70 p-6 sm:p-9">
        <CardPreview card={defaultCard} />
        <h3 className="mt-6 text-sm font-semibold text-[#1F253F]">
          Update payment method
        </h3>
        <p className="mt-1 text-sm text-cocoa/80">Update your card details.</p>
        <CardForm card={defaultCard} />
      </div>
    </div>
  );
}
