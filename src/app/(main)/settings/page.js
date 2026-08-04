import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import SettingsPage from "./SettingsPage";

export default async function Page() {
  const session = await getServerSession(authOptions);
  return <SettingsPage session={session} />;
}
