import test from "node:test";
import assert from "node:assert/strict";
import {
  FREE_PLAYER_LIMIT,
  hasFullPlayerAccess,
  selectFreePlayerIds,
} from "../src/lib/playerEntitlements.js";

const rosters = Array.from({ length: 30 }, (_, index) => ({
  PLAYER_ID: index + 1,
  PLAYER: `Player ${index + 1}`,
}));

test("Free receives exactly 15 stable players for the same day", () => {
  const first = selectFreePlayerIds({ rosters, seed: "2026-08-14" });
  const second = selectFreePlayerIds({ rosters, seed: "2026-08-14" });

  assert.equal(first.size, FREE_PLAYER_LIMIT);
  assert.deepEqual([...first], [...second]);
});

test("Free is filled from the roster when props are unavailable", () => {
  const selected = selectFreePlayerIds({
    rosters,
    props: [],
    injuries: [],
    seed: "offseason",
  });

  assert.equal(selected.size, 15);
  assert.ok([...selected].every((playerId) => playerId >= 1 && playerId <= 30));
});

test("quality candidates are selected before fallback players", () => {
  const props = Array.from({ length: 15 }, (_, index) => ({
    player_id: index + 1,
    props: { points: { avg: 20, L10: { hit_rate: 70 } } },
  }));
  const selected = selectFreePlayerIds({ rosters, props, seed: "quality" });

  assert.deepEqual(new Set(selected), new Set(Array.from({ length: 15 }, (_, index) => index + 1)));
});

test("Trial and Pro have full player access", () => {
  assert.equal(hasFullPlayerAccess("free"), false);
  assert.equal(hasFullPlayerAccess(undefined), false);
  assert.equal(hasFullPlayerAccess("trial"), true);
  assert.equal(hasFullPlayerAccess("pro"), true);
});
