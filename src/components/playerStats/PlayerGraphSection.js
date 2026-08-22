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
  teammateImpact = [],
  availabilityGames,
  minuteSliderMax,
  rangeMinMinutes,
  rangeMaxMinutes,
  setRangeMinMinutes,
  setRangeMaxMinutes,
  maxTeammates,
  selectedTeammates,
  selectedTeammateIds,
  teammateModes,
  setTeammateModes,
  onTeammateChange,
  onRemoveTeammate,
  onClearTeammates,
}) => {
  const [selectedStat, setSelectedStat] = useState(initialStat || "points");
  const [selectedNumber, setSelectedNumber] = useState(5);
  const [activeFilter, setActiveFilter] = useState(null);
  const [teammateFilter, setTeammateFilter] = useState(null);
  const selectedViewKey =
    activeFilter ?? (selectedNumber === "Full" ? "FULL" : `L${selectedNumber}`);
  const selectedStatGraphData =
    statGraphData?.[selectedStat] ?? statGraphData?.points ?? null;
  const selectedChartData =
    selectedStatGraphData?.chartByViewKey?.[selectedViewKey] ?? null;
  const selectedBetLine = selectedStatGraphData?.betLine ?? null;
  const selectedHitRate =
    selectedStatGraphData?.rateByViewKey?.[selectedViewKey]?.rate ?? null;
  const selectedGames = selectedChartData?.points?.length ?? 0;
  const lineSummary = {
    rawBetLine: selectedBetLine,
    betLine: selectedBetLine != null ? selectedBetLine.toFixed(1) : "—",
    hitRate:
      selectedGames && selectedBetLine != null && selectedHitRate != null
        ? `${selectedHitRate}%`
        : "—%",
    hitRateClassName:
      selectedHitRate == null || !selectedGames
        ? "text-white"
        : selectedHitRate >= 50
          ? "text-emerald-400"
          : "text-red-400",
    games: selectedGames,
  };

  return (
    <Card
      className="flex min-w-0 flex-col lg:min-h-0"
      accent="orange"
    >
      <div className="flex-shrink-0 border-b border-white/[0.07] bg-white/[0.015]">
        <PlayerInfo
          playerData={player}
          playerStats={playerStats}
          injuryStatus={injuryStatus}
          selectedStat={selectedStat}
          lineSummary={lineSummary}
          gameInfo={currentGame}
        />
      </div>

      <div className="min-w-0 md:min-h-[480px] lg:flex lg:min-h-0 lg:w-full lg:flex-1">
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
            onTeammateChange={(playerId) => {
              onTeammateChange(playerId);
              setTeammateFilter(null);
            }}
            onRemoveTeammate={(playerId) => {
              onRemoveTeammate(playerId);
              setTeammateFilter(null);
            }}
            onClearTeammates={() => {
              onClearTeammates();
              setTeammateFilter(null);
            }}
            teammateFilter={teammateFilter}
            onTeammateFilterChange={setTeammateFilter}
            logsAvailable={logsAvailable}
            minuteSliderMax={minuteSliderMax}
            rangeMinMinutes={rangeMinMinutes}
            rangeMaxMinutes={rangeMaxMinutes}
            setRangeMinMinutes={setRangeMinMinutes}
            setRangeMaxMinutes={setRangeMaxMinutes}
            maxTeammates={maxTeammates}
            teammateModes={teammateModes}
            setTeammateModes={setTeammateModes}
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
