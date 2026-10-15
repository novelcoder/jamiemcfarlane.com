import assert from 'node:assert/strict';
import test from 'node:test';

import { appwritePreviewUrl, nextOptimizedUrl } from '../lib/appwrite-image.ts';

const view =
  'https://sfo.cloud.appwrite.io/v1/storage/buckets/6a50ff920031640f71bd/files/boltguns-ducttape-cover/view?project=6a0b4638002a71c2b8ec';

void test('Appwrite view URLs become sized webp previews', () => {
  const url = new URL(appwritePreviewUrl(view, 400, 80) ?? '');

  assert.equal(
    url.origin + url.pathname,
    'https://sfo.cloud.appwrite.io/v1/storage/buckets/6a50ff920031640f71bd/files/boltguns-ducttape-cover/preview',
  );
  assert.equal(url.searchParams.get('project'), '6a0b4638002a71c2b8ec');
  assert.equal(url.searchParams.get('width'), '400');
  assert.equal(url.searchParams.get('output'), 'webp');
  assert.equal(url.searchParams.get('quality'), '80');
});

void test('an existing preview URL is resized, not stacked', () => {
  const url = new URL(
    appwritePreviewUrl(view.replace('/view', '/preview') + '&width=2000', 256) ??
      '',
  );

  assert.deepEqual(url.searchParams.getAll('width'), ['256']);
});

void test('non-Appwrite sources are left to next/image', () => {
  assert.equal(appwritePreviewUrl('/cards/boltguns-card-1000.jpg', 640), null);
  assert.equal(
    appwritePreviewUrl('https://i0.wp.com/fickledragon.com/a.jpg', 640),
    null,
  );
  assert.equal(
    nextOptimizedUrl('/cards/a b.jpg', 640),
    '/_next/image?url=%2Fcards%2Fa%20b.jpg&w=640&q=75',
  );
});
