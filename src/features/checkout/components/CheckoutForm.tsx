"use client";

import { useActionState } from "react";
import { Icon } from "@/components/ui/Icon";
import { FormMessage } from "@/components/feedback/form-message";
import { placeOrder, type CheckoutFormState } from "../actions";

interface CheckoutFormProps {
  totalLabel: string;
  defaultName?: string;
  defaultEmail?: string;
}

const input =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-[#1F253F] outline-none transition-colors placeholder:text-cocoa/40 focus:border-gold";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-cocoa">
        {label}
      </span>
      {children}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}

const INITIAL: CheckoutFormState = { error: null };

/** Shipping/contact form — submits to the placeOrder server action which
 *  redirects to Paystack's hosted checkout. */
export function CheckoutForm({
  totalLabel,
  defaultName,
  defaultEmail,
}: CheckoutFormProps) {
  const [state, action, pending] = useActionState(placeOrder, INITIAL);
  const fe = state.fieldErrors ?? {};
  return (
    <form action={action} className="flex flex-col gap-5">
      <Field label="Full Name" error={fe.name?.[0]}>
        <input name="name" required defaultValue={defaultName} className={input} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email" error={fe.email?.[0]}>
          <input
            name="email"
            type="email"
            required
            defaultValue={defaultEmail}
            className={input}
          />
        </Field>
        <Field label="Telephone" error={fe.phone?.[0]}>
          <input name="phone" type="tel" required className={input} />
        </Field>
      </div>
      <Field label="Delivery Address" error={fe.address?.[0]}>
        <textarea name="address" required rows={3} className={input} />
      </Field>
      <FormMessage message={state.error ?? undefined} />
      <button
        type="submit"
        disabled={pending}
        className="mt-2 flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-4 text-sm font-medium text-white transition-colors hover:bg-cocoa disabled:opacity-60"
      >
        {pending ? "Redirecting to Paystack…" : `Pay ${totalLabel} securely`}
        <Icon name="arrowRight" className="size-4" />
      </button>
      <p className="text-center text-xs text-cocoa/60">
        You will be redirected to Paystack to complete payment.
      </p>
    </form>
  );
}
