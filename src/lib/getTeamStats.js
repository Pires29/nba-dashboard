import teamStats from "@/app/data/team_stats.json";
import teams from "@/app/data/teams.json";

export default function getTeamStats() {
  return Object.entries(teamStats ?? {}).map(([teamId, stats]) => {
    const offense = stats?.offense ?? {};
    const defense = stats?.defense ?? {};

    return {
      TEAM_ID: Number(teamId),
      TEAM_NAME: teams?.[teamId]?.name ?? "",
      offense: {
        PTS: offense.pts, PTS_RANK: offense.pts_rank,
        AST: offense.ast, AST_RANK: offense.ast_rank,
        REB: offense.reb, REB_RANK: offense.reb_rank,
        OREB: offense.oreb, OREB_RANK: offense.oreb_rank,
        DREB: offense.dreb, DREB_RANK: offense.dreb_rank,
        FG_PCT: offense.fg_pct, FG_PCT_RANK: offense.fg_pct_rank,
        FG3_PCT: offense.fg3_pct, FG3_PCT_RANK: offense.fg3_pct_rank,
        FT_PCT: offense.ft_pct, FT_PCT_RANK: offense.ft_pct_rank,
        STL: offense.stl, STL_RANK: offense.stl_rank,
        BLK: offense.blk, BLK_RANK: offense.blk_rank,
        TOV: offense.tov, TOV_RANK: offense.tov_rank,
      },
      defense: {
        OPP_PTS: defense.pts, OPP_PTS_RANK: defense.pts_rank,
        OPP_AST: defense.ast, OPP_AST_RANK: defense.ast_rank,
        OPP_REB: defense.reb, OPP_REB_RANK: defense.reb_rank,
        OPP_OREB: defense.oreb, OPP_OREB_RANK: defense.oreb_rank,
        OPP_DREB: defense.dreb, OPP_DREB_RANK: defense.dreb_rank,
        OPP_FG_PCT: defense.fg_pct, OPP_FG_PCT_RANK: defense.fg_pct_rank,
        OPP_FG3_PCT: defense.fg3_pct, OPP_FG3_PCT_RANK: defense.fg3_pct_rank,
        OPP_FT_PCT: defense.ft_pct, OPP_FT_PCT_RANK: defense.ft_pct_rank,
        OPP_STL: defense.stl, OPP_STL_RANK: defense.stl_rank,
        OPP_BLK: defense.blk, OPP_BLK_RANK: defense.blk_rank,
        OPP_TOV: defense.tov, OPP_TOV_RANK: defense.tov_rank,
      },
    };
  });
}
