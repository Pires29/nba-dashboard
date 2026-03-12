import data from "@/app/data/nba_injuries.json";

export default function getInjuries() {
  return data?.injuries ?? [];
}
