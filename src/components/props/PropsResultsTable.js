import Link from "next/link";
import PropsFavoriteButton from "./PropsFavoriteButton";
import { PropsFavoritesProvider } from "./PropsFavoritesProvider";
import PropsPlayerHeadshot from "./PropsPlayerHeadshot";
import {
  INITIAL_VISIBLE_ROWS,
  INJURY_STYLES,
  PERIOD_LABELS,
  PERIODS,
  STAT_LABELS,
  hitRateColor,
  roundToBettingLine,
} from "./propsConfig";

function playerHref(player, selectedStat) {
  const game = player.game;
  const team1Id = game ? game.home_team_id : player.team_id;
  const team2Id = game ? game.visitor_team_id : player.opponent_id;
  return `/playersStats?team1Id=${team1Id}&team2Id=${team2Id}&playerId=${player.player_id}&stat=${selectedStat}`;
}

function sortHref(basePath, searchParams, period, sortPeriod, sortDirection) {
  const params = new URLSearchParams(searchParams ?? "");
  const nextDirection = period === sortPeriod && sortDirection === "desc" ? "asc" : "desc";
  if (period === "L5") params.delete("sort");
  else params.set("sort", period);
  if (nextDirection === "desc") params.delete("dir");
  else params.set("dir", nextDirection);
  params.delete("rows");
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

function loadMoreHref(basePath, searchParams, nextRows) {
  const params = new URLSearchParams(searchParams ?? "");
  params.set("rows", String(nextRows));
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

function ResultsHeader({ basePath, searchParams, sortDirection, sortPeriod }) {
  return (
    <thead className="sticky top-0 z-10 bg-[#0D1828]">
      <tr className="border-b border-white/[0.08]">
        <th scope="col" className="sticky left-0 z-20 w-[205px] min-w-[205px] max-w-[205px] bg-[#0D1828] px-2 py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-300 md:w-[280px] md:min-w-[280px] md:max-w-[280px] md:px-4">Player</th>
        <th scope="col" className="px-4 py-3 text-right text-[10px] font-mono font-bold uppercase tracking-widest text-slate-300">Line</th>
        <th scope="col" className="px-4 py-3 text-right text-[10px] font-mono font-bold uppercase tracking-widest text-slate-300">Matchup</th>
        {PERIODS.map((period) => (
          <th key={period} scope="col" aria-sort={sortPeriod === period ? (sortDirection === "asc" ? "ascending" : "descending") : "none"} className="px-2 py-1 text-right last:pr-6 last:[&>a]:pr-0">
            <Link
              href={sortHref(basePath, searchParams, period, sortPeriod, sortDirection)}
              scroll={false}
              className={`inline-block rounded px-2 py-2 text-[10px] font-mono font-bold uppercase tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/40 ${sortPeriod === period ? "text-orange-400" : "text-slate-300 hover:text-white"}`}
            >
              {PERIOD_LABELS[period]}
              {sortPeriod === period && (
                <span className="ml-1 inline-block text-[15px] font-black leading-none" aria-hidden="true">
                  {sortDirection === "asc" ? "↑" : "↓"}
                </span>
              )}
            </Link>
          </th>
        ))}
      </tr>
    </thead>
  );
}

function PeriodMetric({ label, hitRate, games }) {
  return (
    <div className="min-w-0 rounded-md border border-white/[0.07] bg-white/[0.035] px-2 py-1.5 text-center">
      <span className="block text-[8px] font-mono font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <span className={`mt-0.5 block text-[12px] font-mono font-black leading-tight ${hitRateColor(hitRate)}`}>
        {hitRate != null ? `${hitRate}%` : "N/A"}
      </span>
      <span className="block min-h-3 text-[8px] font-mono leading-tight text-slate-500">
        {games != null && games > 0 ? `${games}g` : ""}
      </span>
    </div>
  );
}

function MobilePropRow({ index, injuryStatus, player, prop, selectedStat }) {
  const line = prop?.avg != null ? roundToBettingLine(prop.avg).toFixed(1) : "—";
  const href = playerHref(player, selectedStat);

  return (
    <article className="border-b border-white/[0.07] px-3 py-3 last:border-b-0">
      <div className="flex items-start gap-2.5">
        <Link href={href} prefetch={false} className="flex min-w-0 flex-1 cursor-pointer items-start gap-2.5 rounded-md text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50" aria-label={`Open ${player.player_name} ${selectedStat} details`}>
          <span className="mt-0.5 h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg border border-white/[0.08] bg-[#0D1828]">
            <PropsPlayerHeadshot playerId={player.player_id} width={40} height={30} alt="" priority={index === 0} className="h-full w-full object-cover" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex min-w-0 items-center gap-1.5">
              <span className="truncate text-[13px] font-semibold leading-tight text-slate-100">{player.player_name}</span>
              {player.position && <span className="shrink-0 rounded border border-white/[0.08] px-1 text-[8px] font-mono text-slate-400">{player.position}</span>}
              {injuryStatus && <span className={`shrink-0 rounded border px-1 py-0.5 text-[8px] font-mono font-bold uppercase tracking-wider ${INJURY_STYLES[injuryStatus] || "border-slate-500/30 bg-slate-500/15 text-slate-300"}`}>{injuryStatus === "Day-To-Day" ? "DTD" : injuryStatus}</span>}
            </span>
            <span className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] font-mono">
              <span className="font-bold text-orange-400">{player.team}</span>
              <span className="text-slate-500">vs</span>
              <span className="text-slate-400">{player.opponent}</span>
              <span className="text-slate-600">·</span>
              <span className="font-bold text-slate-200">{STAT_LABELS?.[selectedStat] ?? selectedStat}</span>
            </span>
          </span>
        </Link>
        <div className="flex shrink-0 items-start gap-1.5">
          <div className="text-right">
            <span className="block text-[8px] font-mono font-bold uppercase tracking-wider text-slate-500">Line</span>
            <span className="block text-[14px] font-mono font-black leading-tight text-white">{line}</span>
          </div>
          <PropsFavoriteButton player={player} selectedStat={selectedStat} avg={prop?.avg != null ? roundToBettingLine(prop.avg) : null} />
        </div>
      </div>

      <Link href={href} prefetch={false} aria-label={`Open ${player.player_name} details`} className="mt-2 grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50">
        <span>
          <span className={`block text-[11px] font-mono font-bold ${player.matchupLabel.color}`}>{player.matchupLabel.label}</span>
          {player.matchupRank != null && <span className="block text-[9px] font-mono text-slate-500">#{player.matchupRank} allowed</span>}
        </span>
        <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.08] text-slate-400">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
      </Link>

      <div className="mt-2 grid grid-cols-5 gap-1.5">
        {PERIODS.map((period) => <PeriodMetric key={period} label={PERIOD_LABELS[period]} hitRate={prop?.[period]?.hit_rate} games={prop?.[period]?.games} />)}
      </div>
    </article>
  );
}

function DesktopPropRow({ index, injuryStatus, player, prop, selectedStat }) {
  const href = playerHref(player, selectedStat);

  return (
    <tr className="group border-b border-white/[0.05] transition-colors hover:bg-white/[0.04]">
      <td className="sticky left-0 z-[1] w-[205px] min-w-[205px] max-w-[205px] bg-[#091423] px-2 py-3 group-hover:bg-[#0d1928] md:w-[280px] md:min-w-[280px] md:max-w-[280px] md:px-4">
        <div className="flex items-center gap-2 md:gap-3">
          <Link href={href} prefetch={false} className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 md:gap-3" aria-label={`Open ${player.player_name} ${selectedStat} details`}>
            <span className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg border border-white/[0.08] bg-[#0D1828] md:h-9 md:w-9">
              <PropsPlayerHeadshot playerId={player.player_id} width={40} height={30} alt="" priority={index === 0} className="h-full w-full object-cover" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="truncate text-[13px] font-semibold text-slate-100">{player.player_name}</span>
                {player.position && <span className="rounded border border-white/[0.08] px-1 text-[9px] font-mono text-slate-400">{player.position}</span>}
                {injuryStatus && <span className={`rounded border px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest ${INJURY_STYLES[injuryStatus] || "border-slate-500/30 bg-slate-500/15 text-slate-300"}`}>{injuryStatus === "Day-To-Day" ? "DTD" : injuryStatus}</span>}
              </span>
              <span className="mt-0.5 flex items-center gap-1.5 text-[10px] font-mono">
                <span className="font-bold text-orange-400">{player.team}</span>
                <span className="text-slate-500">vs</span>
                <span className="text-slate-400">{player.opponent}</span>
              </span>
            </span>
          </Link>
          <PropsFavoriteButton player={player} selectedStat={selectedStat} avg={prop?.avg != null ? roundToBettingLine(prop.avg) : null} />
        </div>
      </td>
      <td className="px-4 py-3 text-right text-[13px] font-black font-mono text-white">{prop?.avg != null ? roundToBettingLine(prop.avg).toFixed(1) : "—"}</td>
      <td className="px-4 py-3 text-right">
        <span className={`block text-[11px] font-mono font-bold ${player.matchupLabel.color}`}>{player.matchupLabel.label}</span>
        {player.matchupRank != null && <span className="block text-[9px] font-mono text-slate-400">#{player.matchupRank} allowed</span>}
      </td>
      {PERIODS.map((period) => {
        const hitRate = prop?.[period]?.hit_rate;
        const games = prop?.[period]?.games;
        return <td key={period} className="px-4 py-3 text-right last:pr-6"><span className={`block text-[13px] font-black font-mono ${hitRateColor(hitRate)}`}>{hitRate != null ? `${hitRate}%` : "N/A"}</span>{games != null && games > 0 && <span className="block text-[9px] font-mono text-slate-400">{games}g</span>}</td>;
      })}
    </tr>
  );
}

export default function PropsResultsTable({
  basePath = "/props",
  enrichedProps,
  injuryMap,
  searchParams,
  selectedStat,
  sortDirection,
  sortPeriod,
  totalResults,
  totalPropsCount,
  visibleRows = enrichedProps.length,
}) {
  if (enrichedProps.length === 0) {
    return (
      <div className="min-h-36 flex-1 overflow-hidden rounded-xl border border-white/[0.08] text-center">
        <div className="compact-horizontal-scrollbar overflow-x-scroll md:overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <caption className="sr-only">NBA player props columns</caption>
            <ResultsHeader basePath={basePath} searchParams={searchParams} sortDirection={sortDirection} sortPeriod={sortPeriod} />
          </table>
        </div>
        <div className="flex min-h-28 items-center justify-center px-4 py-8">
          <p className="text-[12px] font-mono text-slate-300">
            {totalPropsCount === 0 ? "Sorry, player props are not available right now." : "No props found for the selected filters"}
          </p>
        </div>
      </div>
    );
  }

  const hasMoreRows = visibleRows < totalResults;
  const nextRows = Math.min(totalResults, visibleRows + INITIAL_VISIBLE_ROWS);

  return (
    <PropsFavoritesProvider>
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/[0.08]">
      <div className="min-h-0 flex-1 overflow-y-auto md:hidden">
        {enrichedProps.map((player, index) => {
          const prop = player.props?.[selectedStat];
          const injuryStatus = injuryMap[player.player_name];
          return <MobilePropRow key={player.player_id} index={index} injuryStatus={injuryStatus} player={player} prop={prop} selectedStat={selectedStat} />;
        })}
      </div>

      <div className="compact-horizontal-scrollbar hidden min-h-0 flex-1 overflow-x-auto overflow-y-auto md:block">
        <table className="min-w-[860px] w-full text-left border-collapse">
          <caption className="sr-only">NBA player props for {selectedStat}, sorted by {sortPeriod}</caption>
          <ResultsHeader basePath={basePath} searchParams={searchParams} sortDirection={sortDirection} sortPeriod={sortPeriod} />
          <tbody>
            {enrichedProps.map((player, index) => {
              const prop = player.props?.[selectedStat];
              const injuryStatus = injuryMap[player.player_name];
              return <DesktopPropRow key={player.player_id} index={index} injuryStatus={injuryStatus} player={player} prop={prop} selectedStat={selectedStat} />;
            })}
          </tbody>
        </table>
      </div>

      {hasMoreRows && (
        <div className="border-t border-white/[0.08] bg-[#091423]/95 px-3 py-2 text-center">
          <Link
            href={loadMoreHref(basePath, searchParams, nextRows)}
            scroll={false}
            className="inline-flex min-h-9 items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.055] px-4 text-[11px] font-mono font-bold uppercase tracking-widest text-slate-200 transition-colors hover:border-orange-500/35 hover:bg-orange-500/10 hover:text-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
          >
            Show {nextRows - visibleRows} more
          </Link>
        </div>
      )}
    </div>
    </PropsFavoritesProvider>
  );
}
