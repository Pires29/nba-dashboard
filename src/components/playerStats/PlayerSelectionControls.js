"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Card from "@/components/ui/playerStats/Card";
import GameSelector from "./selectors/GameSelector";
import PlayerDropdown from "./selectors/PlayerDropdown";
import dynamic from "next/dynamic";

const TeamRoster = dynamic(() => import("./TeamRoster"), {
  ssr: false,
});

const MobileSheet = dynamic(() => import("./layout/MobileSheet"), {
  ssr: false,
});

const PlayerSelectionControls = ({
  plan,
  currentGame,
  gamesSchedule,
  teamNameMap,
  homeRoster,
  awayRoster,
  injuryStatusMap,
  team1Formatted,
  team2Formatted,
  initialSelectedName,
  initialActiveTeam,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [selectedName, setSelectedName] = useState(initialSelectedName);
  const [activeTeam, setActiveTeam] = useState(initialActiveTeam);
  const [sheetOpen, setSheetOpen] = useState(false);

  const safeHomeRoster = useMemo(() => homeRoster ?? [], [homeRoster]);
  const safeAwayRoster = useMemo(() => awayRoster ?? [], [awayRoster]);

  const rosterForDropdown = useMemo(
    () =>
      [...safeHomeRoster, ...safeAwayRoster].map((rosterPlayer) => ({
        ...rosterPlayer,
        _teamLabel: teamNameMap?.[rosterPlayer.TEAM_ID] ?? "Team",
      })),
    [safeHomeRoster, safeAwayRoster, teamNameMap],
  );

  const handleSelectPlayer = useCallback(
    (selectedPlayer) => {
      if (!selectedPlayer?.PLAYER_ID) return;
      setSelectedName(selectedPlayer.PLAYER);
      setSheetOpen(false);
      const stat = searchParams.get("stat") ?? "points";
      startTransition(() => router.push(
        `/playersStats?team1Id=${currentGame?.home_team_id}&team2Id=${currentGame?.visitor_team_id}&playerId=${selectedPlayer.PLAYER_ID}&stat=${stat}`,
      ));
    },
    [router, searchParams, currentGame?.home_team_id, currentGame?.visitor_team_id],
  );

  const handleGameSelect = useCallback(
    (game) => {
      if (!game) return;
      setSheetOpen(false);
      startTransition(() => router.push(
        `/playersStats?team1Id=${game.home_team_id}&team2Id=${game.visitor_team_id}`,
      ));
    },
    [router],
  );

  const desktopRoster = activeTeam === 0 ? safeHomeRoster : safeAwayRoster;

  return (
    <>
      <Card
        accent="orange"
        className="hidden lg:flex lg:h-full lg:min-h-0 lg:flex-col"
      >
        <div className="p-4 pb-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-slate-400">Game</p>
            <span aria-live="polite" className={`text-[9px] font-mono text-orange-300 ${isPending ? "opacity-100" : "opacity-0"}`}>Updating…</span>
          </div>
          <GameSelector
            plan={plan}
            team1Id={currentGame?.home_team_id}
            team2Id={currentGame?.visitor_team_id}
            games={gamesSchedule}
            teams={teamNameMap}
            onSelect={handleGameSelect}
            disabled={isPending}
          />
        </div>

        {safeHomeRoster.length > 0 && safeAwayRoster.length > 0 && (
          <div className="px-4 pb-3">
            <div className="flex overflow-hidden rounded-lg border border-white/[0.07] bg-[#0D1828] p-1">
              {[
                team1Formatted?.teamName ||
                  teamNameMap?.[currentGame?.home_team_id] ||
                  "Team 1",
                team2Formatted?.teamName ||
                  teamNameMap?.[currentGame?.visitor_team_id] ||
                  "Team 2",
              ].map((name, idx) => (
                <button
                  key={name}
                  onClick={() => setActiveTeam(idx)}
                  className={`min-w-0 flex-1 rounded-md px-2 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                    activeTeam === idx
                      ? "bg-orange-500 text-white"
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                  }`}
                >
                  <span className="block truncate">
                    {name.length > 10 ? name.split(" ").pop() : name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div aria-busy={isPending} className={`flex-1 border-t border-white/[0.05] ${isPending ? "pointer-events-none opacity-60" : ""}`}>
          <TeamRoster
            teamRoster={desktopRoster}
            setSelectedName={handleSelectPlayer}
            injuryMap={injuryStatusMap}
            selectedName={selectedName}
          />
        </div>
      </Card>

      <button
        aria-label="Open filters"
        onClick={() => setSheetOpen(true)}
        disabled={isPending}
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
          setSheetOpen={setSheetOpen}
        />
      )}
    </>
  );
};

export default PlayerSelectionControls;
