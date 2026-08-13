import rostersByTeam from "@/app/data/rosters.json";
import playersById from "@/app/data/players.json";
import teamsById from "@/app/data/teams.json";

export default function getRosters() {
  return Object.entries(rostersByTeam ?? {}).flatMap(([teamId, roster]) => {
    const team = teamsById?.[teamId] ?? {};

    return (roster ?? []).map((rosterPlayer) => {
      const player = playersById?.[String(rosterPlayer.id)] ?? {};

      return {
        PLAYER_ID: Number(rosterPlayer.id),
        PLAYER: rosterPlayer.name ?? player.name ?? "",
        NUM: rosterPlayer.num ?? player.num ?? "",
        POSITION: rosterPlayer.pos ?? player.pos ?? "",
        HEIGHT: player.height ?? "",
        WEIGHT: player.weight ?? "",
        BIRTH_DATE: player.dob ?? "",
        TEAM_NAME: team.name ?? "",
        TEAM_ID: Number(teamId),
        TEAM_ABBREVIATION: team.abbr ?? "",
      };
    });
  });
}
