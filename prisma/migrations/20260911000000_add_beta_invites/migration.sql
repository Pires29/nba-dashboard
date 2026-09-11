CREATE TABLE "BetaInvite" (
  "id" TEXT NOT NULL,
  "waitlistEmail" TEXT NOT NULL,
  "codeHash" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "usedByUserId" TEXT,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BetaInvite_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "BetaInvite_waitlistEmail_fkey" FOREIGN KEY ("waitlistEmail") REFERENCES "BetaWaitlist"("email") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "BetaInvite_usedByUserId_fkey" FOREIGN KEY ("usedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "BetaInvite_status_check" CHECK ("status" IN ('active', 'used', 'revoked'))
);

CREATE UNIQUE INDEX "BetaInvite_codeHash_key" ON "BetaInvite"("codeHash");
CREATE INDEX "BetaInvite_waitlistEmail_status_idx" ON "BetaInvite"("waitlistEmail", "status");
CREATE INDEX "BetaInvite_usedByUserId_idx" ON "BetaInvite"("usedByUserId");
