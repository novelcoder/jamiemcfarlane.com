import assert from 'node:assert/strict';
import test from 'node:test';

import { blogImagePath, formatPostDate, postUrl } from '../lib/posts.ts';

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
