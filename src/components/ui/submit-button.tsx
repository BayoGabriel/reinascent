import type { ButtonHTMLAttributes } from "react";

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  pending?: boolean;
  pendingLabel?: string;
}

export function SubmitButton({
  pending = false,
  pendingLabel = "Working…",
  children,
  ...rest
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={pending || rest.disabled}
      className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      {...rest}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
