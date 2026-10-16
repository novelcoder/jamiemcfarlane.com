import { parseNewsletterSignupContext } from '@/lib/newsletter-attribution';

const MAX_REQUEST_BYTES = 2_048;
const NEWSLETTER_FUNCTION_SITE = 'jamiemcfarlane';

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
    return jsonResponse({ ok: false, code: 'unsupported_media_type' }, 415);
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
  const signupContext = parseNewsletterSignupContext(fields);

  // A filled hidden field is treated as a bot submission. Return the normal
  // response without contacting the function so the endpoint reveals nothing.
  if (typeof fields.website === 'string' && fields.website.trim()) {
    return jsonResponse({ ok: true }, 200);
  }

  const functionUrl = process.env.NEWSLETTER_SIGNUP_FUNCTION_URL?.trim();
  if (!functionUrl) {
    console.error('Newsletter signup function URL is not configured.');
    return jsonResponse({ ok: false, code: 'subscription_unavailable' }, 503);
  }

  let upstream: Response;
  try {
    upstream = await fetch(functionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        site: NEWSLETTER_FUNCTION_SITE,
        email: fields.email,
        ...(signupContext.sourceKey
          ? { source_key: signupContext.sourceKey }
          : {}),
        signup_path: signupContext.signupPath,
        website: fields.website,
        elapsed_ms: fields.elapsed_ms,
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    console.error('Newsletter signup function could not be reached.');
    return jsonResponse({ ok: false, code: 'provider_unavailable' }, 502);
  }

  const result = (await upstream.json().catch(() => null)) as {
    success?: boolean;
    code?: unknown;
  } | null;

  if (upstream.ok && result?.success === true) {
    return jsonResponse({ ok: true }, 200);
  }

  const code = typeof result?.code === 'string' ? result.code : null;
  console.error(
    `Newsletter signup function failed: ${upstream.status} ${code ?? 'unknown'}.`,
  );
  const retryAfter = upstream.headers.get('Retry-After');

  return jsonResponse(
    { ok: false, code: code ?? 'subscription_unavailable' },
    upstream.ok ? 502 : upstream.status,
    retryAfter ? { 'Retry-After': retryAfter } : undefined,
  );
}
