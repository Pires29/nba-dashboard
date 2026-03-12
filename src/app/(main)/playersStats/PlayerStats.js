"use client";

import getPlayerLogs from "@/lib/getPlayerLogs";
import getRosters from "@/lib/getRosters";
import getStats from "@/lib/getStats";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import PlayerGraph from "./playerGraph/page";
import { calcAvg } from "@/lib/calcAvg";
import { Box, MenuItem, Select, Tab, Tabs } from "@mui/material";
import TeamRoster from "./TeamRoster";
import PlayerInfo from "./PlayerInfo";
import Injuries from "./Injuries";
import getInjuries from "@/lib/getInjuries";
import getTeamStats from "@/lib/getTeamStats";
import TeamStats from "./TeamStats";
import getGamesSchedule from "@/lib/getGamesSchedule";
import getStandings from "@/lib/getStandings";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const STATS_TO_CALC = [
  "points",
  "assists",
  "rebounds",
  "blocks",
  "turnovers",
  "steals",
];

const formatTeamStats = (teamStats) => {
  if (!teamStats?.offense || !teamStats?.defense) return null;

  return {
    teamID: teamStats.TEAM_ID,
    teamName: teamStats.TEAM_NAME,
    offense: {
      Points: {
        value: teamStats.offense.PTS,
        rank: teamStats.offense.PTS_RANK,
      },
      Assists: {
        value: teamStats.offense.AST,
        rank: teamStats.offense.AST_RANK,
      },
      Rebounds: {
        value: teamStats.offense.REB,
        rank: teamStats.offense.REB_RANK,
      },
      "2P%": {
        value: teamStats.offense.FG2_PCT,
        rank: teamStats.offense.FG2_PCT_RANK,
      },
      "3P%": {
        value: teamStats.offense.FG3_PCT,
        rank: teamStats.offense.FG3_PCT_RANK,
      },
      "FG%": {
        value: teamStats.offense.FG_PCT,
        rank: teamStats.offense.FG_PCT_RANK,
      },
      OffensiveRebounds: {
        value: teamStats.offense.OREB,
        rank: teamStats.offense.OREB_RANK,
      },
      DefensiveRebounds: {
        value: teamStats.offense.DREB,
        rank: teamStats.offense.DREB_RANK,
      },
    },
    defense: {
      OppPoints: {
        label: "Points Allowed",
        value: teamStats.defense.OPP_PTS,
        rank: teamStats.defense.OPP_PTS_RANK,
      },
      OppAssists: {
        label: "Assists Allowed",
        value: teamStats.defense.OPP_AST,
        rank: teamStats.defense.OPP_AST_RANK,
      },
      OppRebounds: {
        label: "Rebounds Allowed",
        value: teamStats.defense.OPP_REB,
        rank: teamStats.defense.OPP_REB_RANK,
      },
      "Opp 2P%": {
        label: "2P% Allowed",
        value: teamStats.defense.OPP_FG2_PCT,
        rank: teamStats.defense.OPP_FG2_PCT_RANK,
      },
      "Opp 3P%": {
        label: "3P% Allowed",
        value: teamStats.defense.OPP_FG3_PCT,
        rank: teamStats.defense.OPP_FG3_PCT_RANK,
      },
      "Opp FG%": {
        label: "FG% Allowed",
        value: teamStats.defense.OPP_FG_PCT,
        rank: teamStats.defense.OPP_FG_PCT_RANK,
      },
      OppOffensiveRebounds: {
        label: "OREB Allowed",
        value: teamStats.defense.OPP_OREB,
        rank: teamStats.defense.OPP_OREB_RANK,
      },
      OppDefensiveRebounds: {
        label: "DREB Allowed",
        value: teamStats.defense.OPP_DREB,
        rank: teamStats.defense.OPP_DREB_RANK,
      },
    },
  };
};

