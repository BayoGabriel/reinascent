"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

interface ShopToolbarProps {
  categories: string[];
  query: string;
  category: string;
}

/** Heading + category/search filters — writes filters to the URL query. */
export function ShopToolbar({ categories, query, category }: ShopToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(query);

  const apply = (next: { q?: string; category?: string }) => {
    const params = new URLSearchParams();
    const nq = (next.q ?? q).trim();
    const nc = next.category ?? category;
    if (nq) params.set("q", nq);
    if (nc) params.set("category", nc);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    apply({});
  };

  return (
    <section
      aria-label="Shop filters"
      className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pt-14 sm:px-6 lg:flex-row lg:items-center lg:justify-between"
    >
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <h2 className="text-3xl font-semibold tracking-tight text-[#1F253F] sm:text-4xl">
          Grab all you Need!
        </h2>
        <label className="relative">
          <span className="sr-only">Filter by category</span>
          <select
            value={category}
            onChange={(e) => apply({ category: e.target.value })}
            className="w-44 appearance-none rounded-full border border-line bg-white px-5 py-3 text-sm text-[#1F253F]/70 outline-none transition-colors hover:border-ink/30 focus-visible:ring-2 focus-visible:ring-gold"
          >
            <option value="">Category</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#1F253F]/50"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </label>
      </div>
      <form
        role="search"
        onSubmit={onSubmit}
        className="flex w-full max-w-md items-center gap-2 rounded-full border border-line bg-white py-1.5 pl-5 pr-1.5"
      >
        <input
          type="search"
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="find your scents with ease"
          className="min-w-0 flex-1 bg-transparent text-sm text-[#1F253F] outline-none placeholder:text-[#1F253F]/40"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cocoa focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          Search
        </button>
      </form>
    </section>
  );
}
