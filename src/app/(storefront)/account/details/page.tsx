import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";

import { AccountGreeting } from "@/features/account/components/account-greeting";
import { FormSection } from "@/features/account/components/form-section";
import { PasswordForm } from "@/features/account/components/password-form";
import { ProfileForm } from "@/features/account/components/profile-form";
import { requireUser } from "@/server/auth/current-user";

export const metadata: Metadata = {
  title: "Account Details — Raina Scents",
};

export default function AccountDetailsPage() {
  return (
    <Suspense fallback={null}>
      <DetailsContent />
    </Suspense>
  );
}

async function DetailsContent() {
  await connection();
  const user = await requireUser();
  const [fallbackFirst, ...rest] = (user.displayName ?? "").split(" ");
  return (
    <div className="flex flex-col gap-8">
      <AccountGreeting title="Account Details" name={user.displayName} />
      <FormSection
        title="Personal info"
        description="Update your photo and personal details."
      >
        <ProfileForm
          firstName={user.firstName ?? fallbackFirst ?? ""}
          lastName={user.lastName ?? rest.join(" ")}
          email={user.email}
          phone={user.phone ?? ""}
        />
      </FormSection>
      <FormSection title="Password" description="Update your password.">
        <PasswordForm />
      </FormSection>
    </div>
  );
}
