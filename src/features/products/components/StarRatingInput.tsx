"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

interface StarRatingInputProps {
  error?: string;
}

/** Interactive 1–5 star picker; submits via a hidden `rating` field. */
export function StarRatingInput({ error }: StarRatingInputProps) {
  const [value, setValue] = useState(0);
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <fieldset>
      <legend className="text-base font-semibold text-[#1F253F]">Star Rating</legend>
      <input type="hidden" name="rating" value={value || ""} />
      <div
        role="radiogroup"
        aria-label="Star rating"
        className="mt-3 flex items-center gap-2"
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === i}
            aria-label={`${i} star${i > 1 ? "s" : ""}`}
            onClick={() => setValue(i)}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(0)}
            className="rounded-sm transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className={cn(
                "size-8 transition-colors",
                i <= shown ? "text-gold" : "text-line",
              )}
            >
              <path d="M12 2.5 14.9 8.6l6.6.7-4.9 4.5 1.4 6.5L12 17l-6 3.3 1.4-6.5L2.5 9.3l6.6-.7L12 2.5Z" />
            </svg>
          </button>
        ))}
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </fieldset>
  );
}
