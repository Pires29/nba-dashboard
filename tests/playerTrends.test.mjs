import test from "node:test";
import assert from "node:assert/strict";
import { tsImport } from "tsx/esm/api";

const { buildPlayerStatsPageData } = await tsImport(
  "../src/lib/buildPlayerStatsPageData.js",
  { parentURL: import.meta.url, tsconfig: "./jsconfig.json" },
);

const input = {
  playerId: 1, team1Id: 10, team2Id: 20, stat: "points",
  rawRosterData: [{ PLAYER_ID: 1, TEAM_ID: 10, PLAYER: "Test player" }],
  playerLogs: [{ date: "2026-01-01", min: 30, pts: 20 }],
  playerLogsPrev: [], playerLogsPlayoffs: [],
};

test("page data passes snapshot trends unchanged, independently of selected stat", async () => {
  const playerTrends = {
    recentGames: 10, seasonGames: 40, includesPlayoffs: true,
    stats: { minutes: { last10: 32, season: 30, difference: 2, sampleGames: 10 } },
  };
  for (const stat of ["points", "assists"]) {
    const data = await buildPlayerStatsPageData({ ...input, stat, playerTrends });
    assert.deepEqual(data.playerTrends, playerTrends);
    assert.equal(data.contextGames[0].minutes, 30);
  }
});

test("legacy snapshots compute fallback trends from available logs", async () => {
  const data = await buildPlayerStatsPageData(input);
  assert.equal(data.playerTrends.recentGames, 1);
  assert.equal(data.playerTrends.seasonGames, 1);
  assert.equal(data.playerTrends.includesPlayoffs, false);
  assert.equal(data.playerTrends.stats.minutes.last10, 30);
  assert.equal(data.playerTrends.stats.minutes.season, 30);
  assert.equal(data.playerTrends.stats.minutes.difference, 0);
  assert.equal(data.contextGames.length, 1);
  assert.equal(data.hasCurrentGames, true);
});

test("players without games remain supported", async () => {
  const data = await buildPlayerStatsPageData({ ...input, playerLogs: [] });
  assert.equal(data.playerTrends.recentGames, 0);
  assert.equal(data.playerTrends.stats.minutes.last10, null);
  assert.deepEqual(data.contextGames, []);
  assert.equal(data.hasCurrentGames, false);
});
