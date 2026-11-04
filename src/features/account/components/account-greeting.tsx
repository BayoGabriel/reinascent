import Link from "next/link";

import { signOutAction } from "@/features/auth/actions";

const linkClass = "underline underline-offset-2 transition-colors hover:text-[#1F253F]";

/** Section header repeated across account screens: title, hello line, intro. */
export function AccountGreeting({
  title,
  name,
}: {
  title: string;
  name: string;
}) {
  return (
    <div className="border-b border-line pb-5">
      <h2 className="text-base font-semibold text-[#1F253F]">{title}</h2>
      <div className="mt-1.5 text-sm text-cocoa">
        Hello {name} (not {name}?{" "}
        <form action={signOutAction} className="inline">
          <button type="submit" className={linkClass}>
            Log out
          </button>
        </form>
        )
      </div>
      <p className="mt-1.5 text-sm text-cocoa/80">
        From your account dashboard you can view your{" "}
        <Link href="/account/orders" className={linkClass}>
          recent orders
        </Link>
        , manage your{" "}
        <Link href="/account/address" className={linkClass}>
          shipping and billing addresses
        </Link>
        , and{" "}
        <Link href="/account/details" className={linkClass}>
          edit your password and account details
        </Link>
        .
      </p>
    </div>
  );
}
