import { Stars } from "@/components/products/Stars";
import type { ProductReview } from "../types";

interface RatingSummaryProps {
  ratingValue: number;
  ratingCount: number;
  reviews: ProductReview[];
}

/** Aggregate score with a per-star distribution derived from stored reviews. */
export function RatingSummary({ ratingValue, ratingCount, reviews }: RatingSummaryProps) {
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));
  const max = Math.max(1, ...dist.map((d) => d.count));
  return (
    <div className="flex items-start gap-6">
      <div>
        <p className="text-5xl font-semibold tracking-tight text-[#1F253F]">
          {ratingValue.toFixed(1)}
          <span className="text-lg font-normal text-cocoa/60">/5</span>
        </p>
        <Stars value={ratingValue} className="mt-2" />
        <p className="mt-1 text-xs text-cocoa/60">{ratingCount} ratings</p>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 pt-2">
        {dist.map((d) => (
          <div key={d.star} className="flex items-center gap-2">
            <span className="w-3 text-right text-[11px] text-cocoa/70">{d.star}</span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
              <span
                className="block h-full rounded-full bg-ink"
                style={{ width: `${(d.count / max) * 100}%` }}
              />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
