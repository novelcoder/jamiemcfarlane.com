import assert from 'node:assert/strict';
import test from 'node:test';

import {
  blogImagePath,
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

void test('published post queries require approval and an arrived timestamp', () => {
  const now = new Date('2026-10-03T17:00:00.000Z');
  const queries = publishedPostVisibilityQueries(now).map((query) =>
    JSON.parse(query),
  );

  assert.deepEqual(queries, [
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
