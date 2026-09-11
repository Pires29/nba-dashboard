import Image from "next/image";
import Link from "next/link";
import { launchConfig } from "@/config/launch";
import PricingLink from "@/components/PricingLink";
import BetaAccessModal from "./home/BetaAccessModal";
import PublicProfileButton from "./PublicProfileButton";

function AccessButton({ className, hasBetaAccess, initiallyRedeeming }) {
  if (launchConfig.access.showBetaAccess && !hasBetaAccess) {
    return (
      <BetaAccessModal
        aria-label="Open beta access"
        className={className}
        processBetaRedemption
        initiallyRedeeming={initiallyRedeeming}
      >
        {launchConfig.cta.navPrimary}
      </BetaAccessModal>
    );
  }

  return (
    <Link href="/props" aria-label="Open props table" className={className}>
      Open Props
    </Link>
  );
}

export default function PublicNavbar({
  hasBetaAccess = false,
  profileUser = null,
  initiallyRedeeming = false,
}) {
  return (
    <nav className="relative sticky top-0 z-50 border-b border-white/6 bg-gradient-to-b from-[#122040] to-[#0D1828]">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 via-amber-400 to-transparent" />

      <div className="max-w-[1400px] mx-auto px-6 py-3 md:py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" aria-label="PropInsight home" className="flex items-center gap-2.5 group">
          <Image
            src="/icon.svg"
            alt=""
            width={36}
            height={36}
            aria-hidden="true"
            className="h-8 w-8 rounded-lg shadow-[0_0_12px_rgba(249,115,22,0.4)] md:h-9 md:w-9"
          />
          <span className="hidden font-mono text-sm font-black uppercase tracking-widest text-white transition-colors group-hover:text-orange-400 sm:block md:text-[15px]">
            PROPINSIGHT
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <PricingLink
            aria-label="Upgrade: view pricing plans"
            className={`${launchConfig.isBeta ? "hidden sm:inline-flex" : "inline-flex"} min-h-8 items-center justify-center gap-1.5 rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 transition-all duration-150 hover:border-orange-500/50 hover:bg-orange-500/20 md:min-h-9 md:px-4 md:py-2 group`}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f97316"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="font-mono text-[10px] font-bold uppercase leading-none tracking-widest text-orange-400 transition-colors group-hover:text-orange-300 md:text-[11px]">
              Upgrade
            </span>
          </PricingLink>
          <AccessButton hasBetaAccess={hasBetaAccess} initiallyRedeeming={initiallyRedeeming} className={`${launchConfig.isBeta ? "hidden sm:inline-flex" : "inline-flex"} min-h-8 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0D1828] px-3 py-1.5 font-mono text-[10px] font-bold uppercase leading-none tracking-widest text-slate-300 transition-all duration-150 hover:border-white/20 hover:text-white md:min-h-9 md:px-4 md:py-2 md:text-[11px]`} />
          <PublicProfileButton initialUser={profileUser} />
        </div>
      </div>
    </nav>
  );
}
