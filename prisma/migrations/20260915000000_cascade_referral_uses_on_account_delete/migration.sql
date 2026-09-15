-- An account owner can have a referral code with redeemed uses. Those uses
-- must not prevent the account and its associated personal data from being
-- removed.
ALTER TABLE "ReferralUse"
  DROP CONSTRAINT IF EXISTS "ReferralUse_referralCodeId_fkey";

ALTER TABLE "ReferralUse"
  ADD CONSTRAINT "ReferralUse_referralCodeId_fkey"
  FOREIGN KEY ("referralCodeId") REFERENCES "ReferralCode"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
