import {
  buildPlayerGraphData,
  buildPlayerGraphStatDataMap,
  buildPlayerGraphViews,
} from "@/lib/buildPlayerGraphData";

export async function buildPlayerStatsPageData({
  playerId,
  team1Id,
  team2Id,
  stat,
  rawRosterData,
  rawGamesSchedule,
  rawInjuries,
  rawTeamStats,
  playerLogs,
  playerLogsPrev,
  playerLogsPlayoffs,
  teammateLogBundles = [],
}) {
  const formatTeamStats = (teamStatsEntry) => {
    if (!teamStatsEntry) return null;

    return {
      teamID: teamStatsEntry.TEAM_ID,
      teamName: teamStatsEntry.TEAM_NAME,
      offense: {
        Points: {
          value: teamStatsEntry.offense?.PTS,
          rank: teamStatsEntry.offense?.PTS_RANK,
        },
        Assists: {
          value: teamStatsEntry.offense?.AST,
          rank: teamStatsEntry.offense?.AST_RANK,
        },
        Rebounds: {
          value: teamStatsEntry.offense?.REB,
          rank: teamStatsEntry.offense?.REB_RANK,
        },
        "FG%": {
          value: teamStatsEntry.offense?.FG_PCT,
          rank: teamStatsEntry.offense?.FG_PCT_RANK,
        },
        "3P%": {
          value: teamStatsEntry.offense?.FG3_PCT,
          rank: teamStatsEntry.offense?.FG3_PCT_RANK,
        },
        "FT%": {
          value: teamStatsEntry.offense?.FT_PCT,
          rank: teamStatsEntry.offense?.FT_PCT_RANK,
        },
        Steals: {
          value: teamStatsEntry.offense?.STL,
          rank: teamStatsEntry.offense?.STL_RANK,
        },
        Blocks: {
          value: teamStatsEntry.offense?.BLK,
          rank: teamStatsEntry.offense?.BLK_RANK,
        },
        Turnovers: {
          value: teamStatsEntry.offense?.TOV,
          rank: teamStatsEntry.offense?.TOV_RANK,
        },
        OffReb: {
          value: teamStatsEntry.offense?.OREB,
          rank: teamStatsEntry.offense?.OREB_RANK,
        },
        DefReb: {
          value: teamStatsEntry.offense?.DREB,
          rank: teamStatsEntry.offense?.DREB_RANK,
        },
      },
      defense: {
        OppPoints: {
          value: teamStatsEntry.defense?.OPP_PTS,
          rank: teamStatsEntry.defense?.OPP_PTS_RANK,
        },
        OppAssists: {
          value: teamStatsEntry.defense?.OPP_AST,
          rank: teamStatsEntry.defense?.OPP_AST_RANK,
        },
        OppRebounds: {
          value: teamStatsEntry.defense?.OPP_REB,
          rank: teamStatsEntry.defense?.OPP_REB_RANK,
        },
        "OppFG%": {
          value: teamStatsEntry.defense?.OPP_FG_PCT,
          rank: teamStatsEntry.defense?.OPP_FG_PCT_RANK,
        },
        "OppFG3%": {
          value: teamStatsEntry.defense?.OPP_FG3_PCT,
          rank: teamStatsEntry.defense?.OPP_FG3_PCT_RANK,
        },
        "OppFT%": {
          value: teamStatsEntry.defense?.OPP_FT_PCT,
          rank: teamStatsEntry.defense?.OPP_FT_PCT_RANK,
        },
        OppSteals: {
          value: teamStatsEntry.defense?.OPP_STL,
          rank: teamStatsEntry.defense?.OPP_STL_RANK,
        },
        OppBlocks: {
          value: teamStatsEntry.defense?.OPP_BLK,
          rank: teamStatsEntry.defense?.OPP_BLK_RANK,
        },
        OppTurnovers: {
          value: teamStatsEntry.defense?.OPP_TOV,
          rank: teamStatsEntry.defense?.OPP_TOV_RANK,
        },
        OppOffReb: {
          value: teamStatsEntry.defense?.OPP_OREB,
          rank: teamStatsEntry.defense?.OPP_OREB_RANK,
        },
        OppDefReb: {
          value: teamStatsEntry.defense?.OPP_DREB,
          rank: teamStatsEntry.defense?.OPP_DREB_RANK,
        },
      },
    };
  };

  const rosterData = Array.isArray(rawRosterData) ? rawRosterData : [];
  const gamesSchedule = (Array.isArray(rawGamesSchedule) ? rawGamesSchedule : [])
    .map(({ home_team_id, visitor_team_id, status, date }) => ({
      home_team_id,
      visitor_team_id,
      status,
      date,
    }));
  const injuries = Array.isArray(rawInjuries) ? rawInjuries : [];
  const teamStats = Array.isArray(rawTeamStats) ? rawTeamStats : [];

  const homeRoster = rosterData.filter((p) => Number(p.TEAM_ID) === team1Id);

  const awayRoster = rosterData.filter((p) => Number(p.TEAM_ID) === team2Id);

  const combinedRoster = [...homeRoster, ...awayRoster];

  const player = combinedRoster.find((p) => p.PLAYER_ID === playerId) ?? null;

  const currentGame =
    gamesSchedule.find(
      (g) => g.home_team_id === team1Id && g.visitor_team_id === team2Id,
    ) ?? null;

  const teamNameMap = rosterData.reduce((acc, p) => {
    if (p.TEAM_ID && p.TEAM_NAME) {
      acc[Number(p.TEAM_ID)] = p.TEAM_NAME;
    }
    return acc;
  }, {});

  const injuriesTeam1 =
    injuries.find((team) => team.injuries?.[0]?.TeamID === team1Id) ?? null;

  const injuriesTeam2 =
    injuries.find((team) => team.injuries?.[0]?.TeamID === team2Id) ?? null;
  const injuryStatusMap = injuries.reduce((acc, team) => {
    for (const playerInjury of team.injuries ?? []) {
      const playerName = playerInjury?.athlete?.displayName;
      if (playerName) acc[playerName] = playerInjury.status;
    }
    return acc;
  }, {});

  const homeTeamStats =
    teamStats.find((team) => Number(team.TEAM_ID) === team1Id) ?? null;
  const awayTeamStats =
    teamStats.find((team) => Number(team.TEAM_ID) === team2Id) ?? null;

  const team1Formatted = formatTeamStats(homeTeamStats);
  const team2Formatted = formatTeamStats(awayTeamStats);

  const opponentAbbr = homeRoster.some((p) => p.PLAYER_ID === playerId)
    ? awayRoster[0]?.TEAM_ABBREVIATION
    : homeRoster[0]?.TEAM_ABBREVIATION;

  const playerStats = player
    ? {
        playerId: player.PLAYER_ID,
        playerName: player.PLAYER,
        playerTeam: player.TEAM_ABBREVIATION,
      }
    : null;

  const currentPlayerLogs = Array.isArray(playerLogs)
    ? playerLogs
    : [];

  const previousPlayerLogs = Array.isArray(playerLogsPrev) ? playerLogsPrev : [];
  const playoffPlayerLogs = Array.isArray(playerLogsPlayoffs)
    ? playerLogsPlayoffs
    : [];
  // The endpoints return the regular season and playoffs separately. For the
  // chart experience, both belong to the current season, so L5/L10 and other
  // contexts always use the latest games regardless of the competition phase.
  const currentSeasonPlayerLogs = [...currentPlayerLogs, ...playoffPlayerLogs]
    .map((game, index) => ({ game, index }))
    .sort((a, b) => {
      const aDate = new Date(a.game?.GAME_DATE ?? a.game?.date ?? 0).getTime();
      const bDate = new Date(b.game?.GAME_DATE ?? b.game?.date ?? 0).getTime();
      const aTimestamp = Number.isNaN(aDate) ? 0 : aDate;
      const bTimestamp = Number.isNaN(bDate) ? 0 : bDate;

      return bTimestamp - aTimestamp || a.index - b.index;
    })
    .map(({ game }) => game);

  const initialSelectedName = (() => {
    if (playerId) {
      const p = combinedRoster.find((player) => player.PLAYER_ID === playerId);
      if (p) return p.PLAYER;
    }

    const roster = homeRoster.length ? homeRoster : awayRoster;
    return (roster.find((p) => p.NUM) || roster[0])?.PLAYER || "";
  })();

  const initialActiveTeam = (() => {
    if (!playerId) return 0;

    return homeRoster.some((player) => player.PLAYER_ID === playerId) ? 0 : 1;
  })();

  const slimRoster = (roster) =>
    roster.map(({ PLAYER_ID, PLAYER, NUM, POSITION, TEAM_ID, TEAM_NAME, TEAM_ABBREVIATION, _isLocked }) => ({
      PLAYER_ID,
      PLAYER,
      NUM,
      POSITION,
      TEAM_ID,
      TEAM_NAME,
      TEAM_ABBREVIATION,
      _isLocked,
    }));

  const graphData = buildPlayerGraphData({
    currentGames: currentSeasonPlayerLogs,
    previousGames: playerLogsPrev,
    playoffGames: playoffPlayerLogs,
    player: playerStats,
    opponentAbbr,
  });
  const graphViews = buildPlayerGraphViews(graphData);
  const statGraphData = buildPlayerGraphStatDataMap(graphViews);
  const gameId = (game) => String(game?.gid ?? game?.GAME_ID ?? "");
  const average = (games, modernKey, legacyKey) => games.length
    ? Math.round((games.reduce((sum, game) => sum + Number(game?.[modernKey] ?? game?.[legacyKey] ?? 0), 0) / games.length) * 10) / 10
    : null;
  const teammateImpact = teammateLogBundles.map(({ player: teammate, logs = [], logsPrev = [], logsPlayoffs = [] }) => ({
    playerId: Number(teammate.PLAYER_ID),
    playerName: teammate.PLAYER,
    position: teammate.POSITION ?? "—",
    avgMinutes: average(logs, "min", "MIN"),
    avgPoints: average(logs, "pts", "PTS"),
    currentGameIds: [...logs, ...logsPlayoffs].map(gameId).filter(Boolean),
    previousGameIds: logsPrev.map(gameId).filter(Boolean),
  }));
  const availabilityGames = {
    current: currentPlayerLogs,
    previous: previousPlayerLogs,
    playoffs: playoffPlayerLogs,
  };
  const contextGames = currentSeasonPlayerLogs.slice(0, 10).map((game) => ({
    date: game.date ?? game.GAME_DATE ?? null,
    opponent: game.opp ?? game.opponent ?? "",
    minutes: game.min ?? game.MIN ?? null,
    fg_pct: game.fg_pct ?? game.FG_PCT ?? null,
    fg3_pct: game.fg3_pct ?? game.FG3_PCT ?? null,
    ft_pct: game.ft_pct ?? game.FT_PCT ?? null,
    fouls: game.pf ?? game.PF ?? null,
  }));

  return {
    player,
    playerStats,
    contextGames,
    hasCurrentGames: currentSeasonPlayerLogs.length > 0,
    hasPreviousGames: previousPlayerLogs.length > 0,
    hasPlayoffGames: playoffPlayerLogs.length > 0,
    currentGame,
    gamesSchedule,
    teamNameMap,
    opponentAbbr,
    homeRoster: slimRoster(homeRoster),
    awayRoster: slimRoster(awayRoster),
    injuryStatusMap,
    injuriesTeam1,
    injuriesTeam2,
    team1Formatted,
    team2Formatted,
    initialSelectedName,
    initialActiveTeam,
    statGraphData,
    teammateImpact,
    availabilityGames,
  };
}
