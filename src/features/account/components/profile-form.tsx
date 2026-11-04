"use client";

import { useActionState } from "react";

import { updateProfileAction } from "@/features/account/actions";
import { Field } from "./fields";
import { FormActions } from "./form-actions";

interface ProfileFormProps {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

/** Personal info form — name, email, phone. */
export function ProfileForm({ firstName, lastName, email, phone }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(updateProfileAction, {});
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
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="First name"
          name="firstName"
          defaultValue={firstName}
          autoComplete="given-name"
          required
          errors={state.fieldErrors?.firstName}
        />
        <Field
          label="Last name"
          name="lastName"
          defaultValue={lastName}
          autoComplete="family-name"
          required
          errors={state.fieldErrors?.lastName}
        />
      </div>
      <Field
        label="Email"
        name="email"
        type="email"
        icon="mail"
        defaultValue={email}
        autoComplete="email"
        required
        errors={state.fieldErrors?.email}
      />
      <Field
        label="Phone Number"
        name="phone"
        type="tel"
        icon="phone"
        defaultValue={phone}
        autoComplete="tel"
        placeholder="+234…"
        errors={state.fieldErrors?.phone}
      />
      <FormActions pending={pending} />
    </form>
  );
}
