"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/playerStats/Card";
import GameSelector from "./selectors/GameSelector";
import MobileSheet from "./layout/MobileSheet";

const TeamRoster = dynamic(() => import("./TeamRoster"), {
  ssr: false,
});

const UpgradeOverlay = dynamic(() => import("../UpgradeOverlay"), {
  ssr: false,
});

const PlayerSelectionControls = ({
  plan,
  currentGame,
  gamesSchedule,
  teamNameMap,
  homeRoster,
  awayRoster,
  combinedRoster,
  injuryStatusMap,
  team1Formatted,
  team2Formatted,
  initialSelectedName,
  initialActiveTeam,
}) => {
  const router = useRouter();
  const [selectedName, setSelectedName] = useState(initialSelectedName);
  const [activeTeam, setActiveTeam] = useState(initialActiveTeam);
  const [sheetOpen, setSheetOpen] = useState(false);

  const safeHomeRoster = homeRoster ?? [];
  const safeAwayRoster = awayRoster ?? [];

  const rosterForDropdown = useMemo(
    () =>
      (combinedRoster ?? []).map((rosterPlayer) => ({
        ...rosterPlayer,
        _teamLabel: teamNameMap?.[rosterPlayer.TEAM_ID] ?? "Team",
      })),
    [combinedRoster, teamNameMap],
  );

  const handleSelectPlayer = useCallback(
    (selectedPlayer) => {
      if (!selectedPlayer?.PLAYER_ID) return;
      setSelectedName(selectedPlayer.PLAYER);
      router.push(
        `/playersStats?team1Id=${currentGame?.home_team_id}&team2Id=${currentGame?.visitor_team_id}&playerId=${selectedPlayer.PLAYER_ID}`,
      );
    },
    [router, currentGame?.home_team_id, currentGame?.visitor_team_id],
  );

  const handleGameSelect = useCallback(
    (game) => {
      if (!game) return;

      router.push(
        `/playersStats?team1Id=${game.home_team_id}&team2Id=${game.visitor_team_id}`,
      );
    },
    [router],
  );

  const desktopRoster = activeTeam === 0 ? safeHomeRoster : safeAwayRoster;

  return (
    <>
      <Card
        accent="orange"
        className="hidden lg:flex lg:min-h-0 lg:w-[300px] lg:flex-shrink-0 lg:flex-col"
      >
        <div className="flex-shrink-0 px-4 pt-4">
          <GameSelector
            plan={plan}
            team1Id={currentGame?.home_team_id}
            team2Id={currentGame?.visitor_team_id}
            games={gamesSchedule}
            teams={teamNameMap}
          />
        </div>

        {safeHomeRoster.length > 0 && safeAwayRoster.length > 0 && (
          <div className="flex-shrink-0 p-4 pb-3">
            <div className="flex overflow-hidden rounded-lg border border-white/6 bg-[#0D1828]">
              {[
                team1Formatted?.teamName || "Team 1",
                team2Formatted?.teamName || "Team 2",
              ].map((name, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTeam(idx)}
                  className={`flex-1 py-2 text-xs font-bold font-condensed uppercase tracking-wider transition-all duration-200 ${
                    activeTeam === idx
                      ? "bg-orange-500 text-white shadow-[0_0_12px_rgba(232,93,4,0.3)]"
                      : "text-slate-400 hover:text-slate-300"
                  }`}
                >
                  {name.length > 10 ? name.split(" ").pop() : name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto">
          {safeHomeRoster.length > 0 && safeAwayRoster.length > 0 ? (
            <TeamRoster
              teamRoster={desktopRoster}
              setSelectedName={handleSelectPlayer}
              injuryMap={injuryStatusMap}
              selectedName={selectedName}
            />
          ) : plan === "pro" ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
              <p className="text-[12px] font-mono text-slate-400">
                No players available
              </p>
              <p className="text-[10px] font-mono text-slate-400">
                Data could not be loaded
              </p>
            </div>
          ) : (
            <UpgradeOverlay />
          )}
        </div>
      </Card>

      <button
        aria-label="Open filters"
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-6 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white shadow-[0_4px_24px_rgba(232,93,4,0.45)] transition-transform active:scale-95 lg:hidden"
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

      {sheetOpen && (
        <MobileSheet
          combinedRoster={rosterForDropdown}
          selectedName={selectedName}
          injuryMap={injuryStatusMap}
          plan={plan}
          team1Id={currentGame?.home_team_id}
          team2Id={currentGame?.visitor_team_id}
          gamesList={gamesSchedule}
          teamNameMap={teamNameMap}
          sheetOpen={sheetOpen}
          handleSelectPlayer={handleSelectPlayer}
          handleGameSelect={handleGameSelect}
          handleSheetApply={() => setSheetOpen(false)}
          setSheetOpen={setSheetOpen}
        />
      )}
    </>
  );
};

export default PlayerSelectionControls;
