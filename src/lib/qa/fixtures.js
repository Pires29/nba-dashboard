const TEAM_DEFINITIONS = [
  { id: 901, name: "Lisbon Navigators", abbr: "LIS" },
  { id: 902, name: "Porto Guardians", abbr: "POR" },
  { id: 903, name: "Braga Wolves", abbr: "BRG" },
  { id: 904, name: "Coimbra Owls", abbr: "COI" },
];

const POSITIONS = ["PG", "SG", "SF", "PF", "C"];
const STAT_KEYS = [
  "points", "assists", "rebounds", "blocks", "steals", "turnovers",
  "fg3m", "pra", "pa", "pr", "ra",
];

const round = (value, places = 1) => Number(value.toFixed(places));

const rosters = TEAM_DEFINITIONS.flatMap((team, teamIndex) =>
  Array.from({ length: 18 }, (_, playerIndex) => {
    const id = 900000 + teamIndex * 100 + playerIndex + 1;
    return {
      PLAYER_ID: id,
      PLAYER: `QA ${team.abbr} Player ${String(playerIndex + 1).padStart(2, "0")}`,
      NUM: String((playerIndex * 3 + teamIndex) % 99),
      POSITION: POSITIONS[playerIndex % POSITIONS.length],
      HEIGHT: `${6 + (playerIndex % 2)}-${playerIndex % 12}`,
      WEIGHT: String(185 + playerIndex * 3),
      BIRTH_DATE: `199${playerIndex % 10}-0${(playerIndex % 9) + 1}-15`,
      TEAM_NAME: team.name,
      TEAM_ID: team.id,
      TEAM_ABBREVIATION: team.abbr,
    };
  }),
);

const games = [
  { date: "2026-10-20", home_team_id: 901, visitor_team_id: 902, status: "7:30 PM" },
  { date: "2026-10-20", home_team_id: 903, visitor_team_id: 904, status: "9:00 PM" },
];

const opponentFor = (teamId) => {
  const game = games.find(
    (item) => item.home_team_id === teamId || item.visitor_team_id === teamId,
  );
  return game.home_team_id === teamId ? game.visitor_team_id : game.home_team_id;
};

const teamById = new Map(TEAM_DEFINITIONS.map((team) => [team.id, team]));

const logsByPlayer = Object.fromEntries(
  rosters.map((player, playerIndex) => {
    const opponent = teamById.get(opponentFor(player.TEAM_ID));
    const logs = Array.from({ length: 30 }, (_, gameIndex) => ({
      GAME_DATE: new Date(Date.UTC(2026, 9, 19 - gameIndex)).toISOString(),
      MATCHUP: `${player.TEAM_ABBREVIATION} ${gameIndex % 2 ? "@" : "vs."} ${opponent.abbr}`,
      WL: gameIndex % 3 ? "W" : "L",
      MIN: 25 + ((playerIndex + gameIndex) % 14),
      PTS: 12 + ((playerIndex * 2 + gameIndex * 3) % 25),
      REB: 3 + ((playerIndex + gameIndex) % 12),
      AST: 2 + ((playerIndex * 2 + gameIndex) % 11),
      STL: (playerIndex + gameIndex) % 4,
      BLK: (playerIndex + gameIndex * 2) % 4,
      TOV: 1 + ((playerIndex + gameIndex) % 5),
      FG3M: (playerIndex + gameIndex) % 6,
      opp: opponent.abbr,
    }));
    return [String(player.PLAYER_ID), logs];
  }),
);

