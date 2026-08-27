import { Suspense } from "react";
import AuthLoadingState from "@/components/AuthLoadingState";
import { VerifyEmailForm } from "@/components/VerifyEmail";

export default function Page() {
  return (
    <Suspense fallback={<AuthLoadingState label="Verifying email" />}>
      <VerifyEmailForm />
    </Suspense>
  );
}
