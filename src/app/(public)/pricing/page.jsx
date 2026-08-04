// app/(public)/pricing/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import PricingPage from "./PricingPage";

export default async function Page() {
  const session = await getServerSession(authOptions);
  const plan = session?.user ?? "free";

  return <PricingPage userPlan={plan} />;
}
