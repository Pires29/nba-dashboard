import test from "node:test";
import assert from "node:assert/strict";
import { getQaFixtures } from "../src/lib/qa/fixtures.js";
import { selectFreePlayerIds } from "../src/lib/playerEntitlements.js";

test("regular QA fixture provides a realistic large dataset", () => {
  const data = getQaFixtures("regular");
  assert.equal(data.rosters.length, 72);
  assert.equal(data.props.length, 72);
  assert.equal(data.games.length, 2);
  assert.equal(Object.keys(data.logsByPlayer).length, 72);
  assert.ok(Object.values(data.logsByPlayer).every((logs) => logs.length === 30));
  assert.ok(
    Object.values(data.logsByPlayer).every((logs) =>
      logs.every(
        (game) =>
          typeof game.GAME_ID === "string" &&
          typeof game.FG_PCT === "number" &&
          typeof game.MIN === "number",
      ),
    ),
  );
  const firstTeamPlayers = data.rosters.slice(0, 2);
  const firstGameIds = new Set(
    data.logsByPlayer[String(firstTeamPlayers[0].PLAYER_ID)].map(
      (game) => game.GAME_ID,
    ),
  );
  const sharedGames = data.logsByPlayer[
    String(firstTeamPlayers[1].PLAYER_ID)
  ].filter((game) => firstGameIds.has(game.GAME_ID));
  assert.ok(sharedGames.length > 0 && sharedGames.length < 30);
});

test("Free QA persona has 15 players and locked alternatives", () => {
  const data = getQaFixtures("regular");
  const ids = selectFreePlayerIds({
    rosters: data.rosters,
    props: data.props,
    injuries: data.injuries,
    seed: "qa-test",
  });
  assert.equal(ids.size, 15);
  assert.equal(data.rosters.filter((player) => !ids.has(player.PLAYER_ID)).length, 57);
});

test("QA empty and partial scenarios preserve their intended states", () => {
  const empty = getQaFixtures("no-games");
  const partial = getQaFixtures("partial-data");
  assert.equal(empty.games.length, 0);
  assert.equal(empty.props.length, 0);
  assert.ok(partial.props.length > 0 && partial.props.length < partial.rosters.length);
  assert.ok(Object.keys(partial.logsByPlayer).length < partial.rosters.length);
});
