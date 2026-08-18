import {
  buildGameEntry,
  calcRateStats,
  roundToBettingLine,
} from "@/lib/playerGraphUtils";

export const PLAYER_GRAPH_STATS = [
  "points",
  "assists",
  "rebounds",
  "blocks",
  "turnovers",
  "steals",
  "fg3m",
  "pra",
  "pa",
  "pr",
  "ra",
];

const PERIOD_OPTIONS = [
  { key: "L5", label: "L5", number: 5 },
  { key: "L10", label: "L10", number: 10 },
  { key: "L20", label: "L20", number: 20 },
  { key: "L30", label: "L30", number: 30 },
  { key: "FULL", label: "Full", number: "Full" },
];

const CONTEXT_OPTIONS = [
  { key: "H2H", label: "H2H", filter: "H2H" },
  { key: "HOME", label: "Home", filter: "HOME" },
  { key: "AWAY", label: "Away", filter: "AWAY" },
  { key: "PLAYOFFS", label: "Playoffs", filter: "PLAYOFFS" },
  { key: "PREV", label: "24/25", filter: "PREV", usesPrevBetLine: true },
];

const emptyCard = (label, extra = {}) => ({
  label,
  rate: null,
  hits: 0,
  misses: 0,
  ...extra,
});

function buildChartYAxisTicks(points, stat) {
  if (!points.length) return [];

  const max = points.reduce((highest, point) => {
    const value = point?.[stat] ?? 0;
    return value > highest ? value : highest;
  }, 0);

  const step = max <= 10 ? 2 : max <= 30 ? 5 : 10;
  const topTick = (Math.ceil(max / step) + 1) * step;
  const ticks = [];

  for (let tick = 0; tick <= topTick; tick += step) {
    ticks.push(tick);
  }

  return ticks;
}

function buildChartPayload(points, stat, betLine) {
  return {
    // Logs arrive newest first; the chart should read naturally from left
    // (oldest) to right (newest).
    points: [...points].reverse(),
    yTicks: buildChartYAxisTicks(points, stat),
    betLine,
  };
}

export function buildPlayerGraphData({
  currentGames = [],
  previousGames = [],
  playoffGames = [],
  player,
  opponentAbbr,
}) {
  const teamAbbr = player?.teamAbbreviation ?? player?.playerTeam;

  return {
    currentGames: Array.isArray(currentGames)
      ? currentGames.map((game) => buildGameEntry(game, teamAbbr))
      : [],
    previousGames: Array.isArray(previousGames)
      ? previousGames.map((game) => buildGameEntry(game, teamAbbr))
      : [],
    playoffGames: Array.isArray(playoffGames)
      ? playoffGames.map((game) => buildGameEntry(game, teamAbbr))
      : [],
    opponentAbbr: opponentAbbr ?? null,
  };
}

export function buildPlayerGraphViews(graphData) {
  const data = graphData?.currentGames ?? [];
  const dataPrev = graphData?.previousGames ?? [];
  const dataPlayoffs = graphData?.playoffGames ?? [];
  const opponentAbbr = graphData?.opponentAbbr;

  return {
    FULL: data,
    L5: data.slice(0, 5),
    L10: data.slice(0, 10),
    L20: data.slice(0, 20),
    L30: data.slice(0, 30),
    H2H: opponentAbbr
      ? data.filter((game) => game.opponent?.includes(opponentAbbr))
      : [],
    HOME: data.filter((game) => game.isHome === true),
    AWAY: data.filter((game) => game.isHome === false),
    PLAYOFFS: dataPlayoffs,
    PREV: dataPrev,
  };
}

export function buildPlayerGraphStatData(
  dataViews,
  stat,
  { includeDefaultViews = true, betLine: suppliedBetLine } = {},
) {
  const baseData = dataViews?.FULL ?? [];
  const avg = baseData.length
    ? baseData.reduce((acc, game) => acc + (game[stat] || 0), 0) /
      baseData.length
    : null;
  const betLine = suppliedBetLine !== undefined
    ? suppliedBetLine
    : avg == null ? null : roundToBettingLine(avg);

  const viewKeys = [
    ...new Set([
      ...PERIOD_OPTIONS.map(({ key }) => key),
      ...CONTEXT_OPTIONS.map(({ key }) => key),
      ...Object.keys(dataViews ?? {}),
    ].filter(
      (key) => includeDefaultViews || Object.hasOwn(dataViews ?? {}, key),
    )),
  ];

  const rateByViewKey = Object.fromEntries(
    viewKeys.map((key) => [
      key,
      betLine == null
        ? { rate: null, hits: 0, misses: 0, avg: null }
        : calcRateStats(dataViews?.[key] ?? [], stat, betLine),
    ]),
  );

  const chartByViewKey = Object.fromEntries(
    viewKeys.map((key) => [
      key,
      buildChartPayload(dataViews?.[key] ?? [], stat, betLine),
    ]),
  );

  const periodOptions = !includeDefaultViews
    ? []
    : betLine == null
      ? PERIOD_OPTIONS.map(({ label, number }) => emptyCard(label, { number }))
      : PERIOD_OPTIONS.map(({ key, label, number }) => ({
          label,
          filter: null,
          number,
          ...rateByViewKey[key],
        }));

  const contextOptions = !includeDefaultViews
    ? []
    : betLine == null
      ? CONTEXT_OPTIONS.map(({ label, filter, usesPrevBetLine }) =>
          emptyCard(label, { filter, usesPrevBetLine }),
        )
      : CONTEXT_OPTIONS.map(({ key, label, filter, usesPrevBetLine }) => ({
          label,
          filter,
          usesPrevBetLine,
          ...rateByViewKey[key],
        }));

  return {
    betLine,
    rateByViewKey,
    chartByViewKey,
    periodOptions,
    contextOptions,
  };
}

