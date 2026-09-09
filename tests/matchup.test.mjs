import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyMatchup, getPositionMatchup } from '../src/lib/matchup.js';

test('Jabari vs Denver uses forwards allowances, not overall defense rank', () => {
  const matchup = { points: 54.1, pointsRank: 10, leagueAverage: { points: 56.43 } };
  const analytics = { players: { 1631095: { position: 'F' } }, opponentVsPosition: { F: { teams: { 1610612743: matchup } } } };
  const resolved = getPositionMatchup(analytics, 1631095, 'F-C', 1610612743);
  assert.equal(resolved.position, 'F');
  const result = classifyMatchup('points', resolved.matchup);
  assert.equal(result.label, 'Unfavorable');
  assert.equal(result.difference, -4.1);
  assert.equal(result.rank, 10);
});

test('neutral boundary is inclusive and follows displayed precision', () => {
  for (const points of [99, 100, 101, 101.04]) {
    assert.equal(classifyMatchup('points', { points, leagueAverage: { points: 100 } }).label, 'Neutral');
  }
  assert.equal(classifyMatchup('points', { points: 102, leagueAverage: { points: 100 } }).label, 'Favorable');
});

test('threes use made threes and combinations compare totals without invented ranks', () => {
  const data = { points: 50, assists: 10, threes: 6, leagueAverage: { points: 40, assists: 20, threes: 5 } };
  assert.equal(classifyMatchup('fg3m', data).difference, 20);
  assert.equal(classifyMatchup('pa', data).label, 'Neutral');
  assert.equal(classifyMatchup('pa', data).rank, null);
});

test('defensive stat matchups expose single-stat ranks', () => {
  const data = {
    steals: 7.1,
    stealsRank: 8,
    blocks: 4.2,
    blocksRank: 11,
    turnovers: 15.2,
    turnoversRank: 6,
    leagueAverage: { steals: 6.5, blocks: 3.5, turnovers: 14 },
  };
  assert.equal(classifyMatchup('steals', data).rank, 8);
  assert.equal(classifyMatchup('blocks', data).rank, 11);
  assert.equal(classifyMatchup('turnovers', data).rank, 6);
  assert.equal(classifyMatchup('turnovers', data).label, 'Favorable');
});

test('missing, incomplete and invalid comparisons remain unavailable', () => {
  for (const data of [null, {}, {points: 10, leagueAverage: {points: 0}}, {points: NaN, leagueAverage: {points: 10}}]) {
    assert.equal(classifyMatchup('points', data).difference, null);
  }
  assert.equal(classifyMatchup('pra', {points: 10, leagueAverage: {points: 10}}).label, '—');
  assert.equal(classifyMatchup('turnovers', {}).label, '—');
});
