import assert from 'node:assert/strict';
import test from 'node:test';

import { buildRss, escapeXml } from '../lib/feed.ts';
import type { PostRecord } from '../lib/posts.ts';

function post(overrides: Partial<PostRecord> = {}): PostRecord {
  return {
    id: 'wp-1',
    title: 'Ships & Coffee',
    slug: 'ships-and-coffee',
    excerpt: 'A short update.',
    content_markdown: 'Hello ![Ship](/blog-images/wp-media-1).',
    status: 'published',
    published_at: '2026-06-01T17:34:35.000+00:00',
    author_name: 'Jamie McFarlane',
    category: 'Spaceship Mechanic',
    tags: ['writing'],
    is_featured: false,
    hero_image_id: 'wp-media-1',
    hero_image_alt: 'A ship',
    hero_image_caption: '',
    seo_title: '',
    seo_description: '',
    wordpress_post_id: 1,
    legacy_url: 'https://fickledragon.com/example/',
    updated_at: '2026-06-01T17:34:35.000+00:00',
    ...overrides,
  };
}

void test('escapeXml escapes XML special characters', () => {
  assert.equal(
    escapeXml(`A & B < C > D "E" 'F'`),
    'A &amp; B &lt; C &gt; D &quot;E&quot; &apos;F&apos;',
  );
});

void test('buildRss emits canonical URLs, full content, and absolute media URLs', async () => {
  const rss = await buildRss([post()]);

  assert.match(rss, /<rss version="2\.0"/);
  assert.match(rss, /<title>Ships &amp; Coffee<\/title>/);
  assert.match(
    rss,
    /https:\/\/www\.jamiemcfarlane\.com\/news\/ships-and-coffee/,
  );
  assert.match(
    rss,
    /https:\/\/www\.jamiemcfarlane\.com\/blog-images\/wp-media-1/,
  );
  assert.match(rss, /<content:encoded><!\[CDATA\[/);
  assert.match(rss, /<category><!\[CDATA\[Spaceship Mechanic\]\]><\/category>/);
});
