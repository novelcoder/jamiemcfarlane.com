import {
  InvalidEmailAddressError,
  MailerLiteConfigurationError,
  MailerLiteRequestError,
  subscribeToPrivateerTalesMain,
} from '@/lib/mailerlite';

const MAX_REQUEST_BYTES = 2_048;

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  additionalHeaders: Record<string, string> = {},
) {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      ...additionalHeaders,
    },
  });
}

export async function POST(request: Request) {
  const contentType = request.headers.get('Content-Type') ?? '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return jsonResponse(
      { ok: false, code: 'unsupported_media_type' },
      415,
    );
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return jsonResponse({ ok: false, code: 'invalid_request' }, 400);
  }

  if (new TextEncoder().encode(rawBody).byteLength > MAX_REQUEST_BYTES) {
    return jsonResponse({ ok: false, code: 'request_too_large' }, 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ ok: false, code: 'invalid_request' }, 400);
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return jsonResponse({ ok: false, code: 'invalid_request' }, 400);
  }

  const fields = body as Record<string, unknown>;

  // A filled hidden field is treated as a bot submission. Return the normal
  // response without contacting MailerLite so the endpoint reveals nothing.
  if (typeof fields.website === 'string' && fields.website.trim()) {
    return jsonResponse({ ok: true }, 200);
  }

  try {
    await subscribeToPrivateerTalesMain(fields.email);
    return jsonResponse({ ok: true }, 200);
  } catch (error) {
    if (error instanceof InvalidEmailAddressError) {
      return jsonResponse({ ok: false, code: 'invalid_email' }, 400);
    }

    if (error instanceof MailerLiteConfigurationError) {
      console.error('Privateer Tales MailerLite configuration is invalid.');
      return jsonResponse(
        { ok: false, code: 'subscription_unavailable' },
        503,
      );
    }

    if (error instanceof MailerLiteRequestError) {
      console.error(`MailerLite subscription request failed: ${error.code}.`);
      const retryHeaders = error.retryAfter
        ? { 'Retry-After': error.retryAfter }
        : undefined;

      return jsonResponse(
        { ok: false, code: error.code },
        error.status,
        retryHeaders,
      );
    }

    console.error('Unexpected MailerLite subscription failure.');
    return jsonResponse(
      { ok: false, code: 'subscription_unavailable' },
      500,
    );
  }
}
