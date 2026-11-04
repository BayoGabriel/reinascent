import { SearchInput } from "@/components/ui/SearchInput";
import type { PublicUser } from "@/server/repositories/user.repository";
import { AccountNav } from "./account-nav";
import { AccountUserCard } from "./account-user-card";

/** Left rail of the My Account shell: search, section nav, user card. */
export function AccountSidebar({ user }: { user: PublicUser }) {
  return (
    <aside className="flex flex-col gap-6 lg:sticky lg:top-8 lg:self-start">
      <SearchInput placeholder="Search" action="/products" className="w-full" />
      <AccountNav />
      <AccountUserCard
        name={user.displayName || user.email}
        email={user.email}
      />
    </aside>
  );
}