export function buildPlayerGraphStatDataMap(dataViews, options) {
  return Object.fromEntries(
    PLAYER_GRAPH_STATS.map((stat) => [
      stat,
      buildPlayerGraphStatData(dataViews, stat, {
        ...options,
        betLine: options?.betLineByStat?.[stat],
      }),
    ]),
  );
}

const getGameId = (game) => String(game?.gid ?? game?.GAME_ID ?? "");
const getMinutes = (game) => Number(game?.min ?? game?.MIN ?? 0);

export function buildFilteredPlayerGraphData({
  targetGames = [],
  targetPreviousGames = [],
  targetPlayoffGames = [],
  teammateGameIdGroups = [],
  teammatePreviousGameIdGroups = [],
  teammateMode = null,
  teammateModes = [],
  minMinutes = null,
  maxMinutes = null,
  betLineByStat,
  player,
  opponentAbbr,
}) {
  const currentGameIdSets = teammateGameIdGroups.map((ids) => new Set(ids));
  const previousGameIdSets = teammatePreviousGameIdGroups.map((ids) => new Set(ids));
  const inMinuteRange = (game) => {
    const minutes = getMinutes(game);
    return (minMinutes == null || minutes >= minMinutes) &&
      (maxMinutes == null || minutes <= maxMinutes);
  };
  const matchesTeammates = (game, sets) => {
    if ((!teammateMode && !teammateModes.length) || !sets.length) return true;
    const gameId = getGameId(game);
    return sets.every((ids, index) => {
      const mode = teammateModes[index] ?? teammateMode;
      return mode === "WITH" ? ids.has(gameId) : !ids.has(gameId);
    });
  };
  const filter = (games, sets) =>
    games.filter((game) => inMinuteRange(game) && matchesTeammates(game, sets));
  const current = filter(targetGames, currentGameIdSets);
  const playoffs = filter(targetPlayoffGames, currentGameIdSets);
  const previous = filter(targetPreviousGames, previousGameIdSets);
  const graphData = buildPlayerGraphData({
    currentGames: [...current, ...playoffs],
    previousGames: previous,
    playoffGames: playoffs,
    player,
    opponentAbbr,
  });

  return {
    statGraphData: buildPlayerGraphStatDataMap(buildPlayerGraphViews(graphData), { betLineByStat }),
    currentGames: current.length + playoffs.length,
  };
}

export function buildTeammateImpactData({
  targetGames = [],
  targetPreviousGames = [],
  targetPlayoffGames = [],
  teammateGameIdGroups = [],
  teammatePreviousGameIdGroups = [],
  player,
  opponentAbbr,
}) {
  const currentTargetGames = [...targetGames, ...targetPlayoffGames];
  const currentGameIdSets = teammateGameIdGroups.map((ids) => new Set(ids));
  const previousGameIdSets = teammatePreviousGameIdGroups.map((ids) => new Set(ids));
  const matchesAvailability = (game, gameIdSets, included) => {
    const gameId = getGameId(game);
    return included
      ? gameIdSets.every((ids) => ids.has(gameId))
      : gameIdSets.every((ids) => !ids.has(gameId));
  };
  const withGames = currentTargetGames.filter((game) =>
    matchesAvailability(game, currentGameIdSets, true),
  );
  const withoutGames = currentTargetGames.filter((game) =>
    matchesAvailability(game, currentGameIdSets, false),
  );
  const filterGames = (games, gameIdSets, included) =>
    games.filter((game) => matchesAvailability(game, gameIdSets, included));
  const buildImpactViews = (included) =>
    buildPlayerGraphViews(buildPlayerGraphData({
      currentGames: included ? withGames : withoutGames,
      previousGames: filterGames(targetPreviousGames, previousGameIdSets, included),
      playoffGames: filterGames(targetPlayoffGames, currentGameIdSets, included),
      player,
      opponentAbbr,
    }));
  const withViews = buildImpactViews(true);
  const withoutViews = buildImpactViews(false);
  const views = {
    FULL: buildPlayerGraphData({ currentGames: currentTargetGames, player }).currentGames,
    ...Object.fromEntries(Object.entries(withViews).map(([key, games]) => [`WITH_${key}`, games])),
    ...Object.fromEntries(Object.entries(withoutViews).map(([key, games]) => [`WITHOUT_${key}`, games])),
  };
  const averageMinutes = (games) => {
    if (!games.length) return null;
    const total = games.reduce((sum, game) => sum + Number(game?.min ?? game?.MIN ?? 0), 0);
    return Math.round((total / games.length) * 10) / 10;
  };

  return {
    statGraphData: buildPlayerGraphStatDataMap(views, { includeDefaultViews: false }),
    withGames: withGames.length,
    withoutGames: withoutGames.length,
    withMinutes: averageMinutes(withGames),
    withoutMinutes: averageMinutes(withoutGames),
  };
}

export function getActiveHitRateOption({
  periodOptions = [],
  contextOptions = [],
  selectedNumber,
  activeFilter,
}) {
  if (activeFilter != null) {
    return (
      contextOptions.find((option) => option.filter === activeFilter) ??
      contextOptions[0] ??
      periodOptions[0] ??
      null
    );
  }

  return (
    periodOptions.find(({ label, number }) =>
      label === "Full" ? selectedNumber === "Full" : selectedNumber === number,
    ) ??
    periodOptions[0] ??
    contextOptions[0] ??
    null
  );
}
