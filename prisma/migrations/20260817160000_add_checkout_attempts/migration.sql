CREATE TABLE "CheckoutAttempt" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "stripeSessionId" TEXT,
  "billing" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CheckoutAttempt_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CheckoutAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "CheckoutAttempt_userId_key" ON "CheckoutAttempt"("userId");
CREATE UNIQUE INDEX "CheckoutAttempt_stripeSessionId_key" ON "CheckoutAttempt"("stripeSessionId");
CREATE INDEX "CheckoutAttempt_expiresAt_idx" ON "CheckoutAttempt"("expiresAt");
