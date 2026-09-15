"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
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

  if (!requiresBetaCode || hasBetaAccess) {
    return (
      <Link href="/props" aria-label="Open props table" className={className}>
        {requiresBetaCode ? "Open Props" : children}
      </Link>
    );
  }

  return (
    <BetaAccessModal
      aria-label="Open beta access"
      className={className}
      processBetaRedemption={processBetaRedemption}
    >
      {children}
    </BetaAccessModal>
  );
}
