"use client";

import { useActionState, useState } from "react";
import Link from "next/link";

import { signInAction } from "@/features/auth/actions";
import { FormMessage } from "@/components/feedback/form-message";
import { Icon } from "@/components/ui/Icon";

const inputClass =
  "h-14 w-full rounded-lg border border-[#eaeaea] bg-[#f4f4f5] px-4 text-sm text-zinc-900 outline-none placeholder:text-[#bbbbbb] focus:border-zinc-400";
const labelClass = "text-sm font-medium text-[#15322d]";

export function SignInForm() {
  const [state, formAction, pending] = useActionState(signInAction, {});
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form
      action={formAction}
      className="flex w-full max-w-xl flex-col gap-8 rounded-2xl border border-[#eaeaea] bg-white px-8 py-12 sm:px-12"
    >
      <FormMessage message={state.message} />
      <div className="flex flex-col gap-3">
        <label htmlFor="email" className={labelClass}>
          Username or email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="matthew@withhome.com"
          aria-invalid={state.fieldErrors?.email?.length ? true : undefined}
          className={inputClass}
        />
        {state.fieldErrors?.email?.length ? (
          <p className="text-sm text-red-600">{state.fieldErrors.email[0]}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-3">
        <label htmlFor="password" className={labelClass}>
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="••••••••"
            aria-invalid={state.fieldErrors?.password?.length ? true : undefined}
            className={`${inputClass} pr-14`}
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-4 text-[#292d32] transition-opacity hover:opacity-60"
          >
            <Icon name={showPassword ? "eye" : "eyeOff"} filled={!showPassword} className="size-6" />
          </button>
        </div>
        {state.fieldErrors?.password?.length ? (
          <p className="text-sm text-red-600">{state.fieldErrors.password[0]}</p>
        ) : null}
      </div>
      <label htmlFor="rememberMe" className="flex items-center gap-4 text-sm text-[#4d525f]">
        <input
          id="rememberMe"
          name="rememberMe"
          type="checkbox"
          className="size-3.5 shrink-0 accent-[#030712]"
        />
        Remember me
      </label>
      <button
        type="submit"
        disabled={pending}
        className="flex h-14 items-center justify-center gap-3 rounded-[10px] bg-[#030712] text-sm font-medium text-[#f4f4f5] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Log In"}
        <Icon name="send" filled className="size-3.5" />
      </button>
      <p className="flex items-center justify-center gap-2 text-xs text-[#57534e]">
        <Icon name="info" className="size-4 text-[#cccccc]" />
        You would get the full experience within 24h
      </p>
      <p className="text-center text-sm text-[#57534e]">
        No account?{" "}
        <Link href="/register" className="font-medium underline">
          Register
        </Link>
      </p>
    </form>
  );
}
