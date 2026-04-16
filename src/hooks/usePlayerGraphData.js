import { useMemo } from "react";
import {
  buildGameEntry,
  calcRateStats,
  roundToBettingLine,
} from "@/lib/playerGraphUtils"; // ideal mover helpers depois

export const usePlayerGraphData = ({
  currentGames = [],
  previousGames = [],
  player,
  opponentAbbr,
  selectedStat,
  selectedNumber,
  activeFilter,
}) => {
  // 1. normalize games
  const data = useMemo(() => {
    if (!Array.isArray(currentGames)) return [];

    return currentGames.map((g) =>
      buildGameEntry(g, player?.teamAbbreviation ?? player?.playerTeam),
    );
  }, [currentGames, player?.teamAbbreviation, player?.playerTeam]);

  const dataPrev = useMemo(() => {
    if (!Array.isArray(previousGames)) return [];

    return previousGames.map((g) =>
      buildGameEntry(g, player?.teamAbbreviation ?? player?.playerTeam),
    );
  }, [previousGames, player?.teamAbbreviation, player?.playerTeam]);

  // 2. filters
  const homeData = useMemo(() => data.filter((g) => g.isHome), [data]);

  const awayData = useMemo(() => data.filter((g) => !g.isHome), [data]);

  const h2hData = useMemo(() => {
    if (!opponentAbbr) return [];
    return data.filter((g) => g.opponent?.includes(opponentAbbr));
  }, [data, opponentAbbr]);

  // 3. bet line (exemplo simples)
  const betLine = useMemo(() => {
    const avg =
      data.reduce((acc, g) => acc + (g[selectedStat] || 0), 0) / data.length;
    return roundToBettingLine(avg);
  }, [data, selectedStat]);

  // 4. filtered data
  const dataFiltered = useMemo(() => {
    let base = data;

    if (activeFilter === "HOME") base = homeData;
    if (activeFilter === "AWAY") base = awayData;
    if (activeFilter === "H2H") base = h2hData;
    if (activeFilter === "PREV") base = dataPrev;

    if (selectedNumber && selectedNumber !== "Full") {
      base = base.slice(0, selectedNumber);
    }

    return base;
  }, [
    data,
    homeData,
    awayData,
    h2hData,
    dataPrev,
    activeFilter,
    selectedNumber,
  ]);

  // 5. hit rate
  const hitRate = useMemo(() => {
    if (!betLine || !dataFiltered.length) return null;

    const { rate } = calcRateStats(dataFiltered, selectedStat, betLine);

    return rate;
  }, [dataFiltered, selectedStat, betLine]);

  return {
    data,
    dataPrev,
    homeData,
    awayData,
    h2hData,
    betLine,
    dataFiltered,
    hitRate,
  };
};
