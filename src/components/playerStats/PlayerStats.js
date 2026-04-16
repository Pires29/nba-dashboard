"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
const TeamRoster = dynamic(() => import("./TeamRoster"), {
  ssr: false,
});
import { useRouter } from "next/navigation";
import UpgradeOverlay from "../UpgradeOverlay";
import MobileLayout from "./layout/MobileLayout";
import DesktopLayout from "./layout/DesktopLayout";
const MobileSheet = dynamic(() => import("./layout/MobileSheet"), {
  ssr: false,
});

const PlayerStats = ({ data, plan, playerId, stat }) => {
  const {
    player,
    playerInfo,
    playerStats,
    playerLogs,
    playerPrev,
    currentGame,
    gamesSchedule,
    teamNameMap,
    opponentAbbr,
    homeRoster,
    awayRoster,
    combinedRoster,
    injuryStatusMap,
    injuriesTeam1,
    injuriesTeam2,
    team1Formatted,
    team2Formatted,
    initialSelectedName,
    initialActiveTeam,
    statGraphData,
    periodOptions,
    contextOptions,
  } = data;
  const router = useRouter();

  const safeHomeRoster = homeRoster ?? [];
  const safeAwayRoster = awayRoster ?? [];
  const safeCombinedRoster = combinedRoster ?? [];

  const [selectedName, setSelectedName] = useState(initialSelectedName);
  const [activeTeam, setActiveTeam] = useState(initialActiveTeam);
  const [isDesktop, setIsDesktop] = useState(false);

  // ── ELEVATED FILTER STATE ──
  // These live here so both the mobile sheet AND PlayerGraph share the same source of truth.
  const [selectedStat, setSelectedStat] = useState(stat || "points");
  const [selectedNumber, setSelectedNumber] = useState(5);
  const [activeFilter, setActiveFilter] = useState(null);

  // ── MOBILE SHEET ──
  const [sheetOpen, setSheetOpen] = useState(false);
  const [pendingStat, setPendingStat] = useState(selectedStat);
  const [pendingNumber, setPendingNumber] = useState(selectedNumber);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const syncViewport = () => {
      const matches = mediaQuery.matches;
      setIsDesktop(matches);
      if (matches) setSheetOpen(false);
    };

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, []);

  const handleSheetOpen = useCallback(() => {
    setPendingStat(selectedStat);
    setPendingNumber(selectedNumber);
    setSheetOpen(true);
  }, [selectedStat, selectedNumber]);

  const handleSheetApply = useCallback(() => {
    setSelectedStat(pendingStat);
    setSelectedNumber(pendingNumber);
    setActiveFilter(null);
    setSheetOpen(false);
  }, [pendingNumber, pendingStat]);

  const handleSelectPlayer = useCallback(
    (player) => {
      setSelectedNumber(5);
      setActiveFilter(null);
      router.push(
        `/playersStats?team1Id=${currentGame?.home_team_id}&team2Id=${currentGame?.visitor_team_id}&playerId=${player.PLAYER_ID}`,
      );
    },
    [router, currentGame?.home_team_id, currentGame?.visitor_team_id],
  );

  const renderRosterContent = (onSelectName) => (
    <>
      {safeHomeRoster.length > 0 && safeAwayRoster.length > 0 && (
        <div className="p-4 pb-3 flex-shrink-0">
          <div className="flex rounded-lg overflow-hidden border border-white/6 bg-[#0D1828]">
            {[
              team1Formatted?.teamName || "Team 1",
              team2Formatted?.teamName || "Team 2",
            ].map((name, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTeam(idx)}
                className={`flex-1 py-2 text-xs font-bold font-condensed tracking-wider uppercase transition-all duration-200
                  ${activeTeam === idx ? "bg-orange-500 text-white shadow-[0_0_12px_rgba(232,93,4,0.3)]" : "text-slate-500 hover:text-slate-300"}`}
              >
                {name.length > 10 ? name.split(" ").pop() : name}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto min-h-0">
        {safeHomeRoster.length > 0 && safeAwayRoster.length > 0 ? (
          activeTeam === 0 ? (
            <TeamRoster
              teamRoster={safeHomeRoster}
              setSelectedName={handleSelectPlayer}
              injuryMap={injuryStatusMap}
              selectedName={selectedName}
            />
          ) : (
            <TeamRoster
              teamRoster={safeAwayRoster}
              setSelectedName={handleSelectPlayer}
              injuryMap={injuryStatusMap}
              selectedName={selectedName}
            />
          )
        ) : plan === "pro" ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
            <p className="text-[12px] font-mono text-slate-400">
              No players available
            </p>
            <p className="text-[10px] font-mono text-slate-600">
              Data could not be loaded
            </p>
          </div>
        ) : (
          <UpgradeOverlay />
        )}
      </div>
    </>
  );

  const handleGameSelect = useCallback(
    (game) => {
      setSelectedNumber(5);
      setActiveFilter(null);
      router.push(
        `/playersStats?team1Id=${game.home_team_id}&team2Id=${game.visitor_team_id}`,
      );
    },
    [router],
  );

  return (
    <div className="flex flex-col h-full lg:overflow-hidden bg-gradient-to-b from-[#0D1B2E] to-[#060E1A] font-sans">
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(26,42,62,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(26,42,62,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* ══════════════════════════════════
          MOBILE LAYOUT
      ══════════════════════════════════ */}
      {!isDesktop && (
        <MobileLayout
          playerRaw={player}
          playerData={player}
          playerInfo={playerInfo}
          playerStats={playerStats}
          playerPrev={playerPrev}
          safeInjuryMap={injuryStatusMap}
          injuriesFilteredTeam1={injuriesTeam1}
          injuriesFilteredTeam2={injuriesTeam2}
          team1Formatted={team1Formatted}
          team2Formatted={team2Formatted}
          selectedStat={selectedStat}
          setSelectedStat={setSelectedStat}
          selectedNumber={selectedNumber}
          setSelectedNumber={setSelectedNumber}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          currentGame={currentGame}
          opponentAbbr={opponentAbbr}
          playerLogs={playerLogs}
          statGraphData={statGraphData}
          periodOptions={periodOptions}
          contextOptions={contextOptions}
        />
      )}

      {/* ── MOBILE TRIGGER BAR ── */}
      {!isDesktop && (
        <button
          aria-label="Open filters"
          onClick={handleSheetOpen}
          className="fixed bottom-6 right-5 z-30 w-12 h-12 rounded-full bg-orange-500 shadow-[0_4px_24px_rgba(232,93,4,0.45)] flex items-center justify-center active:scale-95 transition-transform text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            width={20}
            height={20}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5"
            />
          </svg>
        </button>
      )}

      {/* ── MOBILE BOTTOM SHEET ── */}
      {!isDesktop && sheetOpen && (
        <MobileSheet
          combinedRoster={safeCombinedRoster}
          selectedName={selectedName}
          plan={plan}
          team1Id={currentGame?.home_team_id}
          team2Id={currentGame?.visitor_team_id}
          gamesList={gamesSchedule}
          teamNameMap={teamNameMap}
          sheetOpen={sheetOpen}
          handleSelectPlayer={handleSelectPlayer}
          handleGameSelect={handleGameSelect}
          handleSheetApply={handleSheetApply}
          setSheetOpen={setSheetOpen}
        />
      )}

      {/* ══════════════════════════════════
          DESKTOP LAYOUT
      ══════════════════════════════════ */}
      {isDesktop && (
        <DesktopLayout
          player={player}
          playerData={player}
          playerInfo={playerInfo}
          playerStats={playerStats}
          playerPrev={playerPrev}
          playerLogs={playerLogs}
          selectedName={selectedName}
          injuryMap={injuryStatusMap}
          plan={plan}
          team1Id={currentGame?.home_team_id}
          team2Id={currentGame?.visitor_team_id}
          games={gamesSchedule}
          teamNameMap={teamNameMap}
          team1Formatted={team1Formatted}
          team2Formatted={team2Formatted}
          handleGameSelect={handleGameSelect}
          injuriesTeam1={injuriesTeam1}
          injuriesTeam2={injuriesTeam2}
          renderRosterContent={renderRosterContent}
          setSelectedName={setSelectedName}
          selectedStat={selectedStat}
          setSelectedStat={setSelectedStat}
          selectedNumber={selectedNumber}
          setSelectedNumber={setSelectedNumber}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          currentGame={currentGame}
          opponentAbbr={opponentAbbr}
          statGraphData={statGraphData}
          periodOptions={periodOptions}
          contextOptions={contextOptions}
        />
      )}
    </div>
  );
};

export default PlayerStats;
