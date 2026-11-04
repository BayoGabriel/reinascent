import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import type { AboutPageContent } from "@/features/content-management/types";

/** "Why choose us" — pill eyebrow, split heading/copy, numbered list + photo. */
export function WhyChoose({ why }: { why: AboutPageContent["why"] }) {
  return (
    <section
      aria-labelledby="why-choose-us"
      className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6"
    >
      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <div>
          {why.eyebrow && (
            <span className="inline-flex items-center gap-2 rounded-md bg-[#37b8e0] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white">
              <Icon name="sparkles" className="size-3.5" />
              {why.eyebrow}
            </span>
          )}
          <h2
            id="why-choose-us"
            className="mt-4 text-3xl font-semibold tracking-tight text-[#1F253F] sm:text-5xl"
          >
            {why.heading}
          </h2>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-[#1F253F]/60 lg:justify-self-end lg:pt-10">
          {why.body}
        </p>
      </div>
      <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:items-center">
        <ol className="space-y-8">
          {why.items.map((item, i) => (
            <li key={item.title} className="flex gap-5">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#e8e8ec] text-sm font-semibold text-[#1F253F]/70">
                {i + 1}
              </span>
              <div>
                <h3 className="text-base font-semibold text-[#1F253F]">
                  {item.title}
                </h3>
                <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-[#1F253F]/60">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
        {why.imageUrl && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image
              src={why.imageUrl}
              alt={why.alt}
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
        )}
      </div>
    </section>
  );
}
