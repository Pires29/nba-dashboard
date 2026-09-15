import { getPositionMatchup } from "./matchup.js";
import {
  buildPlayerGraphData,
  buildPlayerGraphStatDataMap,
  buildPlayerGraphViews,
} from "@/lib/buildPlayerGraphData";

const compactPlayer = (player) => {
  if (!player) return null;

  return {
    PLAYER_ID: player.PLAYER_ID,
    PLAYER: player.PLAYER,
    POSITION: player.POSITION,
    TEAM_ABBREVIATION: player.TEAM_ABBREVIATION,
  };
};

const compactGameLog = (game) => ({
  gid: game?.gid ?? game?.GAME_ID,
  date: game?.date ?? game?.GAME_DATE ?? null,
  opp: game?.opp ?? game?.opponent ?? "",
  isHome: game?.isHome ?? null,
  min: game?.min ?? game?.MIN ?? 0,
  pts: game?.pts ?? game?.PTS ?? 0,
  ast: game?.ast ?? game?.AST ?? 0,
  reb: game?.reb ?? game?.REB ?? 0,
  blk: game?.blk ?? game?.BLK ?? 0,
  tov: game?.tov ?? game?.TOV ?? 0,
  stl: game?.stl ?? game?.STL ?? 0,
  fg3m: game?.fg3m ?? game?.FG3M ?? 0,
});

const trendNumber = (game, modernKey, legacyKey = modernKey) => {
  const value = game?.[modernKey] ?? game?.[legacyKey];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
};

const buildFallbackPlayerTrends = (currentLogs, playoffLogs) => {
  const games = [...currentLogs, ...playoffLogs]
    .map((game, index) => ({ game, index }))
    .sort((a, b) => {
      const aDate = new Date(a.game?.date ?? a.game?.GAME_DATE ?? 0).getTime();
      const bDate = new Date(b.game?.date ?? b.game?.GAME_DATE ?? 0).getTime();
      const aTimestamp = Number.isNaN(aDate) ? 0 : aDate;
      const bTimestamp = Number.isNaN(bDate) ? 0 : bDate;

      return bTimestamp - aTimestamp || a.index - b.index;
    })
    .map(({ game }) => game);
  const recent = games.slice(0, 10);

  const average = (sample, modernKey, legacyKey) => {
    const values = sample
      .map((game) => trendNumber(game, modernKey, legacyKey))
      .filter((value) => value != null);
    return {
      value: values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null,
      count: values.length,
    };
  };

  const percentage = (sample, madeKey, madeLegacyKey, attemptedKey, attemptedLegacyKey) => {
    const pairs = sample
      .map((game) => [
        trendNumber(game, madeKey, madeLegacyKey),
        trendNumber(game, attemptedKey, attemptedLegacyKey),
      ])
      .filter(([made, attempted]) => (
        made != null && attempted != null && made >= 0 && made <= attempted
      ));
    const attempts = pairs.reduce((sum, [, attempted]) => sum + attempted, 0);
    return {
      value: attempts ? pairs.reduce((sum, [made]) => sum + made, 0) / attempts : null,
      count: pairs.length,
    };
  };

  const statSpecs = {
    minutes: { type: "average", keys: ["min", "MIN"] },
    fouls: { type: "average", keys: ["pf", "PF"] },
    fg_pct: { type: "percentage", keys: ["fgm", "FGM", "fga", "FGA"] },
    fg3_pct: { type: "percentage", keys: ["fg3m", "FG3M", "fg3a", "FG3A"] },
    ft_pct: { type: "percentage", keys: ["ftm", "FTM", "fta", "FTA"] },
  };

  const stats = Object.fromEntries(Object.entries(statSpecs).map(([key, spec]) => {
    const aggregate = spec.type === "percentage" ? percentage : average;
    const last10 = aggregate(recent, ...spec.keys);
    const season = aggregate(games, ...spec.keys);
    const difference = last10.value != null && season.value != null
      ? (last10.value - season.value) * (spec.type === "percentage" ? 100 : 1)
      : null;

    return [key, {
      last10: last10.value,
      season: season.value,
      difference,
      sampleGames: last10.count,
    }];
  }));

  return {
    recentGames: recent.length,
    seasonGames: games.length,
    includesPlayoffs: playoffLogs.length > 0,
    stats,
  };
};

const buildMatchupContext = ({ playerId, player, teamId, opponentId, analytics }) => {
  const source = analytics ?? {};
  const playerAnalytics = source.players?.[String(playerId)] ?? {};
  const team = source.teams?.[String(teamId)] ?? {};
  const opponent = source.teams?.[String(opponentId)] ?? {};
  const { position, matchup } = getPositionMatchup(source, playerId, player?.POSITION, opponentId);
  const teamPace = team.pace ?? null;
  const opponentPace = opponent.pace ?? null;
  const leaguePace = source.leaguePace ?? null;
  const matchupPace = teamPace != null && opponentPace != null
    ? Math.round(((teamPace + opponentPace) / 2) * 10) / 10
    : null;
  const paceDifference = matchupPace != null && leaguePace
    ? Math.round(((matchupPace - leaguePace) / leaguePace) * 1000) / 10
    : null;

  const insights = [];
  if (playerAnalytics.usageRate != null) {
    insights.push(`Usage rate do jogador: ${playerAnalytics.usageRate.toFixed(1)}%.`);
  }
  if (paceDifference != null) {
    insights.push(`Este matchup tem pace ${Math.abs(paceDifference).toFixed(1)}% ${paceDifference >= 0 ? "acima" : "abaixo"} da média da liga.`);
  }
  if (matchup?.assists != null && matchup.leagueAverage?.assists) {
    const difference = ((matchup.assists - matchup.leagueAverage.assists) / matchup.leagueAverage.assists) * 100;
    insights.push(`O adversário permite ${difference >= 0 ? "+" : ""}${difference.toFixed(1)}% assistências a ${position}.`);
  }

  return {
    position,
    usageRate: playerAnalytics.usageRate ?? null,
    playerPace: playerAnalytics.pace ?? null,
    teamPace,
    opponentPace,
    matchupPace,
    leaguePace,
    paceDifference,
    opponentVsPosition: matchup,
    insights,
  };
};

