import assert from 'node:assert/strict';
import test from 'node:test';

import {
  seriesLandingPath,
  seriesReadingOrderPath,
} from '../lib/series-routes.ts';

void test('routes supporting-series books back to their page sections', () => {
  assert.equal(
    seriesLandingPath('oldest-starfighter'),
    '/ScienceFictionAdventures#oldest-starfighter',
  );
  assert.equal(
    seriesLandingPath('space-troopers'),
    '/ScienceFictionAdventures#space-troopers',
  );
  assert.equal(
    seriesLandingPath('tinker-knight-adventures'),
    '/ScienceFictionAdventures#tinker-knight',
  );
  assert.equal(seriesLandingPath('afterwar-saga'), '/PrivateerTales#afterwar');
});

void test('uses a dedicated reading-order route when one exists', () => {
  assert.equal(
    seriesReadingOrderPath('privateer-tales'),
    '/PrivateerTales/books',
  );
  assert.equal(seriesReadingOrderPath('witchy-world'), '/WitchyWorld');
});

void test('falls back safely for an unknown series', () => {
  assert.equal(seriesLandingPath('unknown-series'), '/');
  assert.equal(seriesReadingOrderPath('unknown-series'), '/');
});
