import assert from 'node:assert/strict';
import test from 'node:test';

import { readImageMeta } from '../lib/image-meta.ts';

// 1x1 PNG
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

void test('readImageMeta returns dimensions and MIME type', () => {
  assert.deepEqual(readImageMeta(PNG), {
    width: 1,
    height: 1,
    type: 'image/png',
  });
});

void test('readImageMeta returns null for non-image bytes', () => {
  assert.equal(readImageMeta(Buffer.from('not an image')), null);
  assert.equal(readImageMeta(new Uint8Array()), null);
});
