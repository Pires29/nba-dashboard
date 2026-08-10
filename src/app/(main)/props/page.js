import getGamesSchedule from "@/lib/getGamesSchedule";
import getInjuries from "@/lib/getInjuries";
import getProps from "@/lib/getProps";
import getStandings from "@/lib/getStandings";
import { getAvailablePlayers } from "@/lib/getAvailablePlayers";
import { getCurrentSession } from "@/lib/getCurrentSession";
import PropsTableWrapper from "./PropsTableWrapper";

const STATS = new Set([
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
]);

const PERIODS = new Set(["L5", "L10", "L20", "full", "h2h"]);
const MATCHUP_FILTERS = new Set(["favorable", "neutral", "unfavorable"]);
const INJURY_FILTERS = new Set([
  "Out",
  "Day-To-Day",
  "Doubtful",
  "Questionable",
]);

const getSingleParam = (value) => {
  if (Array.isArray(value)) return value[0];
  return value;
};

const getListParam = (value) => {
  const single = getSingleParam(value);
  if (!single) return [];

  return single
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const parseHitRateFilters = (value) => {
  const single = getSingleParam(value);
  if (!single) return [];

  return single
    .split(",")
    .map((chunk) => {
      const [period, min = "", max = ""] = chunk.split(":");
      if (!PERIODS.has(period)) return null;

      return { period, min, max };
    })
    .filter(Boolean);
};

const MATCHUP_RANK = (rank) => {
  if (rank == null) return { label: "—" };
  if (rank >= 20) return { label: "Favorable" };
  if (rank >= 10) return { label: "Neutral" };
  return { label: "Unfavorable" };
};

const STAT_MATCHUP_RANK = (stat, matchup) => {
  const pts = matchup?.opp_pts_allowed_rank;
  const ast = matchup?.opp_ast_allowed_rank;
  const reb = matchup?.opp_reb_allowed_rank;
  const fg3 = matchup?.opp_fg3_pct_allowed_rank;
  const stl = matchup?.opp_stl_allowed_rank;
  const blk = matchup?.opp_blk_allowed_rank;
  const tov = matchup?.opp_tov_allowed_rank;

  const avg = (...vals) => {
    const valid = vals.filter((item) => item != null);
    return valid.length
      ? Math.round(valid.reduce((acc, item) => acc + item, 0) / valid.length)
      : null;
  };

  const rankMap = {
    points: pts,
    assists: ast,
    rebounds: reb,
    fg3m: fg3,
    steals: stl,
    blocks: blk,
    turnovers: tov,
    pra: avg(pts, reb, ast),
    pa: avg(pts, ast),
    pr: avg(pts, reb),
    ra: avg(reb, ast),
  };

  return rankMap[stat] ?? null;
};

export default async function PropsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const session = await getCurrentSession();
  const plan = session?.user?.plan ?? "free";
  const allowedPlayerIds = getAvailablePlayers(plan);
  const selectedStatParam = getSingleParam(resolvedSearchParams?.stat);
  const sortPeriodParam = getSingleParam(resolvedSearchParams?.sortPeriod);
  const filterTeam = getSingleParam(resolvedSearchParams?.team) ?? "";
  const filterGame = getSingleParam(resolvedSearchParams?.game) ?? "";
  const search = getSingleParam(resolvedSearchParams?.search) ?? "";
  const filterMatchup = getListParam(resolvedSearchParams?.matchup).filter(
    (item) => MATCHUP_FILTERS.has(item),
  );
  const filterInjury = getListParam(resolvedSearchParams?.injury).filter(
    (item) => INJURY_FILTERS.has(item),
  );
  const filterHitRates = parseHitRateFilters(resolvedSearchParams?.hitRates);

  const selectedStat = STATS.has(selectedStatParam)
    ? selectedStatParam
    : "points";
  const sortPeriod = PERIODS.has(sortPeriodParam) ? sortPeriodParam : "L5";

  const [rawProps, standings, schedule, injuries] = await Promise.all([
    getProps(),
    getStandings(),
    getGamesSchedule(),
    getInjuries(),
  ]);

  const safeProps = (Array.isArray(rawProps) ? rawProps : []).filter((prop) =>
    allowedPlayerIds.has(Number(prop.player_id)),
  );
  const safeStandings = Array.isArray(standings) ? standings : [];
  const safeSchedule = Array.isArray(schedule) ? schedule : [];
  const safeInjuries = Array.isArray(injuries) ? injuries : [];

  const injuryMap = {};
  safeInjuries.forEach((team) => {
    team?.injuries?.forEach((injury) => {
      if (injury?.athlete?.displayName) {
        injuryMap[injury.athlete.displayName] = injury.status;
      }
    });
  });

  const filteredProps = safeProps
    .filter((p) => {
      const prop = p.props?.[selectedStat];
      if (!prop) return false;

      if (
        search &&
        !p.player_name.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }

      if (filterTeam && p.team !== filterTeam) return false;

      if (filterGame) {
        const [homeId, awayId] = filterGame.split("-").map(Number);
        if (p.team_id !== homeId && p.team_id !== awayId) return false;
      }

      if (filterMatchup.length > 0) {
        const rank = STAT_MATCHUP_RANK(selectedStat, p.matchup);
        const matchupInfo = MATCHUP_RANK(rank);
        if (!filterMatchup.includes(matchupInfo.label.toLowerCase())) {
          return false;
        }
      }

      for (const filter of filterHitRates) {
        const hitRate = prop?.[filter.period]?.hit_rate;
        if (hitRate == null) return false;
        if (filter.min !== "" && hitRate < Number(filter.min)) return false;
        if (filter.max !== "" && hitRate > Number(filter.max)) return false;
      }

      if (filterInjury.length > 0) {
        const status = injuryMap[p.player_name];
        if (status && filterInjury.includes(status)) return false;
      }

      return true;
    })
    .sort((a, b) => {
      const aData = a.props?.[selectedStat]?.[sortPeriod];
      const bData = b.props?.[selectedStat]?.[sortPeriod];
      const aHr = aData?.hit_rate ?? 0;
      const bHr = bData?.hit_rate ?? 0;
      if (bHr !== aHr) return bHr - aHr;

      const aGames = aData?.games ?? 0;
      const bGames = bData?.games ?? 0;
      if (bGames !== aGames) return bGames - aGames;

      return (b.avg_minutes || 0) - (a.avg_minutes || 0);
    });

  const allTeams = [...new Set(safeProps.map((p) => p.team))].sort();

  const teamNameMap = safeStandings.reduce((acc, t) => {
    acc[t.TeamID] = t.TeamName;
    return acc;
  }, {});

  const slimSchedule = safeSchedule.map(
    ({ home_team_id, visitor_team_id, status }) => ({
      home_team_id,
      visitor_team_id,
      status,
    }),
  );

  const slimInjuries = safeInjuries.flatMap((team) =>
    (team?.injuries ?? []).map((i) => ({
      name: i.athlete.displayName,
      status: i.status,
    })),
  );

  const scheduleMap = new Map();

  for (const g of safeSchedule) {
    const key1 = `${g.home_team_id}-${g.visitor_team_id}`;
    const key2 = `${g.visitor_team_id}-${g.home_team_id}`;

    scheduleMap.set(key1, g);
    scheduleMap.set(key2, g);
  }

  const enrichedProps = filteredProps.map((p) => {
    const game = scheduleMap.get(`${p.team_id}-${p.opponent_id}`);

    const rank = STAT_MATCHUP_RANK(selectedStat, p.matchup);

    return {
      ...p,
      game,
      matchupRank: rank,
      matchupLabel: MATCHUP_RANK(rank).label,
    };
  });

  return (
    <PropsTableWrapper
      basePath="/props"
      enrichedProps={enrichedProps}
      allTeams={allTeams}
      standings={teamNameMap}
      schedule={slimSchedule}
      injuries={slimInjuries}
      totalPropsCount={safeProps.length}
      isFreePlan={plan === "free"}
      initialFilters={{
        selectedStat,
        sortPeriod,
        filterTeam,
        filterGame,
        filterMatchup,
        filterHitRates,
        filterInjury,
        search,
      }}
    />
  );
}
