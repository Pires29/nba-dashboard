import { Suspense } from "react";
import AuthLoadingState from "@/components/AuthLoadingState";
import { ForgotPasswordForm } from "@/components/ForgotPassword";

export default function Page() {
  return (
    <Suspense fallback={<AuthLoadingState label="Loading password reset" />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
