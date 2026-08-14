import "server-only";
import { cache } from "react";
import getGamesSchedule from "./getGamesSchedule";
import getInjuries from "./getInjuries";
import getProps from "./getProps";
import getRosters from "./getRosters";
import getStandings from "./getStandings";
import getTeamStats from "./getTeamStats";

const storageEnabled = () => process.env.NBA_DATA_SOURCE === "storage";

const storageConfig = () => {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const secret = process.env.SUPABASE_SECRET_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET;
  if (!url || !secret || !bucket) throw new Error("NBA Storage is not configured");
  return { url, secret, bucket };
};

async function fetchStorageJson(path, { revalidate = 300, noStore = false } = {}) {
  const { url, secret, bucket } = storageConfig();
  const response = await fetch(`${url}/storage/v1/object/${bucket}/${path}`, {
    headers: { apikey: secret, Authorization: `Bearer ${secret}` },
    ...(noStore ? { cache: "no-store" } : { next: { revalidate } }),
  });
  if (!response.ok) throw new Error(`NBA Storage read failed: ${path} (${response.status})`);
  return response.json();
}

const getStorageManifest = cache(() =>
  fetchStorageJson("current.json", { noStore: true }),
);

async function getStorageSnapshot() {
  const manifest = await getStorageManifest();
  const prefix = `versions/${manifest.version}`;
  const names = [
    "players", "teams", "rosters", "season_stats", "props", "team_stats",
    "injuries", "schedule", "standings",
  ];
  const values = await Promise.all(
    names.map((name) => fetchStorageJson(`${prefix}/${name}.json`, { revalidate: 86400 })),
  );
  return Object.fromEntries(names.map((name, index) => [name, values[index]]));
}

function buildLocalData() {
  return {
    rosters: getRosters(),
    props: getProps(),
    games: getGamesSchedule(),
    standings: getStandings(),
    injuries: getInjuries(),
    teamStats: getTeamStats(),
    source: "local",
    version: null,
  };
}

export const getNbaData = cache(async () => {
  if (!storageEnabled()) return buildLocalData();
  try {
    const [manifest, raw] = await Promise.all([getStorageManifest(), getStorageSnapshot()]);
    const source = {
      rostersByTeam: raw.rosters,
      playersById: raw.players,
      teamsById: raw.teams,
    };
    const rosters = getRosters(source);
    return {
      rosters,
      props: getProps({
        ...source,
        rostersData: rosters,
        propsByPlayer: raw.props,
        schedule: raw.schedule,
        teamStats: raw.team_stats,
        seasonStats: raw.season_stats,
        teams: raw.teams,
      }),
      games: getGamesSchedule(raw.schedule),
      standings: getStandings(raw.standings),
      injuries: getInjuries({ injuriesByTeam: raw.injuries, teamsById: raw.teams }),
      teamStats: getTeamStats({ teamStatsById: raw.team_stats, teamsById: raw.teams }),
      source: "storage",
      version: manifest.version,
      updatedAt: manifest.updatedAt,
    };
  } catch (error) {
    console.error("NBA Storage unavailable; using local fallback", { message: error?.message });
    return buildLocalData();
  }
});

export async function getNbaPlayerLogs(playerId) {
  if (storageEnabled()) {
    try {
      const manifest = await getStorageManifest();
      const bundle = await fetchStorageJson(
        `versions/${manifest.version}/players/${playerId}.json`,
        { revalidate: 86400 },
      );
      return {
        logs: bundle.current ?? [],
        logsPrev: bundle.previous ?? [],
        logsPlayoffs: bundle.playoffs ?? [],
        source: "storage",
      };
    } catch (error) {
      console.error("NBA player logs unavailable; using local fallback", {
        playerId,
        message: error?.message,
      });
    }
  }
  return {
    logs: [],
    logsPrev: [],
    logsPlayoffs: [],
    source: "unavailable",
  };
}
