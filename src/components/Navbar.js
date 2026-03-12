import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import Link from "next/link";

const Navbar = async () => {
  const session = await getServerSession(authOptions);
  const isFreePlan = !session?.user?.plan || session?.user?.plan === "free";

  return (
    <nav className="relative border-b border-white/[0.06] bg-gradient-to-b from-[#122040] to-[#0D1828]">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 via-amber-400 to-transparent" />

      <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center shadow-[0_0_12px_rgba(249,115,22,0.4)]">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="white" strokeWidth="1.5" />
              <path
                d="M1 7h12M7 1c-2 2-2 8 0 12M7 1c2 2 2 8 0 12"
                stroke="white"
                strokeWidth="1.2"
              />
            </svg>
          </div>
          <span className="font-mono font-black text-sm tracking-widest text-white uppercase group-hover:text-orange-400 transition-colors">
            HOOPIQ
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Upgrade button — só no plano free */}
          {isFreePlan && (
            <Link
              href="/pricing"
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
            </Link>
          )}

          <ProfileMenuClient session={session} />
        </div>
      </div>
    </nav>
  );
};

// Client component for the dropdown
import ProfileMenuClient from "./ProfileMenuClient";

const ProfileMenu = ({ session }) => {
  return <ProfileMenuClient session={session} />;
};

export default Navbar;
