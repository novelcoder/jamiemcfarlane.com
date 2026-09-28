import assert from 'node:assert/strict';
import test from 'node:test';

import { renderMarkdown } from '../lib/markdown.ts';

void test('renderMarkdown sanitizes scripts and unapproved embeds', async () => {
  const html = await renderMarkdown(
    'Hello<script>alert(1)</script><iframe src="https://evil.example/embed"></iframe>',
  );

  assert.doesNotMatch(html, /<script|alert\(1\)/);
  assert.doesNotMatch(html, /evil\.example/);
});

void test('renderMarkdown makes relative blog media absolute for feeds', async () => {
  const html = await renderMarkdown(
    '![Ship](/blog-images/wp-media-1)',
    'https://www.jamiemcfarlane.com',
  );

  assert.match(
    html,
    /src="https:\/\/www\.jamiemcfarlane\.com\/blog-images\/wp-media-1"/,
  );
});
