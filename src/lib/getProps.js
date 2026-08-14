import propsByPlayer from "@/app/data/props.json";
import schedule from "@/app/data/schedule.json";
import teamStats from "@/app/data/team_stats.json";
import seasonStats from "@/app/data/season_stats.json";
import teams from "@/app/data/teams.json";
import getRosters from "./getRosters";

const STAT_KEYS = {
  points: "pts",
  rebounds: "reb",
  assists: "ast",
  steals: "stl",
  blocks: "blk",
  turnovers: "tov",
  fg3m: "fg3m",
  pra: "pra",
  pa: "pa",
  pr: "pr",
  ra: "ra",
};

const toLegacyStat = (stat) => ({
  avg: stat.avg,
  L5: { hit_rate: stat.l5, games: stat.l5Games ?? (stat.l5 == null ? 0 : 5) },
  L10: { hit_rate: stat.l10, games: stat.l10Games ?? (stat.l10 == null ? 0 : 10) },
  L20: { hit_rate: stat.l20, games: stat.l20Games ?? (stat.l20 == null ? 0 : 20) },
  full: { hit_rate: stat.season, games: stat.seasonGames ?? 0 },
  h2h: {
    hit_rate: stat.h2h,
    games: stat.h2hGames ?? 0,
  },
});

export default function getProps(source = {}) {
  const compactProps = source.propsByPlayer ?? propsByPlayer;
  const scheduleData = source.schedule ?? schedule;
  const teamStatsData = source.teamStats ?? teamStats;
  const seasonStatsData = source.seasonStats ?? seasonStats;
  const teamsData = source.teams ?? teams;
  const rostersData = source.rostersData ?? getRosters(source);
  const rosterByPlayerId = new Map(
    rostersData.map((player) => [Number(player.PLAYER_ID), player]),
  );

  return Object.entries(compactProps ?? {}).flatMap(([playerId, entry]) => {
    const id = Number(playerId);
    const player = rosterByPlayerId.get(id);
    if (!player) return [];

    const teamId = Number(player.TEAM_ID);
    const opponentId = Number(entry.oppId);
    const opponentAbbr = teamsData?.[String(opponentId)]?.abbr ?? "";
    const currentGame = (scheduleData ?? []).find(
      (game) =>
        Number(game.home_team_id) === teamId ||
        Number(game.visitor_team_id) === teamId,
    );
    const defense = teamStatsData?.[String(opponentId)]?.defense ?? {};
    const props = Object.fromEntries(
      Object.entries(STAT_KEYS).flatMap(([legacyKey, compactKey]) => {
        const stat = entry.props?.[compactKey];
        return stat
          ? [[legacyKey, toLegacyStat(stat)]]
          : [];
      }),
    );

    return [{
      player_id: id,
      player_name: player.PLAYER,
      team: player.TEAM_ABBREVIATION,
      team_id: teamId,
      position: player.POSITION,
      opponent: opponentAbbr,
      opponent_id: opponentId,
      game_date: currentGame?.date ?? null,
      avg_minutes: seasonStatsData?.[playerId]?.min ?? 0,
      props,
      matchup: {
        opp_pts_allowed_rank: defense.pts_rank,
        opp_ast_allowed_rank: defense.ast_rank,
        opp_reb_allowed_rank: defense.reb_rank,
        opp_fg3_pct_allowed_rank: defense.fg3_pct_rank,
        opp_stl_allowed_rank: defense.stl_rank,
        opp_blk_allowed_rank: defense.blk_rank,
        opp_tov_allowed_rank: defense.tov_rank,
      },
    }];
  });
}
