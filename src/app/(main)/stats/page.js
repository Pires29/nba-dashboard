import getStats from "@/lib/getStats";
import { calcAvg } from "@/lib/calcAvg";
import Table from "./customTable/page";

const Stats = () => {
  const stats = getStats();

  const STATS_TO_CALC = [
    "points",
    "assists",
    "rebounds",
    "blocks",
    "turnovers",
    "steals",
  ];

  const playerInfo = stats.map((player) => {
    return {
      playerName: player.name,
      playerTeam: player.team,
      stats: Object.fromEntries(
        STATS_TO_CALC.map((stat) => [stat, calcAvg(player[stat], player.games)])
      ),
    };
  });

  return (
    <div>
      <h1>Stats</h1>
      <Table playerInfo={playerInfo} />
    </div>
  );
};

export default Stats;
