import type { AboutItem } from "@/features/content-management/types";

interface CoreValuesProps {
  heading: string;
  values: AboutItem[];
}

/** "Our Core Values" — bold heading with a 2×2 grid of muted cards. */
export function CoreValues({ heading, values }: CoreValuesProps) {
  if (!values.length) return null;
  return (
    <section
      aria-labelledby="core-values"
      className="mx-auto w-full max-w-5xl px-4 pt-20 sm:px-6"
    >
      <h2
        id="core-values"
        className="text-3xl font-semibold tracking-tight text-[#1F253F] sm:text-5xl"
      >
        {heading}
      </h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {values.map((value) => (
          <div key={value.title} className="rounded-2xl bg-[#f4f4f6] p-6 sm:p-7">
            <h3 className="text-lg font-semibold text-[#1F253F]">{value.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#1F253F]/60">
              {value.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
