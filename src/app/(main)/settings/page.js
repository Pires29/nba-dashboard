import { getCurrentSession } from "@/lib/getCurrentSession";
import { getLaunchConfig } from "@/config/launch";
import SettingsPage from "./SettingsPage";

export default async function Page() {
  const session = await getCurrentSession();
  return <SettingsPage session={session} isBeta={getLaunchConfig().isBeta} />;
}
