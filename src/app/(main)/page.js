import { WelcomeCard } from "@/components/WelcomeCard";
import HomeDashboard from "./homeDashboard/page";

export default async function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D1B2E] to-[#060E1A] font-sans">
      <HomeDashboard />
    </div>
  );
}
