// app/(public)/pricing/page.jsx
import { getCurrentSession } from "@/lib/getCurrentSession";
import { redirect } from "next/navigation";
import PricingPage from "./PricingPage";
import { getQaContext } from "@/lib/qa/context";

export default async function Page() {
  const session = await getCurrentSession();
  const qa = await getQaContext();
  const plan = qa ? { ...(session?.user ?? {}), plan: qa.persona } : session?.user ?? "free";

  return <PricingPage userPlan={plan} />;
}
