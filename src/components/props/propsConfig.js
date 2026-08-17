export const STATS = [
  "points",
  "assists",
  "rebounds",
  "blocks",
  "steals",
  "turnovers",
  "fg3m",
  "pra",
  "pa",
  "pr",
  "ra",
];

export const PERIODS = ["L5", "L10", "L20", "full", "h2h"];

export const PERIOD_LABELS = {
  L5: "L5",
  L10: "L10",
  L20: "L20",
  full: "Full",
  h2h: "H2H",
};

export const INITIAL_VISIBLE_ROWS = 50;

export const INJURY_STYLES = {
  Out: "bg-red-500/15 text-red-400 border-red-500/30",
  "Day-To-Day": "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  Doubtful: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Questionable: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
};

export const INJURY_DOT = {
  Out: "bg-red-400",
  "Day-To-Day": "bg-yellow-400",
  Doubtful: "bg-orange-400",
  Questionable: "bg-yellow-400",
};

export function hitRateColor(rate) {
  if (rate == null) return "text-slate-500";
  if (rate >= 70) return "text-emerald-400";
  if (rate >= 50) return "text-yellow-300";
  return "text-red-400";
}

export function roundToBettingLine(value) {
  const floored = Math.floor(value * 2) / 2;
  return floored % 1 === 0 ? floored + 0.5 : floored;
}

export const serializeList = (items) => items.join(",");

export const serializeHitRates = (filters) =>
  filters
    .map((filter) => `${filter.period}:${filter.min}:${filter.max}`)
    .join(",");
