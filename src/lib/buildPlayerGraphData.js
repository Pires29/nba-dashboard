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

export function buildPlayerGraphStatData(dataViews, stat) {
  const baseData = dataViews?.FULL ?? [];
  const avg = baseData.length
    ? baseData.reduce((acc, game) => acc + (game[stat] || 0), 0) /
      baseData.length
    : null;
  const betLine = avg == null ? null : roundToBettingLine(avg);

  const rateByViewKey = Object.fromEntries(
    [...PERIOD_OPTIONS, ...CONTEXT_OPTIONS].map(({ key }) => [
      key,
      betLine == null
        ? { rate: null, hits: 0, misses: 0, avg: null }
        : calcRateStats(dataViews?.[key] ?? [], stat, betLine),
    ]),
  );

  const chartByViewKey = Object.fromEntries(
    [...PERIOD_OPTIONS, ...CONTEXT_OPTIONS].map(({ key }) => [
      key,
      buildChartPayload(dataViews?.[key] ?? [], stat, betLine),
    ]),
  );

  const periodOptions =
    betLine == null
      ? PERIOD_OPTIONS.map(({ label, number }) => emptyCard(label, { number }))
      : PERIOD_OPTIONS.map(({ key, label, number }) => ({
          label,
          filter: null,
          number,
          ...rateByViewKey[key],
        }));

  const contextOptions =
    betLine == null
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

export function buildPlayerGraphStatDataMap(dataViews) {
  return Object.fromEntries(
    PLAYER_GRAPH_STATS.map((stat) => [stat, buildPlayerGraphStatData(dataViews, stat)]),
  );
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
