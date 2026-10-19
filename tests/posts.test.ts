import assert from 'node:assert/strict';
import test from 'node:test';

import {
  blogImagePath,
  cacheWindowNow,
  formatPostDate,
  postUrl,
  publishedPostVisibilityQueries,
} from '../lib/posts.ts';

void test('post helpers produce canonical internal paths', () => {
  assert.equal(postUrl('ships-and-coffee'), '/news/ships-and-coffee');
  assert.equal(blogImagePath('wp-media-1'), '/blog-images/wp-media-1');
});

void test('formatPostDate uses a stable UTC calendar date', () => {
  assert.equal(
    formatPostDate('2026-04-13T00:08:26.000+00:00'),
    'April 13, 2026',
  );
});

void test('published post queries require this site, approval and an arrived timestamp', () => {
  const now = new Date('2026-10-03T17:00:00.000Z');
  const queries = publishedPostVisibilityQueries(now).map((query) =>
    JSON.parse(query),
  );

  assert.deepEqual(queries, [
    {
      method: 'equal',
      attribute: 'sites',
      values: ['6ac921fe001bfe4ecb28'],
    },
    {
      method: 'equal',
      attribute: 'status',
      values: ['published'],
    },
    {
      method: 'lessThanEqual',
      attribute: 'published_at',
      values: ['2026-10-03T17:00:00.000Z'],
    },
  ]);
});

void test('post visibility cutoff is rounded down to the cache window', () => {
  const early = cacheWindowNow(new Date('2026-10-03T17:04:59.999Z'));
  const late = cacheWindowNow(new Date('2026-10-03T17:00:00.001Z'));

  assert.equal(early.toISOString(), '2026-10-03T17:00:00.000Z');
  assert.equal(late.toISOString(), early.toISOString());
  assert.equal(
    cacheWindowNow(new Date('2026-10-03T17:05:00.000Z')).toISOString(),
    '2026-10-03T17:05:00.000Z',
  );
});
