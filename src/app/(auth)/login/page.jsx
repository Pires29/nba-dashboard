import { Suspense } from "react";
import { LoginForm } from "@/components/Login";

export default function Page() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
