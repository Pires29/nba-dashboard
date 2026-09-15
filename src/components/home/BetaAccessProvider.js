"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { safeInternalPath } from "@/lib/security";
import BetaAccessModal from "./BetaAccessModal";

const BetaAccessContext = createContext({
  openBetaAccess: () => {},
});

export function useBetaAccess() {
  return useContext(BetaAccessContext);
}

export default function BetaAccessProvider({
  children,
  betaAction = null,
  callbackUrl = null,
}) {
  const hasUrlInstruction = betaAction === "required" || betaAction === "redeem";
  const [isOpen, setIsOpen] = useState(hasUrlInstruction);
  const [redirectTo, setRedirectTo] = useState(() =>
    safeInternalPath(callbackUrl, "/props"),
  );
  const [processRedemption, setProcessRedemption] = useState(betaAction === "redeem");

  const openBetaAccess = useCallback((destination = "/props") => {
    setRedirectTo(safeInternalPath(destination, "/props"));
    setProcessRedemption(false);
    setIsOpen(true);
  }, []);

  const closeBetaAccess = useCallback(() => {
    setIsOpen(false);
    setProcessRedemption(false);
  }, []);

  useEffect(() => {
    if (!hasUrlInstruction) return;

    const url = new URL(window.location.href);

    // The provider has consumed this one-time instruction. Keeping it in the
    // address bar would reopen the modal after a refresh or when navigating back.
    url.searchParams.delete("beta");
    url.searchParams.delete("callbackUrl");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [hasUrlInstruction]);

  return (
    <BetaAccessContext.Provider value={{ openBetaAccess }}>
      {children}
      <BetaAccessModal
        isOpen={isOpen}
        onClose={closeBetaAccess}
        processBetaRedemption={processRedemption}
        redirectTo={redirectTo}
      />
    </BetaAccessContext.Provider>
  );
}
