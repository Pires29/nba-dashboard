"use client";

import dynamic from "next/dynamic";
import Card from "@/components/ui/playerStats/Card";
import DeferredRender from "@/components/ui/DeferredRender";
import Injuries from "../Injuries";
import PlayerGraphSection from "../PlayerGraphSection";
import PlayerSelectionControls from "../PlayerSelectionControls";
import SectionLabel from "@/components/ui/playerStats/SectionLabel";
import LockedPlayerState from "../LockedPlayerState";

const LockedSection = ({ title }) => (
  <Card accent="orange" className="h-full">
    <div className="p-4">
      <SectionLabel>{title}</SectionLabel>
      <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-white/[0.06] bg-[#060E1A]/60">
        <div className="text-center text-orange-400">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="mx-auto h-6 w-6">
            <rect x="4" y="10" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-widest">
            Player data locked
          </p>
        </div>
      </div>
    </div>
  </Card>
);

const TeamStats = dynamic(() => import("../TeamStats"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[260px] bg-white/[0.02] animate-pulse rounded-xl" />
  ),
});

const ResponsiveLayout = ({
  player,
  playerStats,
  contextGames,
  hasCurrentGames,
  hasPreviousGames,
  hasPlayoffGames,
  injuryMap,
  plan,
  currentGame,
  gamesSchedule,
  teamNameMap,
  homeRoster,
  awayRoster,
  team1Formatted,
  team2Formatted,
  injuriesTeam1,
  injuriesTeam2,
  initialSelectedName,
  initialActiveTeam,
  opponentAbbr,
  statGraphData,
  initialStat,
  isPlayerLocked,
  lockedPlayerName,
}) => {
  return (
    <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-4 sm:px-5 lg:px-6">
      <div className="flex flex-1 flex-col gap-4 py-4 lg:gap-6 lg:py-6">
        <div className="flex min-w-0 flex-col gap-4 lg:gap-6">
          <div className="grid min-w-0 items-stretch gap-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-6">
            <PlayerSelectionControls
              plan={plan}
              currentGame={currentGame}
              gamesSchedule={gamesSchedule}
              teamNameMap={teamNameMap}
              homeRoster={homeRoster}
              awayRoster={awayRoster}
              injuryStatusMap={injuryMap}
              team1Formatted={team1Formatted}
              team2Formatted={team2Formatted}
              initialSelectedName={initialSelectedName}
              initialActiveTeam={initialActiveTeam}
            />

            {isPlayerLocked ? (
              <LockedPlayerState playerName={lockedPlayerName} embedded />
            ) : (
              <PlayerGraphSection
                player={player}
                injuryStatus={injuryMap?.[player?.PLAYER]}
                playerStats={playerStats}
                contextGames={contextGames}
                hasCurrentGames={hasCurrentGames}
                hasPreviousGames={hasPreviousGames}
                hasPlayoffGames={hasPlayoffGames}
                currentGame={currentGame}
                opponentAbbr={opponentAbbr}
                statGraphData={statGraphData}
                initialStat={initialStat}
              />
            )}
          </div>

          <aside className="grid min-w-0 items-start gap-4 lg:grid-cols-2 lg:gap-6">
            {isPlayerLocked ? (
              <>
                <LockedSection title="Injuries & Status" />
                <LockedSection title="Team Comparison" />
              </>
            ) : (
              <><DeferredRender
              rootMargin="300px 0px"
              fallback={
                <Card accent="orange">
                  <div className="min-h-[220px] bg-white/[0.02] p-4 animate-pulse" />
                </Card>
              }
            >
              <Card accent="orange" className="h-full">
                <div className="p-4">
                  <SectionLabel>Injuries &amp; Status</SectionLabel>
                  <Injuries
                    injuriesTeam1={injuriesTeam1}
                    injuriesTeam2={injuriesTeam2}
                  />
                </div>
              </Card>
            </DeferredRender>

            <DeferredRender
              rootMargin="400px 0px"
              fallback={
                <Card accent="blue">
                  <div className="min-h-[260px] bg-white/[0.02] p-4 animate-pulse" />
                </Card>
              }
            >
              <Card accent="blue">
                <div className="p-4">
                  <SectionLabel>Team Comparison</SectionLabel>
                  <TeamStats
                    homeTeamStats={team1Formatted}
                    awayTeamStats={team2Formatted}
                  />
                </div>
              </Card>
            </DeferredRender></>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveLayout;
