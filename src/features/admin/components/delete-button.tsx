"use client";

import { useTransition } from "react";

import { Icon } from "@/components/ui/Icon";

/** Icon-button delete with a native confirm, bound to a server action. */
export function DeleteButton({
  action,
  label = "Delete",
}: {
  action: () => Promise<void>;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      aria-label={label}
      onClick={() => {
        if (window.confirm(`${label}? This cannot be undone.`)) {
          startTransition(() => action());
        }
      }}
      className="rounded-lg p-2 text-cocoa/60 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
    >
      <Icon name="trash" className="size-4" />
    </button>
  );
}
