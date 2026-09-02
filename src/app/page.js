import HomeLanding from "@/components/home/HomeLanding";
import PublicNavbar from "@/components/PublicNavbar";

export const metadata = {
  title: "PropInsight — Props Research, Made Clear",
  description:
    "Research NBA player props with hit rates, matchup context, injuries, and advanced filters in one fast dashboard.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#060E1A]">
      <PublicNavbar />
      <main className="flex min-h-0 flex-1 flex-col">
        <HomeLanding />
      </main>
    </div>
  );
}
