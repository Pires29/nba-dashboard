ALTER TABLE "BetaWaitlist"
  ADD COLUMN "status" TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN "approvedAt" TIMESTAMP(3),
  ADD COLUMN "rejectedAt" TIMESTAMP(3),
  ADD COLUMN "notes" TEXT;

CREATE INDEX "BetaWaitlist_status_createdAt_idx"
  ON "BetaWaitlist"("status", "createdAt");

ALTER TABLE "BetaWaitlist"
  ADD CONSTRAINT "BetaWaitlist_status_check"
  CHECK ("status" IN ('pending', 'approved', 'rejected'));

CREATE TABLE "BetaCampaign" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "endsAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BetaCampaign_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BetaCampaign_slug_key" ON "BetaCampaign"("slug");

CREATE TABLE "AccessGrant" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "campaignId" TEXT NOT NULL,
  "access" TEXT NOT NULL DEFAULT 'pro_access',
  "status" TEXT NOT NULL DEFAULT 'active',
  "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "notes" TEXT,
  CONSTRAINT "AccessGrant_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AccessGrant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "AccessGrant_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "BetaCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "AccessGrant_userId_campaignId_access_key"
  ON "AccessGrant"("userId", "campaignId", "access");
CREATE INDEX "AccessGrant_userId_status_idx" ON "AccessGrant"("userId", "status");
CREATE INDEX "AccessGrant_campaignId_status_idx" ON "AccessGrant"("campaignId", "status");

ALTER TABLE "AccessGrant"
  ADD CONSTRAINT "AccessGrant_access_check"
  CHECK ("access" = 'pro_access'),
  ADD CONSTRAINT "AccessGrant_status_check"
  CHECK ("status" IN ('active', 'revoked'));

INSERT INTO "BetaCampaign" ("id", "slug", "name")
VALUES ('beta_campaign_closed_2026', 'closed-beta-2026', 'Closed Beta 2026');
