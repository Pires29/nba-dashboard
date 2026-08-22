import { getAvailablePlayers } from "@/lib/getAvailablePlayers";
import { getCurrentSession } from "@/lib/getCurrentSession";
import PropsTableWrapper from "./PropsTableWrapper";
import { getQaContext } from "@/lib/qa/context";
import { resolveQaPlan } from "@/lib/qa/plan";
import { getNbaData } from "@/lib/nbaDataSource";

const SERVER_STARTED_AT = Date.now();

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

const getFirstParam = (params, keys) => {
  for (const key of keys) {
    const value = getSingleParam(params?.[key]);
    if (value != null && value !== "") return value;
  }

  return undefined;
};

const getListParam = (value) => {
  const single = getSingleParam(value);
  if (!single) return [];

  return single
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const getListParamFromKeys = (params, keys) => getListParam(getFirstParam(params, keys));

const clampHitRateParam = (value) => {
  if (value === "") return "";

  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return "";

  return String(Math.min(100, Math.max(0, numberValue)));
};

const parseHitRateFilters = (value) => {
  const single = getSingleParam(value);
  if (!single) return [];

  return single
    .split(",")
    .map((chunk) => {
      const [period, min = "", max = ""] = chunk.split(":");
      if (!PERIODS.has(period)) return null;

      return {
        period,
        min: clampHitRateParam(min),
        max: clampHitRateParam(max),
      };
    })
    .filter(Boolean);
};

const MATCHUP_CODE_TO_VALUE = {
  f: "favorable",
  n: "neutral",
  u: "unfavorable",
};

const INJURY_CODE_TO_VALUE = {
  out: "Out",
  dtd: "Day-To-Day",
  doubtful: "Doubtful",
  q: "Questionable",
};

const normalizeMatchupFilter = (value) => MATCHUP_CODE_TO_VALUE[value] ?? value;
const normalizeInjuryFilter = (value) => INJURY_CODE_TO_VALUE[value] ?? value;

const MATCHUP_RANK = (rank) => {
  if (rank == null) return { label: "—", color: "text-slate-500" };
  if (rank >= 20)
    return { label: "Favorable", color: "text-emerald-400" };
  if (rank >= 10) return { label: "Neutral", color: "text-yellow-400" };
  return { label: "Unfavorable", color: "text-red-400" };
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
  const qa = await getQaContext();
  const nbaData = qa?.data ?? (await getNbaData());
  const plan = resolveQaPlan(qa?.persona, session?.user?.plan);
  const allowedPlayerIds = getAvailablePlayers(plan, nbaData);
  const selectedStatParam = getSingleParam(resolvedSearchParams?.stat);
  const sortPeriodParam = getFirstParam(resolvedSearchParams, [
    "sort",
    "sortPeriod",
  ]);
  const sortDirectionParam = getFirstParam(resolvedSearchParams, [
    "dir",
    "sortDirection",
  ]);
  const filterTeam = getListParamFromKeys(resolvedSearchParams, ["team"]);
  const filterGame = getListParamFromKeys(resolvedSearchParams, [
    "games",
    "game",
  ]);
  const search = getFirstParam(resolvedSearchParams, ["q", "search"]) ?? "";
  const filterMatchup = getListParamFromKeys(resolvedSearchParams, [
    "matchup",
  ])
    .map(normalizeMatchupFilter)
    .filter((item) => MATCHUP_FILTERS.has(item));
  const filterInjury = getListParamFromKeys(resolvedSearchParams, [
    "hide",
    "injury",
  ])
    .map(normalizeInjuryFilter)
    .filter((item) => INJURY_FILTERS.has(item));
  const filterHitRates = parseHitRateFilters(
    getFirstParam(resolvedSearchParams, ["hr", "hitRates"]),
  );

  const selectedStat = STATS.has(selectedStatParam)
    ? selectedStatParam
    : "points";
  const sortPeriod = PERIODS.has(sortPeriodParam) ? sortPeriodParam : "L5";
  const sortDirection = sortDirectionParam === "asc" ? "asc" : "desc";

  const [rawProps, standings, schedule, injuries] = await Promise.all([
    nbaData.props,
    nbaData.standings,
    nbaData.games,
    nbaData.injuries,
  ]);

  const currentRosterByPlayerId = new Map(
    nbaData.rosters.map((player) => [Number(player.PLAYER_ID), player]),
  );
  const safeProps = (Array.isArray(rawProps) ? rawProps : [])
    .filter((prop) => allowedPlayerIds.has(Number(prop.player_id)))
    .map((prop) => {
      const currentPlayer = currentRosterByPlayerId.get(Number(prop.player_id));
      if (!currentPlayer) return prop;

      return {
        ...prop,
        team: currentPlayer.TEAM_ABBREVIATION,
        team_id: currentPlayer.TEAM_ID,
        position: currentPlayer.POSITION || prop.position,
      };
    });
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

      if (filterTeam.length > 0 && !filterTeam.includes(p.team)) return false;

      if (filterGame.length > 0) {
        const isInSelectedGame = filterGame.some((gameKey) => {
          const [homeId, awayId] = gameKey.split("-").map(Number);
          return p.team_id === homeId || p.team_id === awayId;
        });
        if (!isInSelectedGame) return false;
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
      if (bHr !== aHr) {
        return sortDirection === "asc" ? aHr - bHr : bHr - aHr;
      }

      const aGames = aData?.games ?? 0;
      const bGames = bData?.games ?? 0;
      if (bGames !== aGames) {
        return sortDirection === "asc" ? aGames - bGames : bGames - aGames;
      }

      return sortDirection === "asc"
        ? (a.avg_minutes || 0) - (b.avg_minutes || 0)
        : (b.avg_minutes || 0) - (a.avg_minutes || 0);
    });

  const teamNameMap = safeStandings.reduce((acc, t) => {
    acc[t.TeamID] = t.TeamName;
    return acc;
  }, {});

  const propTeamIds = new Set(safeProps.map((prop) => Number(prop.team_id)));

  const slimSchedule = safeSchedule.filter(
    ({ home_team_id, visitor_team_id }) =>
      propTeamIds.has(Number(home_team_id)) ||
      propTeamIds.has(Number(visitor_team_id)),
  ).map(
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
      player_id: p.player_id,
      player_name: p.player_name,
      team: p.team,
      team_id: p.team_id,
      position: p.position,
      opponent: p.opponent,
      opponent_id: p.opponent_id,
      props: { [selectedStat]: p.props?.[selectedStat] },
      game: game
        ? {
            home_team_id: game.home_team_id,
            visitor_team_id: game.visitor_team_id,
            date: game.date ?? null,
          }
        : null,
      matchupRank: rank,
      matchupLabel: MATCHUP_RANK(rank),
    };
  });

  return (
    <PropsTableWrapper
      basePath="/props"
      enrichedProps={enrichedProps}
      standings={teamNameMap}
      schedule={slimSchedule}
      injuries={slimInjuries}
      totalPropsCount={safeProps.length}
      isFreePlan={plan === "free"}
      dataStatus={{
        source: qa ? "qa" : nbaData.source,
        updatedAt: nbaData.updatedAt ?? null,
        isStale: nbaData.updatedAt
          ? SERVER_STARTED_AT - new Date(nbaData.updatedAt).getTime() > 24 * 60 * 60 * 1000
          : false,
      }}
      initialFilters={{
        selectedStat,
        sortPeriod,
        sortDirection,
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
