// app/(public)/pricing/page.jsx
import { getCurrentSession } from "@/lib/getCurrentSession";
import { redirect } from "next/navigation";
import PricingPage from "./PricingPage";

export default async function Page() {
  const session = await getCurrentSession();
  const plan = session?.user ?? "free";

  return <PricingPage userPlan={plan} />;
}
