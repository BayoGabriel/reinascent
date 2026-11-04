import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";

import { AccountGreeting } from "@/features/account/components/account-greeting";
import { AddressEditor } from "@/features/account/components/address-editor";
import { getAddressView } from "@/features/account/service";
import { requireUser } from "@/server/auth/current-user";

export const metadata: Metadata = { title: "Address — Raina Scents" };

export default function AccountAddressPage() {
  return (
    <Suspense fallback={null}>
      <AddressContent />
    </Suspense>
  );
}

async function AddressContent() {
  await connection();
  const user = await requireUser();
  const address = await getAddressView(user);
  return (
    <div className="flex flex-col gap-8">
      <AccountGreeting title="Address" name={user.displayName} />
      <section>
        <h3 className="mb-2 text-sm font-semibold text-[#1F253F]">
          Shipping Address
        </h3>
        {address && <AddressEditor initial={address} />}
      </section>
    </div>
  );
}
