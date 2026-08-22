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

export const STAT_LABELS = {
  points: "Points",
  assists: "Assists",
  rebounds: "Rebounds",
  blocks: "Blocks",
  steals: "Steals",
  turnovers: "Turnovers",
  fg3m: "FG3M",
  pra: "PRA",
  pa: "PA",
  pr: "PR",
  ra: "RA",
};

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

export const isHitRateFilterActive = (filter) =>
  filter.min !== "" || filter.max !== "";

export const serializeHitRates = (filters) =>
  filters
    .filter(isHitRateFilterActive)
    .map((filter) => {
      const min = filter.min === "0" ? "" : filter.min;
      const max = filter.max === "100" ? "" : filter.max;
      return [filter.period, min, max].join(":").replace(/:+$/, "");
    })
    .join(",");
