"use client";

import { useActionState } from "react";

import { saveCardAction } from "@/features/account/actions";
import type { SavedCard } from "../types";
import { Field } from "./fields";

const box =
  "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-center text-sm text-[#1F253F] outline-none transition-colors placeholder:text-cocoa/50 focus:border-gold";

/** Update-payment-method form; PAN/CVV validate server-side, never persist. */
export function CardForm({ card }: { card: SavedCard | null }) {
  const [state, formAction, pending] = useActionState(saveCardAction, {});
  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4">
      {state.message && (
        <p
          role={state.ok ? "status" : "alert"}
          className={`text-sm ${state.ok ? "text-emerald-600" : "text-red-600"}`}
        >
          {state.message}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Name on card"
          name="nameOnCard"
          defaultValue={card?.nameOnCard ?? ""}
          autoComplete="cc-name"
          required
          errors={state.fieldErrors?.nameOnCard}
        />
        <fieldset>
          <legend className="text-sm font-medium text-[#1F253F]">Expiry</legend>
          <div className="mt-1.5 grid grid-cols-2 gap-3">
            <input
              name="expMonth"
              inputMode="numeric"
              maxLength={2}
              placeholder="MM"
              aria-label="Expiry month"
              defaultValue={card ? String(card.expMonth).padStart(2, "0") : ""}
              required
              className={box}
            />
            <input
              name="expYear"
              inputMode="numeric"
              maxLength={4}
              placeholder="YYYY"
              aria-label="Expiry year"
              defaultValue={card?.expYear ?? ""}
              required
              className={box}
            />
          </div>
          {state.fieldErrors?.expMonth || state.fieldErrors?.expYear ? (
            <p className="mt-1.5 text-sm text-red-600">
              {state.fieldErrors.expMonth?.[0] ?? state.fieldErrors.expYear?.[0]}
            </p>
          ) : null}
        </fieldset>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Card number"
          name="cardNumber"
          icon="creditCard"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="1234 1234 1234 1234"
          required
          errors={state.fieldErrors?.cardNumber}
        />
        <Field
          label="CVV"
          name="cvv"
          type="password"
          inputMode="numeric"
          maxLength={4}
          autoComplete="cc-csc"
          placeholder="•••"
          required
          errors={state.fieldErrors?.cvv}
        />
      </div>
      <div className="flex justify-center pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-ink px-10 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cocoa disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save card"}
        </button>
      </div>
    </form>
  );
}
