import HomeLanding from "@/components/home/HomeLanding";
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

export default async function Home() {
  const session = await getCurrentSession();

  return (
    <div className="flex min-h-screen flex-col bg-[#060E1A]">
      <PublicSessionProvider initialUser={session?.user ?? null}>
        <PublicNavbar />
        <main className="flex min-h-0 flex-1 flex-col">
          <HomeLanding />
        </main>
      </PublicSessionProvider>
    </div>
  );
}