const PlayerStats = ({ plan }) => {
  console.log("PlayerStats renderizou");
  const searchParams = useSearchParams();
  const team1 = searchParams.get("team1");
  const team2 = searchParams.get("team2");

  const rosterData = useMemo(() => getRosters(), []);
  const stats = useMemo(() => getStats(), []);
  const playerLogs = useMemo(() => getPlayerLogs(), []);
  const injuries = useMemo(() => getInjuries(), []);
  const teamStats = useMemo(() => getTeamStats(), []);

  const homeRoster = useMemo(
    () => rosterData.filter((team) => team.TEAM_NAME === team1),
    [rosterData, team1],
  );

  const awayRoster = useMemo(
    () => rosterData.filter((team) => team.TEAM_NAME === team2),
    [rosterData, team2],
  );

  const team1ID = useMemo(() => homeRoster[0]?.TEAM_ID, [homeRoster]);
  const team2ID = useMemo(() => awayRoster[0]?.TEAM_ID, [awayRoster]);

  const homeTeamStats = teamStats.find((team) => team.TEAM_ID === team1ID);
  const awayTeamStats = teamStats.find((team) => team.TEAM_ID === team2ID);

  const team1Formatted = formatTeamStats(homeTeamStats);
  const team2Formatted = formatTeamStats(awayTeamStats);

  const injuriesFilteredTeam1 = injuries.find(
    (team) => team.TeamID === team1ID,
  );

  const injuriesFilteredTeam2 = injuries.find(
    (team) => team.TeamID === team2ID,
  );

  const [selectedName, setSelectedName] = useState(homeRoster[0]?.PLAYER || "");

  const playerData = useMemo(
    () => rosterData.find((player) => player.PLAYER === selectedName),
    [rosterData, selectedName],
  );

  const playerInfo = useMemo(() => {
    if (!playerData) return [];
    return [
      {
        key: "Birth Date",
        value: playerData.BIRTH_DATE,
      },
      {
        key: "Height",
        value: playerData.HEIGHT,
      },
      {
        key: "Jersey",
        value: playerData.NUM,
      },
      {
        key: "Name",
        value: playerData.PLAYER,
      },
      {
        key: "Position",
        value: playerData.POSITION,
      },
      {
        key: "Team Abbreviation",
        value: playerData.TEAM_ABBREVIATION,
      },
      {
        key: "Team ID",
        value: playerData.TEAM_ID,
      },
      {
        key: "Player ID",
        value: playerData.PLAYER_ID,
      },
      {
        key: "Weight",
        value: playerData.WEIGHT,
      },
    ];
  });

  const player = useMemo(() => {
    const found = playerLogs.find((p) => p.player_name === selectedName);
    if (!found) console.log("Não encontrado:", JSON.stringify(selectedName));
    return found;
  }, [playerLogs, selectedName]);

  const playerStats = useMemo(() => {
    const player = stats.find((p) => p.name === selectedName);
    if (!player)
      console.log("❌ stats não encontrado:", JSON.stringify(selectedName));

    if (!player) return null;

    const baseStats = Object.fromEntries(
      STATS_TO_CALC.map((stat) => [stat, calcAvg(player[stat], player.games)]),
    );

    const derivedStats = {
      pra: baseStats.points + baseStats.assists + baseStats.rebounds,
      pa: baseStats.points + baseStats.assists,
      pr: baseStats.points + baseStats.rebounds,
      ra: baseStats.rebounds + baseStats.assists,
    };

    return {
      playerName: player.name,
      playerTeam: player.team,
      stats: {
        ...baseStats,
        ...derivedStats,
      },
    };
  }, [stats, selectedName]);

  const [activeTeam, setActiveteam] = useState(0);

  useEffect(() => {
    if (!homeRoster.length) return;
    const roster = activeTeam === 0 ? homeRoster : awayRoster;
    setSelectedName(roster[0].PLAYER);
  }, [team1ID, team2ID, activeTeam]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D1B2E] to-[#060E1A] font-sans">
      {/* ── Subtle grid texture overlay ── */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(26,42,62,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(26,42,62,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── GAME HEADER STRIP ── */}
      <div className="relative border-b border-white/[0.06] bg-gradient-to-b from-[#122040] to-[#0D1828]">
        {/* Orange accent top border */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 via-amber-400 to-transparent" />

        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between gap-6 flex-wrap">
          {/* Matchup display */}
          <div className="flex items-center gap-5">
            {/* Team 1 */}
            <div className="flex items-center gap-3">
              <div className="w-15 h-15 flex items-center justify-center">
                <img
                  src={`https://cdn.nba.com/logos/nba/${team1ID}/global/L/logo.svg`}
                  alt={team1Formatted?.teamName}
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
              <div>
                <p className="font-condensed font-black text-xl uppercase tracking-wide text-white leading-none">
                  {team1Formatted?.teamName || "Team 1"}
                </p>
                <p className="text-[10px] font-mono text-slate-500">
                  {team1Formatted?.record || "—"}
                </p>
              </div>
            </div>

            {/* VS divider */}
            <div className="flex flex-col items-center px-2">
              <span className="font-condensed font-black text-2xl text-[#1E3A5A] tracking-widest">
                VS
              </span>
              <div className="text-[9px] font-mono text-slate-600 mt-0.5">
                {team1Formatted?.gameTime || "8:00 PM ET"}
              </div>
            </div>

            {/* Team 2 */}
            <div className="flex items-center gap-3">
              <div className="w-15 h-15 flex items-center justify-center">
                <img
                  src={`https://cdn.nba.com/logos/nba/${team2ID}/global/L/logo.svg`}
                  alt={team2Formatted?.teamName}
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
              <div>
                <p className="font-condensed font-black text-xl uppercase tracking-wide text-white leading-none">
                  {team2Formatted?.teamName || "Team 2"}
                </p>
                <p className="text-[10px] font-mono text-slate-500">
                  {team2Formatted?.record || "—"}
                </p>
              </div>
            </div>

            {/* Odds chips */}
            <div className="flex gap-1.5 ml-3">
              {[team1Formatted?.spread, team1Formatted?.ou]
                .filter(Boolean)
                .map((chip, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded bg-[#0D1828] border border-[#1E3A5A] font-mono text-[10px] text-slate-400"
                  >
                    {chip}
                  </span>
                ))}
            </div>
          </div>

          {/* Game selector */}
          <GameSelector />
        </div>
      </div>

      {/* ── 3-COLUMN LAYOUT ── */}
      {/* ── 3-COLUMN LAYOUT ── */}
      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        <div className="grid grid-cols-[300px_1fr_300px] gap-5 h-full py-5">
          {/* ── COL 1: PLAYER LIST ── */}
          <Card accent="orange" className="flex flex-col min-h-0">
            <div className="p-4 pb-3 flex-shrink-0">
              <div className="flex rounded-lg overflow-hidden border border-white/[0.06] bg-[#0D1828]">
                {[
                  team1Formatted?.teamName || "Team 1",
                  team2Formatted?.teamName || "Team 2",
                ].map((name, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveteam(idx)}
                    className={`
                flex-1 py-2 text-xs font-bold font-condensed tracking-wider uppercase
                transition-all duration-200
                ${
                  activeTeam === idx
                    ? "bg-orange-500 text-white shadow-[0_0_12px_rgba(232,93,4,0.3)]"
                    : "text-slate-500 hover:text-slate-300"
                }
              `}
                  >
                    {name.length > 10 ? name.split(" ").pop() : name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              {activeTeam === 0 && (
                <TeamRoster
                  teamRoster={homeRoster}
                  setSelectedName={setSelectedName}
                  plan={plan}
                />
              )}
              {activeTeam === 1 && (
                <TeamRoster
                  teamRoster={awayRoster}
                  setSelectedName={setSelectedName}
                  plan={plan}
                />
              )}
            </div>
          </Card>

          {/* ── COL 2: CHART + PLAYER INFO ── */}
          <Card accent="orange" className="flex flex-col min-h-0">
            <PlayerInfo playerData={playerData} playerInfo={playerInfo} />
            <div className="h-px bg-white/[0.05] mx-4 flex-shrink-0" />
            <PlayerGraph
              player={player}
              playerStats={playerStats}
              plan={plan}
            />
          </Card>

          {/* ── COL 3: INJURIES + TEAM STATS ── */}
          <div className="flex flex-col gap-5 min-h-0 overflow-y-auto">
            <Card accent="orange" className="flex-shrink-0">
              <div className="p-4">
                <SectionLabel>Injuries &amp; Status</SectionLabel>
                <Injuries
                  injuriesTeam1={injuriesFilteredTeam1}
                  injuriesTeam2={injuriesFilteredTeam2}
                />
              </div>
            </Card>
            <Card accent="blue" className="flex-shrink-0">
              <div className="p-4">
                <SectionLabel>Team Comparison</SectionLabel>
                <TeamStats
                  homeTeamStats={team1Formatted}
                  awayTeamStats={team2Formatted}
                  plan={plan}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const GameSelector = () => {
  const router = useRouter();
  const games = getGamesSchedule();
  const teams = getStandings();

  const [selectedGame, setSelectedGame] = useState("");

  if (!games?.length || !teams?.length) {
    return <p>Loading games...</p>;
  }

  const teamMap = teams.reduce((acc, team) => {
    acc[team.TeamID] = team.TeamName;
    return acc;
  }, {});

  console.log("teamMap", teamMap);
  console.log("teams", teams);

  const handleChange = (e) => {
    const value = e.target.value;
    setSelectedGame(value);

    const game = games.find(
      (g) => `${g.date}-${g.home_team_id}-${g.visitor_team_id}` === value,
    );

    if (!game) return;

    const home = teamMap[game.home_team_id];
    const away = teamMap[game.visitor_team_id];

    router.push(`/playersStats?team1=${home}&team2=${away}`);
  };

  return (
    <div>
      <p>Game Selector</p>

      <Select fullWidth value={selectedGame} onChange={handleChange}>
        <MenuItem value="">Select a game</MenuItem>

        {games.map((game) => {
          const home = teamMap[game.home_team_id] || "Unknown";
          const away = teamMap[game.visitor_team_id] || "Unknown";

          const gameId = `${game.date}-${game.home_team_id}-${game.visitor_team_id}`;

          return (
            <MenuItem key={gameId} value={gameId}>
              {home} vs {away}
            </MenuItem>
          );
        })}
      </Select>
    </div>
  );
};

const Card = ({ children, className = "", accent = "orange" }) => {
  const accentMap = {
    orange: "from-orange-500",
    blue: "from-blue-500",
    emerald: "from-emerald-500",
    violet: "from-violet-500",
  };
  return (
    <div
      className={`relative rounded-xl border border-white/[0.06] bg-gradient-to-b from-[#162035] to-[#0F1828] shadow-[0_4px_24px_rgba(0,0,0,0.4)] overflow-hidden ${className}`}
    >
      {/* Top accent line */}
      <div
        className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${accentMap[accent]} to-transparent`}
      />
      {children}
    </div>
  );
};

const SectionLabel = ({ children }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="w-1 h-5 rounded-sm bg-orange-500" />
    <span className="font-condensed text-[11px] font-bold tracking-[0.18em] text-slate-400 uppercase">
      {children}
    </span>
    <div className="flex-1 h-px bg-white/[0.06]" />
  </div>
);

export default PlayerStats;
