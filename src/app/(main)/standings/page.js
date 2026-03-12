//Hooks
import getStandings from "@/lib/getStandings";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function Standing() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const standingsData = getStandings();

  const eastTeams = standingsData.filter((team) => team.Conference === "East");
  const westTeams = standingsData.filter((team) => team.Conference === "West");

  return (
    <div className="flex justify-between">
      <div>
        {eastTeams.map((team) => (
          <StandingsRow key={team.TeamID} team={team} />
        ))}
      </div>
      <div>
        {westTeams.map((team) => (
          <StandingsRow key={team.TeamID} team={team} />
        ))}
      </div>
    </div>
  );
}

const StandingsRow = ({ team }) => {
  return (
    <div className="flex gap-2">
      <p>{team.PlayoffRank}</p>
      <h1>{team.TeamName}</h1>
      <p>{team.Conference}</p>
      <p>{team.Record}</p>
      <p>{team.WinPCT}</p>
    </div>
  );
};
