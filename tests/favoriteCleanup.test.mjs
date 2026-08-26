import test from "node:test";
import assert from "node:assert/strict";
import { getFavoriteCleanupCutoff } from "../src/lib/favoriteCleanup.js";

test("favorite cleanup cutoff is the start of the current local day", () => {
  const cutoff = getFavoriteCleanupCutoff(new Date("2026-10-21T18:45:00"));

  assert.equal(cutoff.getFullYear(), 2026);
  assert.equal(cutoff.getMonth(), 9);
  assert.equal(cutoff.getDate(), 21);
  assert.equal(cutoff.getHours(), 0);
  assert.equal(cutoff.getMinutes(), 0);
  assert.equal(cutoff.getSeconds(), 0);
  assert.equal(cutoff.getMilliseconds(), 0);
});
