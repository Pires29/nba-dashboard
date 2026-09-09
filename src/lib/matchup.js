const stats = {
  points: ["points"], pts: ["points"], rebounds: ["rebounds"], reb: ["rebounds"],
  assists: ["assists"], ast: ["assists"], fg3m: ["threes"], threes: ["threes"],
  steals: ["steals"], blocks: ["blocks"], turnovers: ["turnovers"], tov: ["turnovers"],
  pra: ["points", "rebounds", "assists"], pa: ["points", "assists"],
  pr: ["points", "rebounds"], ra: ["rebounds", "assists"],
};
const finite = (value) => typeof value === "number" && Number.isFinite(value);

export function getPositionMatchup(analytics, playerId, position, opponentId) {
  const resolvedPosition = analytics?.players?.[String(playerId)]?.position ?? position;
  return {
    position: resolvedPosition,
    matchup: analytics?.opponentVsPosition?.[resolvedPosition]?.teams?.[String(opponentId)] ?? null,
  };
}

export function classifyMatchup(stat, matchup) {
  const keys = stats[stat];
  const unavailable = { label: "—", color: "text-slate-500", difference: null, rank: null, statLabel: stat };
  if (!keys || !keys.every((key) => finite(matchup?.[key]) && finite(matchup?.leagueAverage?.[key]) && matchup.leagueAverage[key] > 0)) return unavailable;
  const value = keys.reduce((sum, key) => sum + matchup[key], 0);
  const average = keys.reduce((sum, key) => sum + matchup.leagueAverage[key], 0);
  const difference = Math.round((value / average - 1) * 1000) / 10;
  const neutral = Math.abs(difference) <= 1;
  return {
    difference,
    rank: keys.length === 1 && finite(matchup[`${keys[0]}Rank`]) ? matchup[`${keys[0]}Rank`] : null,
    statLabel: keys.join(" + "),
    label: neutral ? "Neutral" : difference > 0 ? "Favorable" : "Unfavorable",
    color: neutral ? "text-yellow-400" : difference > 0 ? "text-emerald-400" : "text-red-400",
  };
}
