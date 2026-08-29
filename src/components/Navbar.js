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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.4)] sm:h-7 sm:w-7">
            <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6.5 15.5v2.2" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M11.2 12.5v5.2" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M15.9 9.2v8.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
              <path
                d="M6.2 12.6 9.8 9.4l3 2.3 5-5.2"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="17.8" cy="6.5" r="1.45" fill="white" />
            </svg>
          </div>
          <span className="hidden font-mono text-sm font-black uppercase tracking-widest text-white transition-colors group-hover:text-orange-400 sm:block">
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
