import { classifyMatchup } from "@/lib/matchup";
import Card from "@/components/ui/playerStats/Card";
import SectionLabel from "@/components/ui/playerStats/SectionLabel";

const number = (value) => value != null && Number.isFinite(Number(value)) ? Number(value) : null;
const format = (value, suffix = "") => number(value) == null ? "—" : `${Number(value).toFixed(1)}${suffix}`;
const delta = (value, average) => number(value) != null && number(average) > 0 ? (Number(value) / Number(average) - 1) * 100 : null;
const signed = (value) => `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
const tone = (value) => value == null || Math.abs(value) <= 1 ? "text-slate-300" : value > 0 ? "text-emerald-300" : "text-rose-300";
const labels = { points: "Points", rebounds: "Rebounds", assists: "Assists", threes: "Threes", blocks: "Blocks", steals: "Steals", turnovers: "Turnovers" };
const positions = { F: "forwards", G: "guards", C: "centers", "F-C": "forward-centers", "G-F": "guard-forwards" };

const Metric = ({ label, value, children }) => (
  <div className="rounded-xl border border-white/[0.06] bg-[#060E1A]/60 p-3 sm:p-4">
    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">{label}</span>
    <span className="mt-1 block text-2xl font-black tabular-nums text-white">{value}</span>
    <div className="mt-1 text-xs leading-relaxed text-slate-400">{children}</div>
  </div>
);

const MatchupContext = ({ context, playerTrends, stat: selectedStat = "points" }) => {
  const stat = ({ pts: "points", reb: "rebounds", ast: "assists", fg3m: "threes" })[selectedStat] ?? selectedStat;
  const matchup = context?.opponentVsPosition;
  const pace = number(context?.paceDifference);
  const rows = Object.entries(labels).map(([key, label]) => ({
    key, label, value: matchup?.[key], rank: number(matchup?.[`${key}Rank`]),
    difference: delta(matchup?.[key], matchup?.leagueAverage?.[key]),
  }));
  const assessment = classifyMatchup(stat, matchup);
  const selected = { label: assessment.statLabel };
  // Describe the selected statistic, without combining unrelated metrics into a score.
  const difference = assessment.difference;
  const title = difference == null ? "Matchup overview" : `${assessment.label} matchup`;
  const position = positions[context?.position] ?? context?.position ?? "this position";
  const averageMinutes = playerTrends?.stats?.minutes?.last10 ?? null;
  const minutesGames = playerTrends?.stats?.minutes?.sampleGames ?? 0;
  const insights = rows.filter((row) => row.difference != null).sort((a, b) => (b.key === stat) - (a.key === stat) || Math.abs(b.difference) - Math.abs(a.difference)).slice(0, 2);
  const hasData = context?.usageRate != null || context?.matchupPace != null || matchup || minutesGames;

  return (
    <Card accent="blue">
      <div className="p-4 sm:p-5">
        <SectionLabel>Matchup Insights</SectionLabel>
        {!hasData ? <p className="py-4 text-center text-xs text-slate-400">Advanced matchup data unavailable.</p> : (
          <div className="space-y-5">
            <div className={`rounded-xl border p-4 ${difference == null || Math.abs(difference) <= 1 ? "border-amber-400/20 bg-amber-400/5" : difference > 0 ? "border-emerald-400/20 bg-emerald-400/5" : "border-rose-400/20 bg-rose-400/5"}`}>
              <p className={`text-lg font-bold ${tone(difference)}`}>{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-200">
                {difference != null ? `Opponent allows ${format(Math.abs(difference), "%")} ${difference >= 0 ? "more" : "fewer"} ${selected.label.toLowerCase()} to ${position} than the league average.` : "Compare opponent allowances and game tempo below."}
                {pace != null && ` Pace is ${format(Math.abs(pace), "%")} ${pace >= 0 ? "above" : "below"} the league average.`}
              </p>
              {difference != null && <p className="mt-2 text-xs text-slate-400">Based on {selected.label.toLowerCase()} allowed vs. league · within ±1% is neutral</p>}
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Metric label="Usage" value={format(context?.usageRate, "%")}>Season usage rate</Metric>
              <Metric label="Matchup pace" value={format(context?.matchupPace)}>
                <span className={tone(pace)}>{pace == null ? "League comparison unavailable" : `${signed(pace)} vs. league`}</span>
                <span className="mt-1 block text-[11px]">Team {format(context?.teamPace)} · Opp. {format(context?.opponentPace)}</span>
              </Metric>
              <Metric label="Minutes" value={format(averageMinutes)}>{minutesGames ? `Last ${minutesGames} games average` : "Recent minutes unavailable"}</Metric>
            </div>

            {matchup && (
              <div>
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-1">
                  <h3 className="text-sm font-bold capitalize text-white">Opponent vs. {position}</h3>
                  <span className="text-xs text-slate-400">Higher allowance favors player production</span>
                </div>
                <div className="overflow-hidden rounded-xl border border-white/10">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-white/[0.04] text-[10px] uppercase tracking-wider text-slate-400"><tr><th className="p-3 font-medium">Allowed</th><th className="p-3 text-right font-medium">Avg</th><th className="p-3 text-right font-medium">NBA rank</th><th className="p-3 text-right font-medium">vs. league</th></tr></thead>
                    <tbody>{rows.map((row) => (
                      <tr key={row.key} className={`border-t border-white/[0.06] ${row.key === stat ? "bg-white/[0.05]" : ""}`}>
                        <th scope="row" className="p-3 font-medium text-slate-200">{row.label}</th>
                        <td className="p-3 text-right tabular-nums text-slate-300">{format(row.value)}</td>
                        <td className="p-3 text-right tabular-nums text-slate-400">{row.rank == null ? "—" : `#${row.rank}`}</td>
                        <td className={`p-3 text-right font-bold tabular-nums ${tone(row.difference)}`}>{row.difference == null ? "—" : signed(row.difference)}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            )}

            {(pace != null || insights.length > 0) && <div className="grid gap-2 sm:grid-cols-3">
              {pace != null && <Insight value={pace} title={Math.abs(pace) < 1 ? "Average pace" : pace > 0 ? "Fast pace" : "Slow pace"}>{format(Math.abs(pace), "%")} {pace >= 0 ? "above" : "below"} league tempo.</Insight>}
              {insights.map((row) => <Insight key={row.key} value={row.difference} title={`${row.label} matchup`}>Opponent allows {format(Math.abs(row.difference), "%")} {row.difference >= 0 ? "more" : "fewer"} to {position}.</Insight>)}
            </div>}
          </div>
        )}
      </div>
    </Card>
  );
};

const Insight = ({ value, title, children }) => (
  <div className="flex gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
    <span aria-hidden="true" className={`text-lg ${tone(value)}`}>{Math.abs(value) <= 1 ? "≈" : value > 0 ? "↗" : "↘"}</span>
    <div><p className={`text-sm font-semibold ${tone(value)}`}>{title}</p><p className="mt-1 text-xs leading-relaxed text-slate-300">{children}</p></div>
  </div>
);

export default MatchupContext;
