import { BLOG_IMAGE_BUCKET_ID } from '@/lib/posts';

const APPWRITE_ENDPOINT = 'https://sfo.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '6a0b4638002a71c2b8ec';
const fileIdPattern = /^[A-Za-z0-9][A-Za-z0-9._-]{0,35}$/;

export const dynamic = 'force-dynamic';

function mediaApiKey() {
  const key = process.env.CATALOG_API_KEY?.trim();
  if (!key) {
    throw new Error('CATALOG_API_KEY is required to serve private blog images.');
  }
  return key;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ fileId: string }> },
) {
  const { fileId } = await context.params;
  if (!fileIdPattern.test(fileId)) {
    return new Response('Not found', { status: 404 });
  }

  const response = await fetch(
    `${APPWRITE_ENDPOINT}/storage/buckets/${BLOG_IMAGE_BUCKET_ID}/files/${encodeURIComponent(fileId)}/view`,
    {
      headers: {
        'X-Appwrite-Project': APPWRITE_PROJECT_ID,
        'X-Appwrite-Key': mediaApiKey(),
      },
      cache: 'no-store',
    },
  );

  if (response.status === 404) {
    return new Response('Not found', { status: 404 });
  }
  if (!response.ok) {
    return new Response('Unable to load image', { status: 502 });
  }

  const headers = new Headers();
  headers.set(
    'Content-Type',
    response.headers.get('content-type') || 'application/octet-stream',
  );
  headers.set('Cache-Control', 'public, max-age=86400, immutable');
  const contentLength = response.headers.get('content-length');
  if (contentLength) headers.set('Content-Length', contentLength);

  return new Response(response.body, { headers });
}
