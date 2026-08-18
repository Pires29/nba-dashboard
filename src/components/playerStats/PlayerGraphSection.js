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

const MAX_TEAMMATES = 3;

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
  teammateImpact = [],
  availabilityGames,
}) => {
  const [selectedStat, setSelectedStat] = useState(initialStat || "points");
  const [selectedNumber, setSelectedNumber] = useState(5);
  const [activeFilter, setActiveFilter] = useState(null);
  const [selectedTeammateIds, setSelectedTeammateIds] = useState([]);
  const [teammateFilter, setTeammateFilter] = useState(null);
  const selectedTeammates = teammateImpact.filter(
    (entry) => selectedTeammateIds.includes(String(entry.playerId)),
  );

  const handleTeammateChange = (playerId) => {
    if (!playerId || selectedTeammateIds.length >= MAX_TEAMMATES) return;
    setSelectedTeammateIds((ids) =>
      ids.includes(playerId) ? ids : [...ids, playerId],
    );
    setTeammateFilter(null);
  };
  const removeTeammate = (playerId) => {
    setSelectedTeammateIds((ids) => ids.filter((id) => id !== playerId));
    setTeammateFilter(null);
  };
  const clearTeammates = () => {
    setSelectedTeammateIds([]);
    setTeammateFilter(null);
  };

  return (
    <Card
      className="flex min-w-0 flex-col lg:min-h-0"
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
            teammateImpact={teammateImpact}
            availabilityGames={availabilityGames}
            selectedTeammates={selectedTeammates}
            selectedTeammateIds={selectedTeammateIds}
            onTeammateChange={handleTeammateChange}
            onRemoveTeammate={removeTeammate}
            onClearTeammates={clearTeammates}
            teammateFilter={teammateFilter}
            onTeammateFilterChange={setTeammateFilter}
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
