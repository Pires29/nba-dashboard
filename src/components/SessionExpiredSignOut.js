"use client";

import { useEffect } from "react";
import { signOutWithBetaCleanup } from "@/lib/signOutWithBetaCleanup";

export default function SessionExpiredSignOut() {
  useEffect(() => {
    signOutWithBetaCleanup({ callbackUrl: "/login?session=ended" });
  }, []);

  return null;
}
