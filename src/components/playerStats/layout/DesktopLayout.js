import dynamic from "next/dynamic";
import Card from "@/components/ui/playerStats/Card";
import PlayerInfo from "../PlayerInfo";
import GameSelector from "../selectors/GameSelector";
import PlayerGraphSkeleton from "@/components/ui/PlayerGraph/PlayerGraphSkeleton";
import PlayerContextGraphSkeleton from "@/components/ui/PlayerGraph/PlayerContextGraphSkeleton";
const PlayerGraph = dynamic(() => import("../PlayerGraph"), {
  ssr: false,
  loading: () => <PlayerGraphSkeleton />,
});

const PlayerContextGraph = dynamic(() => import("../PlayerContextGraph"), {
  ssr: false,
  loading: () => <PlayerContextGraphSkeleton />,
});
import { Suspense } from "react";
const Injuries = dynamic(() => import("../Injuries"));
const TeamStats = dynamic(() => import("../TeamStats"));
import SectionLabel from "@/components/ui/playerStats/SectionLabel";
import DeferredRender from "@/components/ui/DeferredRender";

const DesktopLayout = ({
  player,
  playerData,
  playerInfo,
  playerStats,
  playerPrev,
  playerLogs,

  selectedName,
  injuryMap,

  plan,
  team1Id,
  team2Id,
  games,
  teamNameMap,
  team1Formatted,
  team2Formatted,
  handleGameSelect,
  injuriesTeam1,
  injuriesTeam2,
  renderRosterContent,
  setSelectedName,

  selectedStat,
  setSelectedStat,
  selectedNumber,
  setSelectedNumber,
  activeFilter,
  setActiveFilter,

  currentGame,
  opponentAbbr,

  statGraphData,
  periodOptions,
  contextOptions,
}) => {
  return (
    <div className="hidden lg:flex w-full max-w-[1400px] mx-auto px-6 relative z-10 lg:flex-1 lg:min-h-0 lg:overflow-hidden">
      <div className="grid grid-cols-[1fr_300px] gap-5 w-full min-h-0 py-5">
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-5 min-h-0 overflow-hidden">
          {/* PLAYER INFO */}
          <Card accent="orange" className="flex-shrink-0">
            <PlayerInfo
              playerData={playerData}
              playerInfo={playerInfo}
              injuryStatus={injuryMap?.[selectedName]}
            />
          </Card>

          <div className="flex gap-5 flex-1 min-h-0 overflow-hidden">
            {/* GAME + ROSTER */}
            <Card
              accent="orange"
              className="flex flex-col min-h-0 w-[300px] flex-shrink-0"
            >
              <div className="px-4 pt-4 flex-shrink-0">
                <GameSelector
                  plan={plan}
                  team1Id={team1Id}
                  team2Id={team2Id}
                  games={games}
                  teams={teamNameMap}
                  onSelect={handleGameSelect}
                />
              </div>

              {renderRosterContent(setSelectedName)}
            </Card>

            {/* GRAPH */}
            <Card
              accent="orange"
              className="flex flex-col flex-1 min-h-0 overflow-y-auto"
            >
              <div className="min-h-[420px] flex-shrink-0">
                <Suspense fallback={<PlayerGraphSkeleton />}>
                  <PlayerGraph
                    player={player}
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
                </Suspense>
              </div>

              <DeferredRender
                rootMargin="200px 0px"
                fallback={<PlayerContextGraphSkeleton />}
              >
                <Suspense fallback={<PlayerContextGraphSkeleton />}>
                  <PlayerContextGraph
                    player={{ games: playerLogs }}
                    playerStats={playerStats}
                  />
                </Suspense>
              </DeferredRender>
            </Card>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-5 min-h-0 overflow-y-auto">
          <Card accent="orange" className="flex-shrink-0">
            <div className="p-4">
              <SectionLabel>Injuries &amp; Status</SectionLabel>
              <Injuries
                injuriesTeam1={injuriesTeam1}
                injuriesTeam2={injuriesTeam2}
              />
            </div>
          </Card>

          <Card accent="blue" className="flex-shrink-0">
            <div className="p-4">
              <SectionLabel>Team Comparison</SectionLabel>
              <TeamStats
                homeTeamStats={team1Formatted}
                awayTeamStats={team2Formatted}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DesktopLayout;
