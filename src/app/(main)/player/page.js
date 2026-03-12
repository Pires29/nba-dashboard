"use client";

import { calcAvg } from "@/lib/calcAvg";
import getPlayerLogs from "@/lib/getPlayerLogs";
import getRosters from "@/lib/getRosters";
import getStats from "@/lib/getStats";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import PlayerGraph from "./playerGraph/page";

const Page = () => {
  const searchParams = useSearchParams();
  const name = searchParams.get("name");
  const rosterData = useMemo(() => getRosters(), []);
  const stats = useMemo(() => getStats(), []);
  const playerLogs = useMemo(() => getPlayerLogs(), []);
  const playerData = rosterData.find((player) => player.PLAYER === name);

  const playerInfo = [
    {
      key: "Birth Date",
      value: playerData.BIRTH_DATE,
    },
    {
      key: "Height",
      value: playerData.HEIGHT,
    },
    {
      key: "Jersey",
      value: playerData.NUM,
    },
    {
      key: "Name",
      value: playerData.PLAYER,
    },
    {
      key: "Position",
      value: playerData.POSITION,
    },
    {
      key: "Team Abbreviation",
      value: playerData.TEAM_ABBREVIATION,
    },
    {
      key: "Team ID",
      value: playerData.TEAM_ID,
    },
    {
      key: "Player ID",
      value: playerData.PLAYER_ID,
    },
    {
      key: "Weight",
      value: playerData.WEIGHT,
    },
  ];

  const STATS_TO_CALC = [
    "points",
    "assists",
    "rebounds",
    "blocks",
    "turnovers",
    "steals",
  ];

  const playerStats = useMemo(() => {
    const player = stats.find((p) => p.name === name);
    if (!player) return null;

    const baseStats = Object.fromEntries(
      STATS_TO_CALC.map((stat) => [stat, calcAvg(player[stat], player.games)])
    );

    const derivedStats = {
      pra: baseStats.points + baseStats.assists + baseStats.rebounds,
      pa: baseStats.points + baseStats.assists,
      pr: baseStats.points + baseStats.rebounds,
      ra: baseStats.rebounds + baseStats.assists,
    };

    return {
      playerName: player.name,
      playerTeam: player.team,
      stats: {
        ...baseStats,
        ...derivedStats,
      },
    };
  }, [stats, name]);

  // dar match com a api dos stats, para ter os stats do moco
  return (
    <div className="flex flex-col flex-wrap gap-3">
      <img
        src={`https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${playerData.PLAYER_ID}.png`}
        width={125}
        height={125}
        alt={playerData.PLAYER}
      />

      <div className="flex">
        {playerInfo.map((item) => (
          <div key={item.key}>
            <p className="text-gray-600">{item.key}</p>
            <p className="font-semibold">{item.value}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        {Object.entries(playerStats.stats).map(([stat, value]) => {
          return (
            <div key={stat}>
              <p>
                {stat}: {value}
              </p>
            </div>
          );
        })}
      </div>
      <PlayerGraph player={player} playerStats={playerStats} />
    </div>
  );
};

export default Page;
