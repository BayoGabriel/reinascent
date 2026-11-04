import Link from "next/link";

interface PagePlaceholderProps {
  title: string;
  description: string;
}

/** Temporary page body for routes whose features are not built yet. */
export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center">
      <span className="text-[10px] uppercase tracking-[0.45em] text-gold">
        Raina Scents
      </span>
      <h1 className="font-serif text-4xl text-[#1F253F] sm:text-5xl">{title}</h1>
      <p className="max-w-md leading-relaxed text-cocoa">{description}</p>
      <Link
        href="/"
        className="mt-2 rounded-full border border-gold px-7 py-2.5 text-sm text-cocoa transition-colors hover:bg-gold hover:text-[#1F253F]"
      >
        Back to home
      </Link>
    </section>
  );
}
