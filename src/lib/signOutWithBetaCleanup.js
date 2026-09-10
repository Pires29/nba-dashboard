"use client";

import { signOut } from "next-auth/react";

export async function signOutWithBetaCleanup(options) {
  try {
    await fetch("/api/beta/logout", { method: "POST" });
  } finally {
    await signOut(options);
  }
}
