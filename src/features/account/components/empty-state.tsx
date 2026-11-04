import Link from "next/link";

/** Friendly empty block for account sections with no records yet. */
export function EmptyState({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="rounded-xl border border-dashed border-line px-6 py-10 text-center">
      <p className="text-sm font-medium text-[#1F253F]">{title}</p>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-cocoa/80">{body}</p>
      {cta && (
        <Link
          href={cta.href}
          className="mt-4 inline-flex rounded-full bg-ink px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-cocoa"
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}
