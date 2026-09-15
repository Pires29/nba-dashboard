"use client";

import Link from "next/link";
import BetaAccessModal from "./BetaAccessModal";
import { usePublicSession } from "./PublicSessionProvider";

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
