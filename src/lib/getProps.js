import propsByPlayer from "@/app/data/props.json";
import schedule from "@/app/data/schedule.json";
import teamStats from "@/app/data/team_stats.json";
import seasonStats from "@/app/data/season_stats.json";
import gameLogs from "@/app/data/game_logs_current.json";
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

const toLegacyStat = (stat, logs, opponentAbbr) => ({
  avg: stat.avg,
  L5: { hit_rate: stat.l5, games: Math.min(logs.length, 5) },
  L10: { hit_rate: stat.l10, games: Math.min(logs.length, 10) },
  L20: { hit_rate: stat.l20, games: Math.min(logs.length, 20) },
  full: { hit_rate: stat.season, games: logs.length },
  h2h: {
    hit_rate: stat.h2h,
    games: logs.filter((game) => game.opp === opponentAbbr).length,
  },
});

export default function getProps() {
  const rosterByPlayerId = new Map(
    getRosters().map((player) => [Number(player.PLAYER_ID), player]),
  );

  return Object.entries(propsByPlayer ?? {}).flatMap(([playerId, entry]) => {
    const id = Number(playerId);
    const player = rosterByPlayerId.get(id);
    if (!player) return [];

    const teamId = Number(player.TEAM_ID);
    const opponentId = Number(entry.oppId);
    const opponentAbbr = teams?.[String(opponentId)]?.abbr ?? "";
    const logs = gameLogs?.[playerId] ?? [];
    const currentGame = (schedule ?? []).find(
      (game) =>
        Number(game.home_team_id) === teamId ||
        Number(game.visitor_team_id) === teamId,
    );
    const defense = teamStats?.[String(opponentId)]?.defense ?? {};
    const props = Object.fromEntries(
      Object.entries(STAT_KEYS).flatMap(([legacyKey, compactKey]) => {
        const stat = entry.props?.[compactKey];
        return stat
          ? [[legacyKey, toLegacyStat(stat, logs, opponentAbbr)]]
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
      avg_minutes: seasonStats?.[playerId]?.min ?? 0,
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
