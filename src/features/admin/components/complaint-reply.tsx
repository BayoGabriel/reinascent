"use client";

import { useActionState } from "react";

import { replyComplaintAction } from "@/features/admin/actions";

/** Admin reply box appended to a complaint thread. */
export function ComplaintReply({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState(replyComplaintAction, {});
  return (
    <form action={formAction} className="mt-4 flex gap-2">
      <input type="hidden" name="id" value={id} />
      <input
        name="body"
        required
        minLength={2}
        maxLength={2000}
        placeholder="Reply to customer…"
        className="flex-1 rounded-lg border border-line bg-white px-3 py-2 text-sm text-[#1F253F] outline-none placeholder:text-cocoa/50 focus:border-gold"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-ink px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-cocoa disabled:opacity-60"
      >
        {pending ? "Sending…" : "Reply"}
      </button>
      {state.message && !state.ok && (
        <p role="alert" className="self-center text-xs text-red-600">{state.message}</p>
      )}
    </form>
  );
}
