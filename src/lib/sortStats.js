export function sortStats({ playerInfoV2, stat, order }) {
  const mult = order === "DESC" ? -1 : 1;

  const sortPlayers = [...playerInfoV2].sort((a, b) => {
    const aPoints = Number(a.stats[stat]) || 0;
    const bPoints = Number(b.stats[stat]) || 0;
    return (aPoints - bPoints) * mult;
  });

  return sortPlayers;
}
