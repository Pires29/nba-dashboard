import { Suspense } from "react";
import AuthLoadingState from "@/components/AuthLoadingState";
import { SignupForm } from "@/components/SignUp";

export default function Page() {
  return (
    <Suspense fallback={<AuthLoadingState label="Loading sign up" variant="signup" />}>
      <SignupForm />
    </Suspense>
  );
}
