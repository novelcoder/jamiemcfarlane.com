import { unstable_cache } from 'next/cache';

import { BLOG_IMAGE_BUCKET_ID } from './posts.ts';
import { readImageMeta, type ImageMeta } from './image-meta.ts';

const APPWRITE_ENDPOINT = 'https://sfo.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '6a0b4638002a71c2b8ec';
const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
const ONE_DAY_SECONDS = 86400;

async function downloadImageMeta(fileId: string): Promise<ImageMeta> {
  const apiKey = process.env.CATALOG_API_KEY?.trim();
  if (!apiKey) throw new Error('CATALOG_API_KEY is not set');

  const response = await fetch(
    `${APPWRITE_ENDPOINT}/storage/buckets/${BLOG_IMAGE_BUCKET_ID}/files/${encodeURIComponent(fileId)}/view`,
    {
      headers: {
        'X-Appwrite-Project': APPWRITE_PROJECT_ID,
        'X-Appwrite-Key': apiKey,
      },
      // The bytes can exceed the fetch cache's size limit; the parsed result
      // is cached below instead.
      cache: 'no-store',
    },
  );
  if (!response.ok) throw new Error(`Appwrite returned ${response.status}`);

  const length = Number(response.headers.get('content-length'));
  if (length > MAX_IMAGE_BYTES) throw new Error('Image too large to inspect');

  const meta = readImageMeta(new Uint8Array(await response.arrayBuffer()));
  if (!meta) throw new Error('Unrecognised image format');
  return meta;
}

// The cached function throws on failure so errors are never cached; only a
// successful lookup is kept (per file id, for a day).
const cachedImageMeta = unstable_cache(downloadImageMeta, ['blog-image-meta'], {
  revalidate: ONE_DAY_SECONDS,
});

// Returns the real dimensions and MIME type of a blog hero image, or null if
// they cannot be determined. Never throws, so metadata generation can't break.
export async function getBlogImageMeta(
  fileId: string,
): Promise<ImageMeta | null> {
  if (!fileId) return null;
  try {
    return await cachedImageMeta(fileId);
  } catch {
    return null;
  }
}
