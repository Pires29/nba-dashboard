"use client";

import dynamic from "next/dynamic";
import { Suspense, useState } from "react";
import Card from "@/components/ui/playerStats/Card";
import DeferredRender from "@/components/ui/DeferredRender";
import PlayerGraphSkeleton from "@/components/ui/PlayerGraph/PlayerGraphSkeleton";
import PlayerContextGraphSkeleton from "@/components/ui/PlayerGraph/PlayerContextGraphSkeleton";

const PlayerGraph = dynamic(() => import("./PlayerGraph"), {
  loading: () => <PlayerGraphSkeleton />,
});

const PlayerContextGraph = dynamic(() => import("./PlayerContextGraph"), {
  ssr: false,
  loading: () => <PlayerContextGraphSkeleton />,
});

const PlayerGraphSection = ({
  player,
  playerPrev,
  playerStats,
  playerLogs,
  currentGame,
  opponentAbbr,
  statGraphData,
  periodOptions,
  contextOptions,
  initialStat = "points",
}) => {
  const [selectedStat, setSelectedStat] = useState(initialStat || "points");
  const [selectedNumber, setSelectedNumber] = useState(5);
  const [activeFilter, setActiveFilter] = useState(null);

  return (
    <Card className="flex flex-col" accent="orange">
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
  );
};

export default PlayerGraphSection;
