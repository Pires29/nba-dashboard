"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePublicSession } from "./PublicSessionProvider";

const BetaAccessModal = dynamic(() => import("./BetaAccessModal"), {
  ssr: false,
});

export default function PublicAccessButton({
  className,
  requiresBetaCode = false,
  children,
  processBetaRedemption = false,
}) {
  const { user } = usePublicSession();
  const hasBetaAccess = Boolean(user?.betaAccessGrantedAt);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!processBetaRedemption) return;
    const betaState = new URLSearchParams(window.location.search).get("beta");
    if (betaState !== "required" && betaState !== "redeem") return;

    const frame = window.requestAnimationFrame(() => setShowModal(true));
    return () => window.cancelAnimationFrame(frame);
  }, [processBetaRedemption]);

  if (!requiresBetaCode || hasBetaAccess) {
    return (
      <Link href="/props" aria-label="Open props table" className={className}>
        {requiresBetaCode ? "Open Props" : children}
      </Link>
    );
  }

  if (showModal) {
    return (
      <BetaAccessModal
        aria-label="Open beta access"
        className={className}
        initiallyOpen
        processBetaRedemption={processBetaRedemption}
      >
        {children}
      </BetaAccessModal>
    );
  }

  return (
    <button type="button" aria-label="Open beta access" className={className} onClick={() => setShowModal(true)}>
      {children}
    </button>
  );
}
