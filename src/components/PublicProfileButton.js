"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOutWithBetaCleanup } from "@/lib/signOutWithBetaCleanup";
import { usePublicSession } from "./home/PublicSessionProvider";

function ProfileIcon() {
  return (
    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="4" r="2.5" stroke="#f97316" strokeWidth="1.2" />
      <path
        d="M1 11c0-2.76 2.24-5 5-5s5 2.24 5 5"
        stroke="#f97316"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function PublicProfileButton() {
  const { user } = usePublicSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false);
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const isSignedIn = Boolean(user?.id);

  const avatar = user?.image ? (
    <Image
      src={user.image}
      alt=""
      width={36}
      height={36}
      className="h-full w-full rounded-full object-cover"
    />
  ) : (
    <ProfileIcon />
  );

  if (!isSignedIn) {
    return (
      <Link
        href="/login?callbackUrl=%2Fprops"
        aria-label="Sign in"
        title="Sign in"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-orange-500/30 bg-orange-500/20 transition-all duration-150 hover:border-orange-500/50 hover:bg-orange-500/30 md:h-9 md:w-9"
      >
        {avatar}
      </Link>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label="Open account menu"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-orange-500/30 bg-orange-500/20 transition-all duration-150 hover:border-orange-500/50 hover:bg-orange-500/30 md:h-9 md:w-9"
      >
        {avatar}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-white/10 bg-[#0F1828] shadow-2xl"
        >
          <div className="border-b border-white/6 px-4 py-3">
            <p className="truncate text-[12px] font-semibold text-slate-200">
              {user.name || "Account"}
            </p>
            {user.email && (
              <p className="mt-0.5 truncate font-mono text-[10px] text-slate-400">
                {user.email}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => signOutWithBetaCleanup({ callbackUrl: "/?signedOut=1" })}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-[12px] text-slate-300 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
