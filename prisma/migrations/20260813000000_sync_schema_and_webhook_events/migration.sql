-- Bring databases created from the original minimal migration in line with the
-- current Prisma schema. IF NOT EXISTS also makes this safe for environments
-- that were previously maintained with `prisma db push`.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "plan" TEXT NOT NULL DEFAULT 'free';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "hasUsedTrial" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "trialStartedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "planRenewsAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "planInterval" TEXT;

CREATE TABLE IF NOT EXISTS "Favorite" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "playerId" INTEGER NOT NULL,
  "playerName" TEXT NOT NULL,
  "team" TEXT NOT NULL,
  "stat" TEXT NOT NULL,
  "avg" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "gameDate" TIMESTAMP(3),
  CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Favorite_userId_playerId_stat_key"
  ON "Favorite"("userId", "playerId", "stat");

CREATE TABLE IF NOT EXISTS "ReferralCode" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "partnerId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ReferralCode_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ReferralCode_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "ReferralCode_code_key" ON "ReferralCode"("code");
CREATE UNIQUE INDEX IF NOT EXISTS "ReferralCode_partnerId_key" ON "ReferralCode"("partnerId");

CREATE TABLE IF NOT EXISTS "ReferralUse" (
  "id" TEXT NOT NULL,
  "referralCodeId" TEXT NOT NULL,
  "referredUserId" TEXT NOT NULL,
  "discountApplied" BOOLEAN NOT NULL DEFAULT false,
  "amountPaid" INTEGER,
  "stripeSessionId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ReferralUse_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ReferralUse_referralCodeId_fkey" FOREIGN KEY ("referralCodeId") REFERENCES "ReferralCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "ReferralUse_referredUserId_key" ON "ReferralUse"("referredUserId");

CREATE TABLE IF NOT EXISTS "StripeWebhookEvent" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StripeWebhookEvent_pkey" PRIMARY KEY ("id")
);
