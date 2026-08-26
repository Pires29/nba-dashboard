import { Suspense } from "react";
import AuthLoadingState from "@/components/AuthLoadingState";
import { LoginForm } from "@/components/Login";

export default function Page() {
  return (
    <Suspense fallback={<AuthLoadingState label="Loading sign in" />}>
      <LoginForm />
    </Suspense>
  );
}
