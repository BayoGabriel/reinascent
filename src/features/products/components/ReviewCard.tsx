import Image from "next/image";
import { Stars } from "@/components/products/Stars";
import type { ProductReview } from "../types";

/** A single customer review in the PDP ratings block. */
export function ReviewCard({ review }: { review: ProductReview }) {
  return (
    <figure className="rounded-2xl border border-line bg-white p-5">
      <figcaption className="mb-3 flex items-center gap-3">
        {review.avatarUrl ? (
          <span className="relative size-10 overflow-hidden rounded-full bg-stone-200">
            <Image src={review.avatarUrl} alt="" fill sizes="40px" className="object-cover" />
          </span>
        ) : (
          <span className="grid size-10 place-items-center rounded-full bg-cream font-serif text-sm font-semibold text-cocoa">
            {review.author.slice(0, 1)}
          </span>
        )}
        <span className="flex-1">
          <span className="block text-sm font-semibold text-[#1F253F]">{review.author}</span>
          {review.role && (
            <span className="block text-[11px] text-cocoa/60">{review.role}</span>
          )}
        </span>
        {review.date && (
          <span className="text-[11px] text-cocoa/50">{review.date}</span>
        )}
      </figcaption>
      <Stars value={review.rating} className="mb-2" />
      {review.title && (
        <p className="mb-1 text-sm font-semibold text-[#1F253F]">{review.title}</p>
      )}
      {review.text && (
        <blockquote className="text-sm leading-relaxed text-[#1F253F]/70">
          {review.text}
        </blockquote>
      )}
      {review.photoIds?.length ? (
        <span className="mt-3 flex flex-wrap gap-2">
          {review.photoIds.map((id) => (
            <span
              key={id}
              className="relative size-14 overflow-hidden rounded-lg bg-stone-200"
            >
              <Image
                src={`/api/review-photos/${id}`}
                alt="Customer photo"
                fill
                sizes="56px"
                className="object-cover"
              />
            </span>
          ))}
        </span>
      ) : null}
    </figure>
  );
}
