export const roundToBettingLine = (val) => {
  const floored = Math.floor(val * 2) / 2;
  return floored % 1 === 0 ? floored + 0.5 : floored;
};

export const buildGameEntry = (
  game,
  teamAbbr,
  preferSecondOpponent = false,
) => {
  const points = game.PTS;
  const assists = game.AST;
  const rebounds = game.REB;

  const matchup = game.MATCHUP || "";
  const isHome = matchup.includes(" vs. ");

  const parts = matchup.includes(" @ ")
    ? matchup.split(" @ ")
    : matchup.split(" vs. ");

  const opponent = preferSecondOpponent
    ? parts[1]?.trim() || parts[0]?.trim()
    : parts[0]?.trim() === teamAbbr
      ? parts[1]?.trim()
      : parts[0]?.trim();

  return {
    date: game.GAME_DATE,
    label: `${opponent || ""}\n${formatDate(game.GAME_DATE)}`,
    opponent,
    isHome,
    minutes: game.MIN,
    points,
    assists,
    rebounds,
    blocks: game.BLK,
    turnovers: game.TOV,
    steals: game.STL,
    fg3m: game.FG3M,
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
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
};
