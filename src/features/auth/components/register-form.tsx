"use client";

import { useActionState } from "react";
import Link from "next/link";

import { registerAction } from "@/features/auth/actions";
import { TextField } from "@/components/forms/text-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/feedback/form-message";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, {});

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      <FormMessage message={state.message} />
      <TextField
        label="Display name"
        name="displayName"
        autoComplete="name"
        required
        errors={state.fieldErrors?.displayName}
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        errors={state.fieldErrors?.email}
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        errors={state.fieldErrors?.password}
      />
      <SubmitButton pending={pending} pendingLabel="Creating account…">
        Create account
      </SubmitButton>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Already registered?{" "}
        <Link href="/sign-in" className="font-medium underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
