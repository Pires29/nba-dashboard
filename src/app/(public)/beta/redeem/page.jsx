import { redirect } from "next/navigation";
import { safeInternalPath } from "@/lib/security";

export default async function BetaRedeemPage({ searchParams }) {
  const { callbackUrl } = await searchParams;
  const destination = safeInternalPath(
    Array.isArray(callbackUrl) ? callbackUrl[0] : callbackUrl,
    "/props",
  );
  redirect(`/?beta=redeem&callbackUrl=${encodeURIComponent(destination)}`);
}
