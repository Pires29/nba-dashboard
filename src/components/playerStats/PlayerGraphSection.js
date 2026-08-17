"use client";

import dynamic from "next/dynamic";
import { Suspense, useState } from "react";
import Card from "@/components/ui/playerStats/Card";
import DeferredRender from "@/components/ui/DeferredRender";
import PlayerGraphSkeleton from "@/components/ui/PlayerGraph/PlayerGraphSkeleton";
import PlayerContextGraphSkeleton from "@/components/ui/PlayerGraph/PlayerContextGraphSkeleton";
import PlayerInfo from "./PlayerInfo";

const PlayerGraph = dynamic(() => import("./PlayerGraph"), {
  loading: () => <PlayerGraphSkeleton />,
});

const PlayerContextGraph = dynamic(() => import("./PlayerContextGraph"), {
  ssr: false,
  loading: () => <PlayerContextGraphSkeleton />,
});

const PlayerGraphSection = ({
  player,
  injuryStatus,
  playerStats,
  contextGames,
  hasCurrentGames,
  hasPreviousGames,
  hasPlayoffGames,
  currentGame,
  opponentAbbr,
  statGraphData,
  initialStat = "points",
  logsAvailable = true,
}) => {
  const [selectedStat, setSelectedStat] = useState(initialStat || "points");
  const [selectedNumber, setSelectedNumber] = useState(5);
  const [activeFilter, setActiveFilter] = useState(null);

  return (
    <Card
      className="flex min-w-0 flex-col lg:h-full lg:min-h-0 lg:flex-1"
      accent="orange"
    >
      <div className="flex-shrink-0 border-b border-white/[0.07] bg-white/[0.015]">
        <PlayerInfo
          playerData={player}
          injuryStatus={injuryStatus}
        />
      </div>

      <div className="min-h-[480px] min-w-0 lg:flex lg:min-h-0 lg:w-full lg:flex-1">
        <Suspense fallback={<PlayerGraphSkeleton />}>
          <PlayerGraph
            playerStats={playerStats}
            selectedStat={selectedStat}
            onStatChange={setSelectedStat}
            selectedNumber={selectedNumber}
            onNumberChange={setSelectedNumber}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            gameInfo={currentGame}
            opponentAbbr={opponentAbbr}
            hasCurrentGames={hasCurrentGames}
            hasPreviousGames={hasPreviousGames}
            hasPlayoffGames={hasPlayoffGames}
            statGraphData={statGraphData}
            logsAvailable={logsAvailable}
          />
        </Suspense>
      </div>

      <DeferredRender
        rootMargin="200px 0px"
        fallback={<PlayerContextGraphSkeleton />}
      >
        <Suspense fallback={<PlayerContextGraphSkeleton />}>
          <PlayerContextGraph games={contextGames} />
        </Suspense>
      </DeferredRender>
    </Card>
  );
};

export default PlayerGraphSection;
