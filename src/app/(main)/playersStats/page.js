import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import PlayerStats from "./PlayerStats"; // ou como se chamar o teu componente

export default async function Page() {
  const session = await getServerSession(authOptions);
  const plan = session?.user?.plan ?? "free";

  return <PlayerStats plan={plan} />;
}
