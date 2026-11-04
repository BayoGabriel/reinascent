import { signOutAction } from "@/features/auth/actions";
import { Icon } from "@/components/ui/Icon";

interface AccountUserCardProps {
  name: string;
  email: string;
}

/** Sidebar profile block — initials avatar, identity, quick sign-out. */
export function AccountUserCard({ name, email }: AccountUserCardProps) {
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="flex items-center gap-3 border-t border-line pt-5">
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cream text-sm font-semibold text-cocoa"
      >
        {initials || "?"}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#1F253F]">{name}</p>
        <p className="truncate text-xs text-cocoa/70">{email}</p>
      </div>
      <form action={signOutAction}>
        <button
          type="submit"
          aria-label="Log out"
          className="text-cocoa transition-colors hover:text-[#1F253F]"
        >
          <Icon name="logout" className="size-4.5" />
        </button>
      </form>
    </div>
  );
}
