"use client";

import { useRouter } from "next/navigation";

import { Icon } from "@/components/ui/Icon";

/** Pill "Back" control — returns to the previous page in history. */
export function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-1.5 text-sm text-cocoa transition-colors hover:border-cocoa/40 hover:text-[#1F253F]"
    >
      <Icon name="arrowUpRight" className="size-3.5 rotate-[225deg]" /> Back
    </button>
  );
}
