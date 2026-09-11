import HomeLanding from "@/components/home/HomeLanding";
import PublicNavbar from "@/components/PublicNavbar";
import { redirect } from "next/navigation";
import { isClosedBetaEnabled } from "@/lib/betaAccess";
import { getCurrentSession } from "@/lib/getCurrentSession";
import { resolveBetaAccess } from "@/lib/resolveBetaAccess";
import { safeInternalPath } from "@/lib/security";

export const metadata = {
  title: "NBA Player Props Research & Stats Dashboard",
  description:
    "Use PropInsight to research NBA player props with hit rates, matchup stats, injury context, player trends, and advanced slate filters.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "PropInsight — NBA Player Props Research & Stats Dashboard",
    description:
      "Research NBA player props with hit rates, matchup stats, injury context, player trends, and advanced slate filters.",
    url: "/",
  },
  twitter: {
    title: "PropInsight — NBA Player Props Research & Stats Dashboard",
    description:
      "Research NBA player props with hit rates, matchup stats, injury context, player trends, and advanced slate filters.",
  },
};

export default async function Home({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const isClosedBeta = isClosedBetaEnabled();
  const session = isClosedBeta ? await getCurrentSession() : null;
  const hasBetaAccess = isClosedBeta
    ? await resolveBetaAccess(session)
    : true;
  const isRedeemingBeta = resolvedSearchParams?.beta === "redeem";

  if (hasBetaAccess && isRedeemingBeta) {
    redirect(safeInternalPath(resolvedSearchParams.callbackUrl, "/props"));
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#060E1A]">
      <PublicNavbar
        hasBetaAccess={hasBetaAccess}
        initiallyRedeeming={isRedeemingBeta}
      />
      <main className="flex min-h-0 flex-1 flex-col">
        <HomeLanding hasBetaAccess={hasBetaAccess} />
      </main>
    </div>
  );
}
