"use client";

import { useActionState, useState } from "react";

import { updateAddressAction } from "@/features/account/actions";
import type { AddressView } from "@/features/account/types";
import { DetailRow } from "@/features/orders/components/DetailRow";
import { Field, TextArea } from "./fields";
import { FormActions } from "./form-actions";

/** Shipping address — read view with an Edit toggle into the form. */
export function AddressEditor({ initial }: { initial: AddressView }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateAddressAction, {});

  if (!editing) {
    return (
      <div>
        <dl>
          <DetailRow label="Name" value={initial.name || "—"} />
          <DetailRow label="Telephone" value={initial.phone || "—"} />
          <DetailRow label="Address" value={initial.address || "—"} />
          <DetailRow label="Email" value={initial.email} />
        </dl>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="mt-5 rounded-full bg-ink px-8 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cocoa"
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      {state.message && (
        <p
          role={state.ok ? "status" : "alert"}
          className={`text-sm ${state.ok ? "text-emerald-600" : "text-red-600"}`}
        >
          {state.message}
        </p>
      )}
      <Field
        label="Name"
        name="name"
        defaultValue={initial.name}
        autoComplete="name"
        required
        errors={state.fieldErrors?.name}
      />
      <Field
        label="Telephone"
        name="phone"
        icon="phone"
        defaultValue={initial.phone}
        autoComplete="tel"
        required
        errors={state.fieldErrors?.phone}
      />
      <TextArea
        label="Address"
        name="address"
        defaultValue={initial.address}
        autoComplete="street-address"
        required
        errors={state.fieldErrors?.address}
      />
      <FormActions pending={pending} onCancel={() => setEditing(false)} />
    </form>
  );
}
