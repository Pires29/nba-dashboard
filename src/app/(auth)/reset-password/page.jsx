import { Suspense } from "react";
import AuthLoadingState from "@/components/AuthLoadingState";
import { ResetPasswordForm } from "@/components/ResetPassword";

export default function Page() {
  return (
    <Suspense fallback={<AuthLoadingState label="Loading password reset" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
