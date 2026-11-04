import type { ReactNode } from "react";

/** Two-column panel: label/description rail + content (fields & actions). */
export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-6 rounded-xl border border-line bg-white p-6 sm:grid-cols-[13rem_1fr] sm:p-8">
      <div>
        <h3 className="text-sm font-semibold text-[#1F253F]">{title}</h3>
        <p className="mt-1 text-sm text-cocoa/80">{description}</p>
      </div>
      <div>{children}</div>
    </section>
  );
}
