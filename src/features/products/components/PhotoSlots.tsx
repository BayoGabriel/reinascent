"use client";

import { useState } from "react";

import { MAX_REVIEW_PHOTOS } from "../types";

interface PhotoSlotsProps {
  error?: string;
}

/** Up to four "+" tiles, each holding one image file under `photos`. */
export function PhotoSlots({ error }: PhotoSlotsProps) {
  const [previews, setPreviews] = useState<(string | null)[]>(
    Array(MAX_REVIEW_PHOTOS).fill(null),
  );
  return (
    <fieldset>
      <legend className="text-sm font-medium text-[#1F253F]">Attach a Photo</legend>
      <div className="mt-2.5 flex gap-3">
        {previews.map((url, i) => (
          <label
            key={i}
            style={
              url
                ? {
                    backgroundImage: `url(${url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
            className="grid size-14 cursor-pointer place-items-center overflow-hidden rounded-xl border border-line bg-stone-100 text-xl text-cocoa/40 transition-colors hover:border-cocoa/50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold"
          >
            <input
              type="file"
              name="photos"
              accept="image/jpeg,image/png,image/webp"
              aria-label={`Attach photo ${i + 1}`}
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setPreviews((prev) => {
                  const next = [...prev];
                  if (next[i]) URL.revokeObjectURL(next[i]!);
                  next[i] = file ? URL.createObjectURL(file) : null;
                  return next;
                });
              }}
            />
            {!url && <span aria-hidden="true">+</span>}
          </label>
        ))}
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </fieldset>
  );
}
