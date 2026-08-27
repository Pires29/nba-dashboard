"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function SessionExpiredSignOut() {
  useEffect(() => {
    signOut({ callbackUrl: "/login?session=ended" });
  }, []);

  return null;
}
