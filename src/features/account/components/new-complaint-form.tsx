"use client";

import { useActionState, useState } from "react";

import { createComplaintAction } from "@/features/account/actions";
import { Field, TextArea } from "./fields";
import { FormActions } from "./form-actions";

/** Collapsible "new complaint" form at the foot of the complaints list. */
export function NewComplaintForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    createComplaintAction,
    {},
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cocoa"
      >
        New complaint
      </button>
    );
  }

  return (
    <form
      action={formAction}
      className="flex max-w-lg flex-col gap-4 rounded-xl border border-line bg-white p-5"
    >
      <h3 className="text-sm font-semibold text-[#1F253F]">New complaint</h3>
      {state.message && (
        <p
          role={state.ok ? "status" : "alert"}
          className={`text-sm ${state.ok ? "text-emerald-600" : "text-red-600"}`}
        >
          {state.message}
        </p>
      )}
      <Field
        label="Subject"
        name="subject"
        placeholder="e.g. Where's my order"
        required
        errors={state.fieldErrors?.subject}
      />
      <TextArea
        label="Message"
        name="message"
        placeholder="Describe the issue…"
        required
        errors={state.fieldErrors?.message}
      />
      <FormActions
        pending={pending}
        submitLabel="Submit"
        onCancel={() => setOpen(false)}
      />
    </form>
  );
}
