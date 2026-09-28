import {
  parsePaidLandingView,
  recordPaidLandingView,
} from '@/lib/paid-landing-view';

const MAX_REQUEST_BYTES = 512;

function emptyResponse(status = 204) {
  return new Response(null, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function POST(request: Request) {
  const contentType = request.headers.get('Content-Type') ?? '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return emptyResponse(415);
  }

  const contentLength = Number(request.headers.get('Content-Length') ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return emptyResponse(413);
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return emptyResponse(400);
  }

  if (new TextEncoder().encode(rawBody).byteLength > MAX_REQUEST_BYTES) {
    return emptyResponse(413);
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return emptyResponse(400);
  }

  const view = parsePaidLandingView(body);
  if (!view) return emptyResponse(400);

  try {
    await recordPaidLandingView(view);
  } catch {
    console.error('Paid landing-view measurement failed.');
  }

  return emptyResponse();
}
