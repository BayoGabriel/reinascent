"use client";

import { useTransition } from "react";

import { setComplaintStatusAction } from "@/features/account/actions";

/** "Mark as Solved" checkbox bound to the thread's status. */
export function SolvedToggle({
  complaintId,
  solved,
}: {
  complaintId: string;
  solved: boolean;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <label className="flex shrink-0 items-center gap-2 text-sm text-cocoa">
      Mark as Solved
      <input
        type="checkbox"
        checked={solved}
        disabled={pending}
        onChange={(e) =>
          startTransition(() =>
            setComplaintStatusAction(complaintId, e.target.checked),
          )
        }
        className="size-4.5 accent-gold"
      />
    </label>
  );
}
