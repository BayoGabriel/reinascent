"use client";

import { useActionState, useState } from "react";

import { FormMessage } from "@/components/feedback/form-message";
import { TextField } from "@/components/forms/text-field";
import { Icon } from "@/components/ui/Icon";
import { SubmitButton } from "@/components/ui/submit-button";
import { submitReviewAction } from "../actions";
import { PhotoSlots } from "./PhotoSlots";
import { StarRatingInput } from "./StarRatingInput";

const FIELD =
  "w-full rounded-xl border-0 bg-stone-100 px-4 py-3 text-sm text-[#1F253F] placeholder:text-cocoa/40 outline-none focus:ring-2 focus:ring-gold";

/** Rate This Product form — posts via the submitReview Server Action. */
export function ReviewForm({ slug }: { slug: string }) {
  const [state, formAction, pending] = useActionState(submitReviewAction, {});
  const [length, setLength] = useState(0);
  const bodyError = state.fieldErrors?.body?.[0];
  return (
    <form action={formAction} className="mt-10 flex flex-col gap-6">
      <input type="hidden" name="slug" value={slug} />
      <StarRatingInput error={state.fieldErrors?.rating?.[0]} />
      <TextField
        label="Title*"
        name="title"
        required
        maxLength={120}
        errors={state.fieldErrors?.title}
        className={FIELD}
      />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="body" className="text-sm font-medium">
          Description*
        </label>
        <textarea
          id="body"
          name="body"
          required
          rows={5}
          maxLength={1000}
          aria-invalid={bodyError ? true : undefined}
          aria-describedby={bodyError ? "body-error" : undefined}
          onChange={(e) => setLength(e.target.value.length)}
          className={`${FIELD} resize-none`}
        />
        <p className="text-[11px] text-cocoa/50">{length}/1000</p>
        {bodyError && (
          <p id="body-error" className="text-sm text-red-600">
            {bodyError}
          </p>
        )}
      </div>
      <PhotoSlots error={state.fieldErrors?.photos?.[0]} />
      <FormMessage message={state.message} />
      <SubmitButton
        pending={pending}
        pendingLabel="Submitting…"
        className="mx-auto mt-2 flex w-full max-w-md items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-cocoa disabled:cursor-not-allowed disabled:opacity-60"
      >
        Submit <Icon name="arrowRight" className="size-4" />
      </SubmitButton>
    </form>
  );
}
