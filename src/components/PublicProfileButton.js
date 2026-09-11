"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

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

export default function PublicProfileButton({ initialUser = null }) {
  const [user, setUser] = useState(initialUser);

  useEffect(() => {
    if (initialUser?.id) return;

    const controller = new AbortController();

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session", { signal: controller.signal });
        if (!response.ok) return;
        const session = await response.json();
        if (session?.user?.id) setUser(session.user);
      } catch (error) {
        if (error.name !== "AbortError") console.error("Unable to load session", error);
      }
    }

    loadSession();
    return () => controller.abort();
  }, [initialUser]);

  const isSignedIn = Boolean(user?.id);

  return (
    <Link
      href={isSignedIn ? "/settings" : "/login?callbackUrl=%2Fprops"}
      aria-label={isSignedIn ? "Open account settings" : "Sign in"}
      title={isSignedIn ? "Account settings" : "Sign in"}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-orange-500/30 bg-orange-500/20 transition-all duration-150 hover:border-orange-500/50 hover:bg-orange-500/30 md:h-9 md:w-9"
    >
      {user?.image ? (
        <Image
          src={user.image}
          alt=""
          width={36}
          height={36}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <ProfileIcon />
      )}
    </Link>
  );
}
