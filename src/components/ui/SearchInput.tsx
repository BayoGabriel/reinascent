import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

interface SearchInputProps {
  placeholder?: string;
  action?: string;
  className?: string;
}

/** Search form — plain GET navigation, no client JS required. */
export function SearchInput({
  placeholder = "Search",
  action = "/products",
  className,
}: SearchInputProps) {
  return (
    <form action={action} method="get" role="search" className={cn("relative", className)}>
      <input
        type="search"
        name="q"
        placeholder={placeholder}
        className="w-full rounded-lg border border-line bg-white/70 py-2.5 pl-4 pr-10 text-sm text-[#1F253F] outline-none transition-colors placeholder:text-cocoa/50 focus:border-gold"
      />
      <button
        type="submit"
        aria-label="Search"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-cocoa transition-colors hover:text-gold"
      >
        <Icon name="search" className="size-4" />
      </button>
    </form>
  );
}
