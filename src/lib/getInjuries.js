import data from "@/app/data/injuries.json";
import teams from "@/app/data/teams.json";

export default function getInjuries(source = {}) {
  const injurySource = source.injuriesByTeam ?? data;
  const teamSource = source.teamsById ?? teams;
  return Object.entries(injurySource ?? {}).map(([teamId, injuries]) => ({
    displayName: teamSource?.[teamId]?.name ?? "",
    injuries: (injuries ?? []).map((injury) => ({
      TeamID: Number(teamId),
      athlete: {
        id: injury.pid,
        displayName: injury.name ?? "Unknown player",
      },
      status: injury.status,
      details: {
        type: injury.type,
        detail: injury.detail,
        returnDate: injury.returnDate,
      },
    })),
  }));
}
