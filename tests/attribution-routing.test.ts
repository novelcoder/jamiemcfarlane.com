import assert from 'node:assert/strict';
import test from 'node:test';

import {
  isValidAmazonAttributionUrl,
  isValidAmazonClickThroughUrl,
  parseAttributionSourceKey,
  selectPurchaseUrl,
  withAttribution,
} from '../lib/attribution-routing.ts';

const asin = 'B0FQG1S63H';
const publicUrl = 'https://geni.us/boltguns-ducttape';
const attributionUrl =
  'https://www.amazon.com/dp/B0FQG1S63H?maas=maas_adg_F1D77CBE6246D2F728434EBB517F0820_afap_abs&ref_=aa_maas&tag=maas';

void test('accepts only a single exact source key', () => {
  assert.equal(
    parseAttributionSourceKey('gads_sm_b1_2026_09'),
    'gads_sm_b1_2026_09',
  );
  assert.equal(parseAttributionSourceKey(undefined), null);
  assert.equal(parseAttributionSourceKey(['gads_sm_b1_2026_09']), null);
  assert.equal(parseAttributionSourceKey(' GADS_sm_b1_2026_09 '), null);
  assert.equal(parseAttributionSourceKey('gads-sm-b1'), null);
});

void test('propagates only the validated marker on internal URLs', () => {
  assert.equal(
    withAttribution('/books/boltguns-and-duct-tape', 'gads_sm_b1_2026_09'),
    '/books/boltguns-and-duct-tape?source_key=gads_sm_b1_2026_09',
  );
  assert.equal(
    withAttribution('/SpaceshipMechanic/explore#crew', 'gads_sm_b1_2026_09'),
    '/SpaceshipMechanic/explore?source_key=gads_sm_b1_2026_09#crew',
  );
  assert.equal(
    withAttribution('https://www.amazon.com/dp/B0FQG1S63H', 'source'),
    'https://www.amazon.com/dp/B0FQG1S63H',
  );
  assert.equal(
    withAttribution('/SpaceshipMechanic', null),
    '/SpaceshipMechanic',
  );
});

void test('validates the clean Amazon click-through URL', () => {
  assert.equal(
    isValidAmazonClickThroughUrl(`https://www.amazon.com/dp/${asin}`, asin),
    true,
  );
  assert.equal(
    isValidAmazonClickThroughUrl(
      `https://www.amazon.com/dp/${asin}?gclid=test`,
      asin,
    ),
    false,
  );
  assert.equal(
    isValidAmazonClickThroughUrl('https://www.amazon.com/dp/B0HGZZZKRD', asin),
    false,
  );
});

void test('validates exact Amazon Attribution destinations', () => {
  assert.equal(isValidAmazonAttributionUrl(attributionUrl, asin), true);
  assert.equal(
    isValidAmazonAttributionUrl(`${attributionUrl}&gclid=test`, asin),
    false,
  );
  assert.equal(
    isValidAmazonAttributionUrl(
      attributionUrl.replace('tag=maas', 'tag=other'),
      asin,
    ),
    false,
  );
  assert.equal(
    isValidAmazonAttributionUrl(
      attributionUrl.replace(asin, 'B0HGZZZKRD'),
      asin,
    ),
    false,
  );
});

void test('falls back to the public store URL when attribution is absent or invalid', () => {
  assert.equal(
    selectPurchaseUrl({ publicStoreUrl: publicUrl, expectedAsin: asin }),
    publicUrl,
  );
  assert.equal(
    selectPurchaseUrl({
      publicStoreUrl: publicUrl,
      attributionUrl: 'https://example.com/not-amazon',
      expectedAsin: asin,
    }),
    publicUrl,
  );
  assert.equal(
    selectPurchaseUrl({
      publicStoreUrl: publicUrl,
      attributionUrl,
      expectedAsin: asin,
    }),
    attributionUrl,
  );
});
