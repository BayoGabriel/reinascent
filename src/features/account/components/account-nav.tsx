"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon, type IconName } from "@/components/ui/Icon";
import { signOutAction } from "@/features/auth/actions";
import { cn } from "@/lib/utils";

const ITEMS: Array<{ href: string; label: string; icon: IconName }> = [
  { href: "/account", label: "Dashboard", icon: "dashboard" },
  { href: "/account/orders", label: "Orders", icon: "cart" },
  { href: "/account/address", label: "Address", icon: "pin" },
  { href: "/account/payment-methods", label: "Payment Methods", icon: "creditCard" },
  { href: "/account/saved-cards", label: "Saved Cards", icon: "wallet" },
  { href: "/account/details", label: "Account Details", icon: "userCheck" },
  { href: "/account/transactions", label: "Transactions", icon: "layers" },
  { href: "/account/complaints", label: "Complaints", icon: "clipboard" },
];

const rowClass =
  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors";

/** Sidebar navigation — highlights the item matching the current route. */
export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Account" className="flex flex-col">
      {ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              rowClass,
              active
                ? "bg-cream font-medium text-[#1F253F]"
                : "text-cocoa hover:bg-cream/60 hover:text-[#1F253F]",
            )}
          >
            <Icon name={item.icon} className="size-4.5 shrink-0" />
            <span className="flex-1">{item.label}</span>
            <Icon name="chevronRight" className="size-3.5 text-cocoa/50" />
          </Link>
        );
      })}
      <form action={signOutAction}>
        <button
          type="submit"
          className={cn(rowClass, "text-cocoa hover:bg-cream/60 hover:text-[#1F253F]")}
        >
          <Icon name="flag" className="size-4.5 shrink-0" />
          <span className="flex-1">Log Out</span>
          <Icon name="chevronRight" className="size-3.5 text-cocoa/50" />
        </button>
      </form>
    </nav>
  );
}
