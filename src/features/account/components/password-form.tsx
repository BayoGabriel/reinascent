"use client";

import { useActionState } from "react";

import { changePasswordAction } from "@/features/account/actions";
import { Field } from "./fields";
import { FormActions } from "./form-actions";

/** Password rotation — re-verifies the current password server-side. */
export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, {});
  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.message && (
        <p
          role={state.ok ? "status" : "alert"}
          className={`text-sm ${state.ok ? "text-emerald-600" : "text-red-600"}`}
        >
          {state.message}
        </p>
      )}
      <Field
        label="Current Password*"
        name="currentPassword"
        type="password"
        autoComplete="current-password"
        placeholder="Enter your current password"
        required
        errors={state.fieldErrors?.currentPassword}
      />
      <Field
        label="New Password*"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        placeholder="Create a password"
        required
        errors={state.fieldErrors?.newPassword}
      />
      <Field
        label="Confirm Password*"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        placeholder="Confirm your password"
        hint="Must be at least 12 characters."
        required
        errors={state.fieldErrors?.confirmPassword}
      />
      <FormActions pending={pending} />
    </form>
  );
}
