import dynamic from "next/dynamic";

const PlayerGraph = dynamic(() => import("../PlayerGraph"), {
  loading: () => <PlayerGraphSkeleton />,
});
const PlayerContextGraph = dynamic(() => import("../PlayerContextGraph"), {
  ssr: false,
  loading: () => <PlayerContextGraphSkeleton />,
});

import SectionLabel from "@/components/ui/playerStats/SectionLabel";
const Injuries = dynamic(() => import("../Injuries"), {
  loading: () => null,
});

const TeamStats = dynamic(() => import("../TeamStats"), {
  loading: () => null,
});
import PlayerContextGraphSkeleton from "@/components/ui/PlayerGraph/PlayerContextGraphSkeleton";
import PlayerGraphSkeleton from "@/components/ui/PlayerGraph/PlayerGraphSkeleton";
import Card from "@/components/ui/playerStats/Card";
import DeferredRender from "@/components/ui/DeferredRender";
import PlayerInfo from "../PlayerInfo";

const MobileLayout = ({
  playerRaw,
  playerData,
  playerInfo,
  playerStats,
  playerPrev,

  injuriesFilteredTeam1,
  injuriesFilteredTeam2,
  safeInjuryMap,

  team1Formatted,
  team2Formatted,

  selectedStat,
  setSelectedStat,
  selectedNumber,
  setSelectedNumber,
  activeFilter,
  setActiveFilter,

  currentGame,
  opponentAbbr,
  playerLogs,

  statGraphData,
  periodOptions,
  contextOptions,
}) => {
  return (
    <div className="lg:hidden flex flex-col flex-1 min-h-0 overflow-auto">
      <div className="sticky top-0 z-20 bg-[#0D1B2E] border-b border-white/[0.08]">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 via-amber-400 to-transparent" />

        <PlayerInfo
          playerData={playerData}
          playerInfo={playerInfo}
          injuryStatus={safeInjuryMap?.[playerData?.PLAYER]}
        />
      </div>

      <div className="px-4 pt-4 pb-4">
        <Card accent="orange" className="flex flex-col">
          <div className="h-px bg-white/[0.05] mx-4 flex-shrink-0" />

          <div className="min-h-[420px] flex-shrink-0">
            <PlayerGraph
              player={playerRaw}
              playerPrev={playerPrev}
              playerStats={playerStats}
              selectedStat={selectedStat}
              onStatChange={setSelectedStat}
              selectedNumber={selectedNumber}
              onNumberChange={setSelectedNumber}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              gameInfo={currentGame}
              opponentAbbr={opponentAbbr}
              playerLogs={playerLogs}
              statGraphData={statGraphData}
              periodOptions={periodOptions}
              contextOptions={contextOptions}
            />
          </div>

          <DeferredRender
            rootMargin="200px 0px"
            fallback={<PlayerContextGraphSkeleton />}
          >
            <PlayerContextGraph
              player={{ games: playerLogs }}
              playerStats={playerStats}
            />
          </DeferredRender>
        </Card>
      </div>

      <div className="px-4 pb-6 flex flex-col gap-4">
        <DeferredRender
          rootMargin="300px 0px"
          fallback={
            <Card accent="orange">
              <div className="p-4 min-h-[220px] animate-pulse bg-white/[0.02]" />
            </Card>
          }
        >
          <Card accent="orange">
            <div className="p-4">
              <SectionLabel>Injuries & Status</SectionLabel>

              <Injuries
                injuriesTeam1={injuriesFilteredTeam1}
                injuriesTeam2={injuriesFilteredTeam2}
              />
            </div>
          </Card>
        </DeferredRender>

        <DeferredRender
          rootMargin="400px 0px"
          fallback={
            <Card accent="blue">
              <div className="p-4 min-h-[260px] animate-pulse bg-white/[0.02]" />
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
  );
};

export default MobileLayout;
