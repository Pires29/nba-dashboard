"use client";

import Link from "next/link";
import { usePublicSession } from "./PublicSessionProvider";
import { useBetaAccess } from "./BetaAccessProvider";

export default function PublicAccessButton({
  className,
  requiresBetaCode = false,
  children,
}) {
  const { user } = usePublicSession();
  const { openBetaAccess } = useBetaAccess();
  const hasBetaAccess = Boolean(user?.betaAccessGrantedAt);

  if (!requiresBetaCode || hasBetaAccess) {
    return (
      <Link href="/props" aria-label="Open props table" className={className}>
        {requiresBetaCode ? "Open Props" : children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label="Open beta access"
      className={className}
      onClick={() => openBetaAccess()}
    >
      {children}
    </button>
  );
}
