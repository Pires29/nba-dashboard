"use client";

import getGamesSchedule from "@/lib/getGamesSchedule";
import getStandings from "@/lib/getStandings";
import Image from "next/image";
import Link from "next/link";

const Games = () => {
  const games = getGamesSchedule();
  const teams = getStandings();

  const ids = teams.reduce((teamIds, team) => {
    teamIds[team.TeamID] = {
      name: team.TeamName,
    };
    return teamIds;
  }, {});

  return (
    <div className="flex flex-col gap-4">
      {games.map((game, index) => {
        const homeTeamID = game.home_team_id;
        const awayTeamID = game.visitor_team_id;

        const homeTeamName = ids[homeTeamID]?.name || "Unknown";
        const awayTeamName = ids[awayTeamID]?.name || "Unknown";

        const imageSrc1 = `https://cdn.nba.com/logos/nba/${homeTeamID}/global/L/logo.svg`;
        const imageSrc2 = `https://cdn.nba.com/logos/nba/${awayTeamID}/global/L/logo.svg`;
        return (
          <Link
            href={`/playersStats?team1=${homeTeamName}&team2=${awayTeamName}`}
            key={index}
          >
            <div className="flex">
              <Image
                src={imageSrc1}
                width={50}
                height={50}
                alt="Picture of the author"
              />
              <p>{homeTeamName}</p>
              <p>vs</p>
              <Image
                src={imageSrc2}
                width={50}
                height={50}
                alt="Picture of the author"
              />
              <p>{awayTeamName}</p>
            </div>
            <p>{game.date}</p>
          </Link>
        );
      })}
    </div>
  );
};

export default Games;
