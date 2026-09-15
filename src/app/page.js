import HomeLanding from "@/components/home/HomeLanding";
import BetaAccessProvider from "@/components/home/BetaAccessProvider";
import PublicNavbar from "@/components/PublicNavbar";
import PublicSessionProvider from "@/components/home/PublicSessionProvider";
import { getCurrentSession } from "@/lib/getCurrentSession";

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

function firstSearchParam(value) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Home({ searchParams }) {
  const [session, params] = await Promise.all([getCurrentSession(), searchParams]);

  return (
    <div className="flex min-h-screen flex-col bg-[#060E1A]">
      <PublicSessionProvider initialUser={session?.user ?? null}>
        <BetaAccessProvider
          betaAction={firstSearchParam(params?.beta)}
          callbackUrl={firstSearchParam(params?.callbackUrl)}
        >
          <PublicNavbar />
          <main className="flex min-h-0 flex-1 flex-col">
            <HomeLanding />
          </main>
        </BetaAccessProvider>
      </PublicSessionProvider>
    </div>
  );
}
