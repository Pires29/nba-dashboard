import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Acrescentar 3PM
const statOptions = [
  "points",
  "assists",
  "blocks",
  "rebounds",
  "turnovers",
  "steals",
  "pra",
  "pr",
  "pa",
  "ra",
];

const PlayerGraph = ({ player, playerStats }) => {
  if (!playerStats) {
    return null;
  }
  if (!player) {
    return null;
  }

  const [selectedStat, setSelectedStat] = useState("points");

  const numberOfGamesOptions = [5, 10, 20, 30, "Full"];

  const [selectedNumber, setSelectedNumber] = useState(10);

  const data = player.games.map((game) => {
    const points = game.PTS;
    const assists = game.AST;
    const rebounds = game.REB;

    return {
      date: game.GAME_DATE,
      points,
      assists,
      blocks: game.BLK,
      rebounds,
      turnovers: game.TOV,
      steals: game.STL,
      threePointsMade: game.FG3M,
      pra: points + rebounds + assists,
      pa: points + assists,
      pr: points + rebounds,
      ra: rebounds + assists,
    };
  });

  console.log(
    "Primeiros 3 jogos:",
    data.slice(0, 3).map((g) => g.date),
  );
  console.log(
    "Últimos 3 jogos:",
    data.slice(-3).map((g) => g.date),
  );
  console.log("Total jogos:", data.length);

  const dataFiltered = (() => {
    const sliced =
      selectedNumber === "Full" ? data : data.slice(0, selectedNumber);
    return [...sliced].reverse();
  })();

  const stat = playerStats.stats[selectedStat];

  return (
    <div className="flex flex-col justify-center">
      <StatOptions />
      <div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dataFiltered}>
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <ReferenceLine
              label={selectedStat}
              y={stat}
              stroke="blue"
              strokeDasharray="3 3"
            />
            <Bar dataKey={selectedStat}>
              {dataFiltered.map((entry, index) => {
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry[selectedStat] >= stat ? "green" : "red"}
                  />
                );
              })}
              <LabelList dataKey={selectedStat} position="inside" fill="#fff" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <FilterGames
        numberOfGamesOptions={numberOfGamesOptions}
        setSelectedNumber={setSelectedNumber}
      />
    </div>
  );
};

const StatOptions = ({ statOptions, setSelectedStat }) => {
  return (
    <div className="flex justify-center gap-3">
      {statOptions.map((option, index) => (
        <div key={index} onClick={() => setSelectedStat(option)}>
          <Button>{option}</Button>
        </div>
      ))}
    </div>
  );
};

const FilterGames = ({ numberOfGamesOptions, setSelectedNumber }) => {
  return (
    <div className="flex justify-center gap-3">
      {numberOfGamesOptions.map((option, index) => (
        <div key={index} onClick={() => setSelectedNumber(option)}>
          <Button>{option}</Button>
        </div>
      ))}
    </div>
  );
};

export default PlayerGraph;
