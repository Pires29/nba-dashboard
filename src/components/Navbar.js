import { getCurrentSession } from "@/lib/getCurrentSession";
import Link from "next/link";
import PricingLink from "./PricingLink";
import ProfileMenuClient from "./ProfileMenuClient";
import { getQaContext } from "@/lib/qa/context";
import { resolveQaPlan } from "@/lib/qa/plan";
import SessionExpiredSignOut from "./SessionExpiredSignOut";

const Navbar = async () => {
  const session = await getCurrentSession();
  if (session?.user?.accountDeleted) {
    return <SessionExpiredSignOut />;
  }

  const qa = await getQaContext();
  const activePlan = resolveQaPlan(qa?.persona, session?.user?.plan);
  const isFreePlan = activePlan === "free";

  return (
    <nav className="relative sticky top-0 z-50 border-b border-white/6 bg-gradient-to-b from-[#122040] to-[#0D1828]">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 via-amber-400 to-transparent" />

      <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center shadow-[0_0_12px_rgba(249,115,22,0.4)]">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 10.5 5.2 7.3l2 2L12 4.5" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              <path
                d="M2 12h10"
                stroke="white"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="font-mono font-black text-sm tracking-widest text-white uppercase group-hover:text-orange-400 transition-colors">
            PROPINSIGHT
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {qa && (
            <Link
              href="/qa"
              className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 font-mono text-[9px] font-black uppercase tracking-widest text-emerald-400"
            >
              QA · {qa.persona} · {qa.scenario}
            </Link>
          )}
          {/* Upgrade button — Free plan only */}
          {isFreePlan && (
            <PricingLink
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 hover:border-orange-500/50 transition-all duration-150 group"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#f97316"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-orange-400 group-hover:text-orange-300 transition-colors">
                Upgrade
              </span>
            </PricingLink>
          )}

          <ProfileMenuClient session={session} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
