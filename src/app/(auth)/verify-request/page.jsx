import { Suspense } from "react";
import AuthLoadingState from "@/components/AuthLoadingState";
import { VerifyRequestForm } from "@/components/VerifyRequest";

export default function Page() {
  return (
    <Suspense fallback={<AuthLoadingState label="Loading verification" />}>
      <VerifyRequestForm />
    </Suspense>
  );
}
