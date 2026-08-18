import HomeLanding from "@/components/home/HomeLanding";
import { getCurrentSession } from "@/lib/getCurrentSession";
import { getQaContext } from "@/lib/qa/context";

export const metadata = {
  title: "HoopiQ — NBA Props Research, Made Clear",
  description:
    "Research NBA player props with hit rates, matchup context, injuries, and advanced filters in one fast dashboard.",
};

export default async function Home() {
  const session = await getCurrentSession();
  const qa = await getQaContext();
  const user = qa
    ? { ...(session?.user ?? {}), plan: qa.persona }
    : session?.user ?? null;

  return <HomeLanding user={user} />;
}
