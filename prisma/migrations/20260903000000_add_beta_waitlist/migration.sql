CREATE TABLE "BetaWaitlist" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BetaWaitlist_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BetaWaitlist_email_key" ON "BetaWaitlist"("email");
CREATE INDEX "BetaWaitlist_createdAt_idx" ON "BetaWaitlist"("createdAt");
