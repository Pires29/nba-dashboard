"use client";

import dynamic from "next/dynamic";
import Card from "@/components/ui/playerStats/Card";
import DeferredRender from "@/components/ui/DeferredRender";
import PlayerInfo from "../PlayerInfo";
import Injuries from "../Injuries";
import PlayerGraphSection from "../PlayerGraphSection";
import PlayerSelectionControls from "../PlayerSelectionControls";
import SectionLabel from "@/components/ui/playerStats/SectionLabel";

const TeamStats = dynamic(() => import("../TeamStats"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[260px] bg-white/[0.02] animate-pulse rounded-xl" />
  ),
});

const ResponsiveLayout = ({
  player,
  playerStats,
  playerLogs,
  playerLogsPrev,
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
}) => {
  return (
    <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 flex-col px-4 lg:min-h-0 lg:px-6">
      <div className="flex flex-1 flex-col gap-4 py-4 lg:min-h-0 lg:gap-5 lg:py-5">
        <div className="sticky top-0 z-20 -mx-4 border-b border-white/[0.08] bg-[#0D1B2E] px-4 lg:static lg:mx-0 lg:border-b-0 lg:bg-transparent lg:px-0">
          <Card accent="orange" className="overflow-hidden border-0 lg:border">
            <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-orange-500 via-amber-400 to-transparent lg:hidden" />
            <PlayerInfo
              playerData={player}
              injuryStatus={injuryMap?.[player?.PLAYER]}
            />
          </Card>
        </div>

        <div className="grid gap-4 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-5">
          <div className="flex flex-col gap-4 lg:min-h-0 lg:gap-5">
            <div className="flex flex-col gap-4 lg:min-h-0 lg:flex-row lg:gap-5">
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

              <PlayerGraphSection
                player={player}
                playerStats={playerStats}
                playerLogs={playerLogs}
                playerLogsPrev={playerLogsPrev}
                currentGame={currentGame}
                opponentAbbr={opponentAbbr}
                statGraphData={statGraphData}
                initialStat={initialStat}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:gap-5">
            <DeferredRender
              rootMargin="300px 0px"
              fallback={
                <Card accent="orange">
                  <div className="min-h-[220px] bg-white/[0.02] p-4 animate-pulse" />
                </Card>
              }
            >
              <Card accent="orange">
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
            </DeferredRender>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveLayout;
