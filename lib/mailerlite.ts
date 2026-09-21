const MAILERLITE_CLASSIC_BASE_URL = 'https://api.mailerlite.com/api/v2';
const EMAIL_MAX_LENGTH = 254;
const EMAIL_LOCAL_PART_MAX_LENGTH = 64;
const EMAIL_LOCAL_PART_PATTERN = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i;
const DOMAIN_LABEL_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;

export class InvalidEmailAddressError extends Error {
  constructor() {
    super('Invalid email address');
    this.name = 'InvalidEmailAddressError';
  }
}

export class MailerLiteConfigurationError extends Error {
  constructor() {
    super('MailerLite is not configured');
    this.name = 'MailerLiteConfigurationError';
  }
}

export class MailerLiteRequestError extends Error {
  readonly code: 'invalid_email' | 'rate_limited' | 'provider_unavailable';
  readonly status: number;
  readonly retryAfter: string | null;

  constructor(
    code: MailerLiteRequestError['code'],
    status: number,
    retryAfter: string | null = null,
  ) {
    super(code);
    this.name = 'MailerLiteRequestError';
    this.code = code;
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

export function normalizeAndValidateEmail(value: unknown): string {
  if (typeof value !== 'string') {
    throw new InvalidEmailAddressError();
  }

  const email = value.trim().toLowerCase();
  if (!email || email.length > EMAIL_MAX_LENGTH) {
    throw new InvalidEmailAddressError();
  }

  const atIndex = email.indexOf('@');
  if (atIndex <= 0 || atIndex !== email.lastIndexOf('@')) {
    throw new InvalidEmailAddressError();
  }

  const localPart = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);

  if (
    localPart.length > EMAIL_LOCAL_PART_MAX_LENGTH ||
    localPart.startsWith('.') ||
    localPart.endsWith('.') ||
    localPart.includes('..') ||
    !EMAIL_LOCAL_PART_PATTERN.test(localPart)
  ) {
    throw new InvalidEmailAddressError();
  }

  const domainLabels = domain.split('.');
  if (
    domainLabels.length < 2 ||
    domainLabels.some((label) => !DOMAIN_LABEL_PATTERN.test(label))
  ) {
    throw new InvalidEmailAddressError();
  }

  return email;
}

function getMailerLiteConfig() {
  const apiKey = process.env.MAILERLITE_API_KEY?.trim();
  const groupId = process.env.MAILERLITE_PRIVATEER_TALES_GROUP_ID?.trim();

  if (!apiKey || !groupId || !/^\d+$/.test(groupId)) {
    throw new MailerLiteConfigurationError();
  }

  return { apiKey, groupId };
}

export async function subscribeToPrivateerTalesMain(
  emailValue: unknown,
): Promise<void> {
  const email = normalizeAndValidateEmail(emailValue);
  const { apiKey, groupId } = getMailerLiteConfig();

  let response: Response;
  try {
    response = await fetch(
      `${MAILERLITE_CLASSIC_BASE_URL}/groups/${groupId}/subscribers`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-MailerLite-ApiKey': apiKey,
        },
        body: JSON.stringify({
          email,
          resubscribe: true,
          autoresponders: true,
        }),
        signal: AbortSignal.timeout(10_000),
      },
    );
  } catch {
    throw new MailerLiteRequestError('provider_unavailable', 502);
  }

  if (response.ok) {
    return;
  }

  if (response.status === 400 || response.status === 422) {
    throw new MailerLiteRequestError('invalid_email', 400);
  }

  if (response.status === 401 || response.status === 403 || response.status === 404) {
    throw new MailerLiteConfigurationError();
  }

  if (response.status === 429) {
    throw new MailerLiteRequestError(
      'rate_limited',
      503,
      response.headers.get('Retry-After'),
    );
  }

  throw new MailerLiteRequestError('provider_unavailable', 502);
}
