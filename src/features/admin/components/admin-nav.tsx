"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

const GROUPS: Array<{
  label: string;
  items: Array<{ href: string; label: string; icon: IconName }>;
}> = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: "dashboard" }],
  },
  {
    label: "Manage",
    items: [
      { href: "/admin/orders", label: "Orders", icon: "cart" },
      { href: "/admin/products", label: "Products", icon: "box" },
      { href: "/admin/customers", label: "Customers", icon: "user" },
      { href: "/admin/complaints", label: "Complaints", icon: "clipboard" },
    ],
  },
  {
    label: "Configure",
    items: [
      { href: "/admin/content", label: "Content", icon: "layers" },
      { href: "/admin/settings", label: "Settings", icon: "gear" },
    ],
  },
];

/** Dark admin rail — grouped nav with active-state highlighting. */
export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="flex flex-1 flex-col gap-6">
      {GROUPS.map((group) => (
        <div key={group.label}>
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/35">
            {group.label}
          </p>
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-white/10 font-medium text-gold-soft"
                      : "text-white/60 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <Icon name={item.icon} className="size-4.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
