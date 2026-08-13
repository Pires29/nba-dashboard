import games from "@/app/data/schedule.json";

export default function getGamesSchedule() {
  return games ?? [];
}
