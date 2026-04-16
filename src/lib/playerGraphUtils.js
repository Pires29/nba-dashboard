export const roundToBettingLine = (val) => {
  const floored = Math.floor(val * 2) / 2;
  return floored % 1 === 0 ? floored + 0.5 : floored;
};

const getGameValue = (game, modernKey, legacyKey, fallback = null) => {
  if (game?.[modernKey] != null) return game[modernKey];
  if (game?.[legacyKey] != null) return game[legacyKey];
  return fallback;
};

export const buildGameEntry = (
  game,
  teamAbbr,
  preferSecondOpponent = false,
) => {
  const points = getGameValue(game, "pts", "PTS", 0);
  const assists = getGameValue(game, "ast", "AST", 0);
  const rebounds = getGameValue(game, "reb", "REB", 0);
  const blocks = getGameValue(game, "blk", "BLK", 0);
  const turnovers = getGameValue(game, "tov", "TOV", 0);
  const steals = getGameValue(game, "stl", "STL", 0);
  const minutes = getGameValue(game, "min", "MIN", 0);
  const fg3m = getGameValue(game, "fg3m", "FG3M", 0);
  const date = getGameValue(game, "date", "GAME_DATE");

  const matchup = game?.matchup || game?.MATCHUP || "";
  const hasLegacyMatchup = Boolean(matchup);
  const isHome = game?.isHome ?? (hasLegacyMatchup ? matchup.includes(" vs. ") : null);

  const parts = hasLegacyMatchup
    ? matchup.includes(" @ ")
      ? matchup.split(" @ ")
      : matchup.split(" vs. ")
    : [];

  const opponent = hasLegacyMatchup
    ? preferSecondOpponent
      ? parts[1]?.trim() || parts[0]?.trim()
      : parts[0]?.trim() === teamAbbr
        ? parts[1]?.trim()
        : parts[0]?.trim()
    : getGameValue(game, "opp", "opponent", "");

  return {
    date,
    label: `${opponent || ""}\n${formatDate(date)}`,
    opponent,
    isHome,
    minutes,
    points,
    assists,
    rebounds,
    blocks,
    turnovers,
    steals,
    fg3m,
    pra: points + rebounds + assists,
    pa: points + assists,
    pr: points + rebounds,
    ra: rebounds + assists,
  };
};

export const calcRateStats = (games, selectedStat, betLine) => {
  if (!games?.length) return { rate: null, hits: 0, misses: 0, avg: null };

  let hits = 0;
  let sum = 0;

  for (const game of games) {
    const value = game[selectedStat] ?? 0;
    sum += value;
    if (value >= betLine) hits++;
  }

  const misses = games.length - hits;
  const rate = Math.round((hits / games.length) * 100);
  const avg = Math.round((sum / games.length) * 10) / 10;

  return { rate, hits, misses, avg };
};

export const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
};