const props = rosters.map((player, index) => {
  const opponentId = opponentFor(player.TEAM_ID);
  const base = 15 + (index % 14);
  const propStats = Object.fromEntries(
    STAT_KEYS.map((stat, statIndex) => [
      stat,
      {
        avg: round(base + statIndex * 0.7),
        L5: { hit_rate: 40 + ((index + statIndex * 7) % 61), games: 5 },
        L10: { hit_rate: 40 + ((index + statIndex * 5) % 61), games: 10 },
        L20: { hit_rate: 35 + ((index + statIndex * 3) % 66), games: 20 },
        full: { hit_rate: 35 + ((index + statIndex * 2) % 66), games: 30 },
        h2h: { hit_rate: 40 + ((index + statIndex * 4) % 61), games: 4 },
      },
    ]),
  );
  return {
    player_id: player.PLAYER_ID,
    player_name: player.PLAYER,
    team: player.TEAM_ABBREVIATION,
    team_id: player.TEAM_ID,
    position: player.POSITION,
    opponent: teamById.get(opponentId).abbr,
    opponent_id: opponentId,
    game_date: "2026-10-20",
    avg_minutes: 26 + (index % 12),
    props: propStats,
    matchup: {
      opp_pts_allowed_rank: 1 + (index % 30),
      opp_ast_allowed_rank: 1 + ((index + 4) % 30),
      opp_reb_allowed_rank: 1 + ((index + 8) % 30),
      opp_fg3_pct_allowed_rank: 1 + ((index + 12) % 30),
      opp_stl_allowed_rank: 1 + ((index + 16) % 30),
      opp_blk_allowed_rank: 1 + ((index + 20) % 30),
      opp_tov_allowed_rank: 1 + ((index + 24) % 30),
    },
  };
});

const standings = TEAM_DEFINITIONS.map((team, index) => ({
  TeamID: team.id,
  TeamName: team.name,
  Conference: index < 2 ? "East" : "West",
  WINS: 8 - index,
  LOSSES: 2 + index,
}));

const rankBlock = (teamIndex, opponent = false) => ({
  PTS: opponent ? 108 + teamIndex : 114 + teamIndex,
  PTS_RANK: 4 + teamIndex,
  AST: 25 + teamIndex,
  AST_RANK: 6 + teamIndex,
  REB: 43 + teamIndex,
  REB_RANK: 8 + teamIndex,
  OREB: 10 + teamIndex,
  OREB_RANK: 10 + teamIndex,
  DREB: 33 + teamIndex,
  DREB_RANK: 12 + teamIndex,
  FG_PCT: 0.47 + teamIndex * 0.002,
  FG_PCT_RANK: 5 + teamIndex,
  FG3_PCT: 0.36 + teamIndex * 0.002,
  FG3_PCT_RANK: 7 + teamIndex,
  FT_PCT: 0.78 + teamIndex * 0.002,
  FT_PCT_RANK: 9 + teamIndex,
  STL: 7 + teamIndex,
  STL_RANK: 11 + teamIndex,
  BLK: 5 + teamIndex,
  BLK_RANK: 13 + teamIndex,
  TOV: 13 + teamIndex,
  TOV_RANK: 15 + teamIndex,
});

const teamStats = TEAM_DEFINITIONS.map((team, index) => ({
  TEAM_ID: team.id,
  TEAM_NAME: team.name,
  offense: rankBlock(index),
  defense: Object.fromEntries(
    Object.entries(rankBlock(index, true)).map(([key, value]) => [
      key.endsWith("_RANK") ? `OPP_${key}` : `OPP_${key}`,
      value,
    ]),
  ),
}));

const injuries = TEAM_DEFINITIONS.map((team, index) => ({
  displayName: team.name,
  injuries: [
    {
      TeamID: team.id,
      athlete: { id: rosters[index * 18 + 3].PLAYER_ID, displayName: rosters[index * 18 + 3].PLAYER },
      status: index % 2 ? "Day-To-Day" : "Questionable",
      details: { type: "QA fixture", detail: "Testing injury state", returnDate: "2026-10-25" },
    },
  ],
}));

export function getQaFixtures(scenario = "regular") {
  if (scenario === "no-games") {
    return { rosters, props: [], games: [], standings, injuries: [], teamStats, logsByPlayer, previousLogsByPlayer: {} };
  }
  if (scenario === "partial-data") {
    return { rosters, props: props.slice(0, 28), games, standings, injuries, teamStats, logsByPlayer: Object.fromEntries(Object.entries(logsByPlayer).slice(0, 20)), previousLogsByPlayer: {} };
  }
  return { rosters, props, games, standings, injuries, teamStats, logsByPlayer, previousLogsByPlayer: logsByPlayer };
}

export const QA_SCENARIOS = ["regular", "no-games", "partial-data"];
export const QA_PERSONAS = ["free", "trial", "pro"];
