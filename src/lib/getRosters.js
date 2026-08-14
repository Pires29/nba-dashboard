import rostersByTeam from "@/app/data/rosters.json";
import playersById from "@/app/data/players.json";
import teamsById from "@/app/data/teams.json";

export default function getRosters(source = {}) {
  const rosterSource = source.rostersByTeam ?? rostersByTeam;
  const playerSource = source.playersById ?? playersById;
  const teamSource = source.teamsById ?? teamsById;
  return Object.entries(rosterSource ?? {}).flatMap(([teamId, roster]) => {
    const team = teamSource?.[teamId] ?? {};

    return (roster ?? []).map((rosterPlayer) => {
      const player = playerSource?.[String(rosterPlayer.id)] ?? {};

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
