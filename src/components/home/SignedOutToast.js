"use client";

import { useEffect } from "react";

export default function SignedOutToast() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("signedOut") !== "1") return;

    import("sonner").then(({ toast }) => toast("Signed out", {
      id: "signed-out",
      description: "You have been logged out successfully.",
    }));
    window.history.replaceState(null, "", "/");
  }, []);

  return null;
}
