import assert from 'node:assert/strict';
import test from 'node:test';

import {
  canonicalSeriesRoute,
  normalizeSeriesRoute,
} from '../lib/series-aliases.ts';

void test('normalizes case and hyphens in series aliases', () => {
  assert.equal(normalizeSeriesRoute('Witchy-World'), 'witchyworld');
  assert.equal(normalizeSeriesRoute('SpAcE-TrOoPeRs'), 'spacetroopers');
});

void test('routes supporting-series aliases to their canonical sections', () => {
  assert.equal(canonicalSeriesRoute('Witchy-World'), '/WitchyWorld');
  assert.equal(
    canonicalSeriesRoute('Oldest-Starfighter'),
    '/ScienceFictionAdventures#oldest-starfighter',
  );
  assert.equal(
    canonicalSeriesRoute('SpaceTroopers'),
    '/ScienceFictionAdventures#space-troopers',
  );
  assert.equal(
    canonicalSeriesRoute('Tinker-Knight-Adventures'),
    '/ScienceFictionAdventures#tinker-knight',
  );
  assert.equal(
    canonicalSeriesRoute('Afterwar-Saga'),
    '/PrivateerTales#afterwar',
  );
});

void test('does not invent a destination for an unknown series', () => {
  assert.equal(canonicalSeriesRoute('not-a-series'), undefined);
});
