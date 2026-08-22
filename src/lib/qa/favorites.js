import "server-only";
import { cookies } from "next/headers";
import { deflateRawSync, inflateRawSync } from "node:zlib";

export const QA_FAVORITES_COOKIE = "nba_qa_favorites";
const MAX_QA_FAVORITES = 50;
const COMPRESSED_PREFIX = "z:";

const isQaFavorite = (favorite) =>
  favorite &&
  typeof favorite.id === "string" &&
  Number.isSafeInteger(favorite.playerId) &&
  typeof favorite.playerName === "string" &&
  typeof favorite.team === "string" &&
  typeof favorite.stat === "string" &&
  Number.isFinite(favorite.avg);

export async function getQaFavorites() {
  const store = await cookies();
  const value = store.get(QA_FAVORITES_COOKIE)?.value;
  if (!value) return [];

  try {
    const raw = value.startsWith(COMPRESSED_PREFIX)
      ? inflateRawSync(Buffer.from(value.slice(COMPRESSED_PREFIX.length), "base64url")).toString("utf8")
      : Buffer.from(value, "base64url").toString("utf8");
    const favorites = JSON.parse(raw);
    return Array.isArray(favorites)
      ? favorites.filter(isQaFavorite).slice(0, MAX_QA_FAVORITES)
      : [];
  } catch {
    return [];
  }
}

export async function setQaFavorites(favorites) {
  const store = await cookies();
  const safeFavorites = favorites.filter(isQaFavorite).slice(0, MAX_QA_FAVORITES);
  const encoded =
    COMPRESSED_PREFIX +
    deflateRawSync(Buffer.from(JSON.stringify(safeFavorites))).toString("base64url");
  store.set(
    QA_FAVORITES_COOKIE,
    encoded,
    {
      httpOnly: true,
      sameSite: "strict",
      secure: false,
      path: "/",
      maxAge: 60 * 60 * 8,
    },
  );
}

export async function clearQaFavorites() {
  const store = await cookies();
  store.delete(QA_FAVORITES_COOKIE);
}
