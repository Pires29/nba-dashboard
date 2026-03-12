"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";

const ProfileMenuClient = ({ session }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#0D1828] border border-white/10 hover:border-white/20 transition-all duration-150 group"
      >
        {/* Avatar */}
        <div className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt=""
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle
                cx="6"
                cy="4"
                r="2.5"
                stroke="#f97316"
                strokeWidth="1.2"
              />
              <path
                d="M1 11c0-2.76 2.24-5 5-5s5 2.24 5 5"
                stroke="#f97316"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>

        {session?.user?.name && (
          <span className="text-[11px] font-mono text-slate-400 group-hover:text-slate-300 transition-colors max-w-[100px] truncate">
            {session.user.name.split(" ")[0]}
          </span>
        )}

        {/* Chevron */}
        <svg
          className={`w-3 h-3 text-slate-600 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-52 z-50
          bg-[#0F1828] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
        >
          {/* User info */}
          {session && (
            <>
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <p className="text-[12px] font-semibold text-slate-200 truncate">
                  {session.user.name}
                </p>
                <p className="text-[10px] font-mono text-slate-600 truncate mt-0.5">
                  {session.user.email}
                </p>
              </div>
            </>
          )}

          {/* Menu items */}
          <div className="py-1">
            {/* Manage Plan — novo */}
            <Link
              href="/pricing"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-orange-500/10 transition-colors group"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="text-slate-600 group-hover:text-orange-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <div className="flex items-center justify-between flex-1">
                <span className="text-[12px] text-slate-400 group-hover:text-orange-400 transition-colors">
                  {session ? "Manage Plan" : "View Plans"}
                </span>
                {(!session?.user?.plan || session?.user?.plan === "free") && (
                  <span className="px-1.5 py-0.5 rounded bg-orange-500/15 text-[8px] font-mono font-bold text-orange-400 uppercase tracking-wider">
                    Free
                  </span>
                )}
              </div>
            </Link>

            {/* Settings — igual ao que já tens */}
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors group"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="text-slate-600 group-hover:text-slate-400"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
              <span className="text-[12px] text-slate-400 group-hover:text-slate-200 transition-colors">
                Settings
              </span>
            </Link>

            <div className="h-px bg-white/[0.04] mx-3 my-1" />

            {session ? (
              <button
                onClick={() => {
                  setOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 transition-colors group"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="text-slate-600 group-hover:text-red-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="text-[12px] text-slate-400 group-hover:text-red-400 transition-colors">
                  Sign out
                </span>
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-orange-500/10 transition-colors group"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="text-slate-600 group-hover:text-orange-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                <span className="text-[12px] text-slate-400 group-hover:text-orange-400 transition-colors">
                  Sign in
                </span>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenuClient;
