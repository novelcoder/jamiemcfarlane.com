import assert from 'node:assert/strict';
import test from 'node:test';

import { buildAnalyticsEvent } from '../lib/analytics-events.ts';
import {
  eventDateInTimeZone,
  parsePaidLandingView,
  SPACESHIP_MECHANIC_LANDING_PATH,
} from '../lib/paid-landing-view.ts';

void test('aligns landing-view dates to the advertising account time zone', () => {
  assert.equal(
    eventDateInTimeZone(new Date('2026-09-29T01:30:00Z')),
    '2026-09-28',
  );
});

void test('builds a normalized Amazon click event without URLs or click ids', () => {
  assert.deepEqual(
    buildAnalyticsEvent('amazon_purchase_click', {
      seriesSlug: 'spaceship-mechanic',
      sourceKey: 'gads_sm_b1_2026_09',
      bookSlug: 'boltguns-and-duct-tape',
      seriesNumber: 1,
      placement: 'book_detail',
      linkType: 'amazon_attribution',
    }),
    {
      eventName: 'amazon_purchase_click',
      parameters: {
        series_slug: 'spaceship-mechanic',
        source_key: 'gads_sm_b1_2026_09',
        book_slug: 'boltguns-and-duct-tape',
        series_number: 1,
        placement: 'book_detail',
        link_type: 'amazon_attribution',
      },
    },
  );
});

void test('rejects unsafe event context values', () => {
  assert.equal(
    buildAnalyticsEvent('select_book', {
      seriesSlug: 'spaceship mechanic?gclid=secret',
    }),
    null,
  );
});

void test('accepts only the normalized Spaceship Mechanic paid landing payload', () => {
  assert.deepEqual(
    parsePaidLandingView({
      source_key: 'gads_sm_b1_2026_09',
      landing_path: SPACESHIP_MECHANIC_LANDING_PATH,
    }),
    {
      sourceKey: 'gads_sm_b1_2026_09',
      landingPath: SPACESHIP_MECHANIC_LANDING_PATH,
    },
  );
  assert.equal(
    parsePaidLandingView({
      source_key: ['gads_sm_b1_2026_09', 'duplicate'],
      landing_path: SPACESHIP_MECHANIC_LANDING_PATH,
    }),
    null,
  );
  assert.equal(
    parsePaidLandingView({
      source_key: 'gads_sm_b1_2026_09',
      landing_path: '/books/boltguns-and-duct-tape',
    }),
    null,
  );
});