export async function buildPlayerStatsPageData({
  playerId,
  team1Id,
  team2Id,
  stat,
  rawRosterData,
  rawTeams,
  rawGamesSchedule,
  rawInjuries,
  rawTeamStats,
  rawAnalytics,
  playerTrends = null,
  playerLogs,
  playerLogsPrev,
  playerLogsPlayoffs,
  teammateLogBundles = [],
  teammateRoster = [],
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
  const teams = rawTeams ?? {};

  const homeRoster = rosterData.filter((p) => Number(p.TEAM_ID) === team1Id);

  const awayRoster = rosterData.filter((p) => Number(p.TEAM_ID) === team2Id);

  const combinedRoster = [...homeRoster, ...awayRoster];

  const player = combinedRoster.find((p) => p.PLAYER_ID === playerId) ?? null;

  const currentGame =
    gamesSchedule.find(
      (g) => g.home_team_id === team1Id && g.visitor_team_id === team2Id,
    ) ?? null;

  const teamNameMap = Object.entries(teams).reduce((acc, [teamId, team]) => {
    if (team?.name) {
      acc[Number(teamId)] = team.name;
    }
    return acc;
  }, rosterData.reduce((acc, p) => {
    if (p.TEAM_ID && p.TEAM_NAME) {
      acc[Number(p.TEAM_ID)] = p.TEAM_NAME;
    }
    return acc;
  }, {}));

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

  const selectedTeamId = player?.TEAM_ID ?? (homeRoster.some((p) => p.PLAYER_ID === playerId) ? team1Id : team2Id);
  const opponentId = Number(selectedTeamId) === team1Id ? team2Id : team1Id;
  const matchupContext = buildMatchupContext({
    playerId,
    player,
    teamId: selectedTeamId,
    opponentId,
    analytics: rawAnalytics,
  });

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
  const resolvedPlayerTrends = playerTrends ?? buildFallbackPlayerTrends(currentPlayerLogs, playoffPlayerLogs);

  const initialSelectedName = (() => {
    if (playerId) {
      const p = combinedRoster.find(
        (player) => String(player.PLAYER_ID) === String(playerId),
      );
      if (p) return p.PLAYER;
    }

    const roster = homeRoster.length ? homeRoster : awayRoster;
    return (roster.find((p) => p.NUM) || roster[0])?.PLAYER || "";
  })();

  const initialActiveTeam = (() => {
    if (!playerId) return 0;

    return homeRoster.some(
      (player) => String(player.PLAYER_ID) === String(playerId),
    )
      ? 0
      : 1;
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
    matchupContext,
  });
  const graphViews = buildPlayerGraphViews(graphData);
  const statGraphData = buildPlayerGraphStatDataMap(graphViews);
  const gameId = (game) => String(game?.gid ?? game?.GAME_ID ?? "");
  const average = (games, modernKey, legacyKey) => games.length
    ? Math.round((games.reduce((sum, game) => sum + Number(game?.[modernKey] ?? game?.[legacyKey] ?? 0), 0) / games.length) * 10) / 10
    : null;
  const teammateImpact = teammateRoster.map((teammate) => {
    const bundle = teammateLogBundles.find(
      (candidate) => Number(candidate.player?.PLAYER_ID) === Number(teammate.PLAYER_ID),
    );
    const logs = bundle?.logs ?? [];
    const logsPrev = bundle?.logsPrev ?? [];
    const logsPlayoffs = bundle?.logsPlayoffs ?? [];

    return {
      playerId: Number(teammate.PLAYER_ID),
      playerName: teammate.PLAYER,
      position: teammate.POSITION ?? "—",
      avgMinutes: average(logs, "min", "MIN"),
      avgPoints: average(logs, "pts", "PTS"),
      currentGameIds: [...logs, ...logsPlayoffs].map(gameId).filter(Boolean),
      previousGameIds: logsPrev.map(gameId).filter(Boolean),
    };
  });
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
    fgm: game.fgm ?? game.FGM ?? null,
    fga: game.fga ?? game.FGA ?? null,
    fg3_pct: game.fg3_pct ?? game.FG3_PCT ?? null,
    fg3m: game.fg3m ?? game.FG3M ?? null,
    fg3a: game.fg3a ?? game.FG3A ?? null,
    ft_pct: game.ft_pct ?? game.FT_PCT ?? null,
    ftm: game.ftm ?? game.FTM ?? null,
    fta: game.fta ?? game.FTA ?? null,
    fouls: game.pf ?? game.PF ?? null,
  }));

  return {
    player: compactPlayer(player),
    playerStats,
    matchupContext,
    contextGames,
    playerTrends: resolvedPlayerTrends,
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
    availabilityGames: {
      current: currentPlayerLogs.map(compactGameLog),
      previous: previousPlayerLogs.map(compactGameLog),
      playoffs: playoffPlayerLogs.map(compactGameLog),
    },
  };
}
