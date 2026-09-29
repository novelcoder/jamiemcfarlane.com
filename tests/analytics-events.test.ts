import assert from 'node:assert/strict';
import test from 'node:test';

import { buildAnalyticsEvent } from '../lib/analytics-events.ts';
import {
  eventDateInTimeZone,
  parsePaidLandingView,
  SPACESHIP_MECHANIC_LANDING_PATH,
} from '../lib/paid-landing-view.ts';
import {
  NEWSLETTER_SITE_KEY,
  parseNewsletterSignupContext,
  sourceTypeForValidatedKey,
} from '../lib/newsletter-attribution.ts';
import {
  newsletterSourceForSignup,
  rememberNewsletterSource,
} from '../lib/newsletter-attribution-shared.ts';

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
  };
}

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

void test('keeps a validated Google source for a later newsletter signup', () => {
  const storage = memoryStorage();
  assert.equal(rememberNewsletterSource('gads_sm_b1_2026_09', storage), true);
  assert.equal(newsletterSourceForSignup('', storage), 'gads_sm_b1_2026_09');
  assert.equal(
    newsletterSourceForSignup('?source_key=bad-key', storage),
    'gads_sm_b1_2026_09',
  );
});

void test('normalizes anonymous newsletter attribution fields', () => {
  assert.equal(NEWSLETTER_SITE_KEY, 'jamie_mcfarlane');
  assert.deepEqual(
    parseNewsletterSignupContext({
      source_key: 'gads_sm_b1_2026_09',
      signup_path: '/SpaceshipMechanic',
    }),
    {
      sourceKey: 'gads_sm_b1_2026_09',
      signupPath: '/SpaceshipMechanic',
    },
  );
  assert.deepEqual(
    parseNewsletterSignupContext({
      source_key: 'bad-key',
      signup_path: 'https://example.com/private',
    }),
    { sourceKey: null, signupPath: '/unknown' },
  );
  assert.equal(sourceTypeForValidatedKey('gads_sm_b1_2026_09'), 'google_ads');
  assert.equal(sourceTypeForValidatedKey(null), 'website_unattributed');
});

void test('Mac Worden source keys are never Jamie attribution sources', async () => {
  const { hasEnabledAttributionSource, isJamieAttributionSourceKey } =
    await import('../lib/attribution-source.ts');
  assert.equal(isJamieAttributionSourceKey('gads_sm_b1_2026_09'), true);
  assert.equal(isJamieAttributionSourceKey('gads_mw_jc_b1_2026_09'), false);
  assert.equal(isJamieAttributionSourceKey('gads_mwx_b1'), true);

  const originalFetch = globalThis.fetch;
  let fetched = false;
  globalThis.fetch = (async () => {
    fetched = true;
    throw new Error('should not look up other-brand keys');
  }) as typeof fetch;
  try {
    assert.equal(
      await hasEnabledAttributionSource('gads_mw_jc_b1_2026_09'),
      false,
    );
    assert.equal(fetched, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
