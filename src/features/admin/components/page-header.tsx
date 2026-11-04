import type { ReactNode } from "react";

/** Consistent page title row across admin screens. */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-serif text-2xl font-medium tracking-tight text-[#1F253F] sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-cocoa/80">{description}</p>
        )}
      </div>
      {actions}
    </header>
  );
}
