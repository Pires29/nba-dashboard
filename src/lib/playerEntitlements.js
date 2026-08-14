export const FREE_PLAYER_LIMIT = 15;

export function hasFullPlayerAccess(plan) {
  return plan === "pro" || plan === "trial";
}

function seededShuffle(array, seed) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(index);
    hash |= 0;
  }

  let state = Math.abs(hash);
  const random = () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };

  const result = [...array];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

const getPlayerId = (player) => Number(player?.PLAYER_ID);

export function selectFreePlayerIds({
  rosters = [],
  props = [],
  injuries = [],
  seed,
  limit = FREE_PLAYER_LIMIT,
}) {
  const injuredNames = new Set(
    injuries.flatMap(
      (team) =>
        team?.injuries?.map((injury) => injury?.athlete?.displayName) ?? [],
    ),
  );
  const rosterById = new Map(
    rosters
      .filter((player) => Number.isSafeInteger(getPlayerId(player)))
      .map((player) => [getPlayerId(player), player]),
  );

  const rankedPropIds = props
    .filter((player) => {
      const average = player.props?.points?.avg ?? 0;
      const hitRate = player.props?.points?.L10?.hit_rate ?? 0;
      return average >= 10 && hitRate >= 60;
    })
    .sort((first, second) => {
      const hitRateDifference =
        (second.props?.points?.L10?.hit_rate ?? 0) -
        (first.props?.points?.L10?.hit_rate ?? 0);
      return (
        hitRateDifference ||
        (second.props?.points?.avg ?? 0) - (first.props?.points?.avg ?? 0)
      );
    })
    .slice(0, 60)
    .map((player) => Number(player.player_id))
    .filter((playerId) => {
      const rosterPlayer = rosterById.get(playerId);
      return rosterPlayer && !injuredNames.has(rosterPlayer.PLAYER);
    });

  const rankedSet = new Set(rankedPropIds);
  const healthyFallbackIds = rosters
    .filter(
      (player) =>
        !rankedSet.has(getPlayerId(player)) &&
        !injuredNames.has(player.PLAYER),
    )
    .map(getPlayerId);
  const injuredFallbackIds = rosters
    .filter((player) => injuredNames.has(player.PLAYER))
    .map(getPlayerId);

  const selected = [
    ...seededShuffle(rankedPropIds, `${seed}:ranked`),
    ...seededShuffle(healthyFallbackIds, `${seed}:healthy`),
    ...seededShuffle(injuredFallbackIds, `${seed}:injured`),
  ].slice(0, limit);

  return new Set(selected);
}
