import standingsData from "@/app/data/standings.json";

export default function getStandings(source = standingsData) {
  return source ?? [];
}
