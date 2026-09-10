-- Serves the authenticated favorites list without sorting all favorites.
CREATE INDEX IF NOT EXISTS "Favorite_userId_createdAt_idx"
  ON "Favorite"("userId", "createdAt" DESC);
