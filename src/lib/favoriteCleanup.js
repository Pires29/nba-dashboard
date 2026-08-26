export function getFavoriteCleanupCutoff(now = new Date()) {
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
}
