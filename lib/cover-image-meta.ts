import { unstable_cache } from 'next/cache';

import { readImageMeta, type ImageMeta } from './image-meta.ts';

const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
const ONE_DAY_SECONDS = 86400;

// Cover URLs come from the catalog; only fetch from the hosts we already serve
// covers from.
const ALLOWED_HOSTS = new Set(['sfo.cloud.appwrite.io', 'i0.wp.com']);

async function downloadImageMeta(url: string): Promise<ImageMeta> {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Cover returned ${response.status}`);

  const length = Number(response.headers.get('content-length'));
  if (length > MAX_IMAGE_BYTES) throw new Error('Image too large to inspect');

  const meta = readImageMeta(new Uint8Array(await response.arrayBuffer()));
  if (!meta) throw new Error('Unrecognised image format');
  return meta;
}

// Throws on failure so errors are never cached; only successes are kept.
const cachedImageMeta = unstable_cache(
  downloadImageMeta,
  ['cover-image-meta'],
  { revalidate: ONE_DAY_SECONDS },
);

// Real dimensions and MIME type of a public book cover, or null if they can't
// be determined. Never throws, so metadata generation can't break.
export async function getCoverImageMeta(
  coverUrl: string,
): Promise<ImageMeta | null> {
  try {
    const url = new URL(coverUrl);
    if (url.protocol !== 'https:' || !ALLOWED_HOSTS.has(url.hostname)) {
      return null;
    }
    return await cachedImageMeta(url.toString());
  } catch {
    return null;
  }
}
