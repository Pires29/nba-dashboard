import statsData from "@/app/data/season_stats.json";

export default function getStats() {
  return statsData ?? [];
}
