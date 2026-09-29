import { parseAttributionSourceKey } from './attribution-routing.ts';

export const NEWSLETTER_SOURCE_STORAGE_KEY = 'jamie_newsletter_source_key';
export const UNKNOWN_SIGNUP_PATH = '/unknown';

type SessionStorage = Pick<Storage, 'getItem' | 'setItem'>;

export function rememberNewsletterSource(
  sourceKey: string,
  storage: SessionStorage,
) {
  const parsed = parseAttributionSourceKey(sourceKey);
  if (!parsed) return false;

  try {
    storage.setItem(NEWSLETTER_SOURCE_STORAGE_KEY, parsed);
    return true;
  } catch {
    return false;
  }
}

export function newsletterSourceForSignup(
  search: string,
  storage: SessionStorage,
) {
  const urlSource = newsletterSourceFromSearch(search);
  if (urlSource) return urlSource;

  try {
    return parseAttributionSourceKey(
      storage.getItem(NEWSLETTER_SOURCE_STORAGE_KEY) ?? undefined,
    );
  } catch {
    return null;
  }
}

export function newsletterSourceFromSearch(search: string) {
  const params = new URLSearchParams(search);
  const values = params.getAll('source_key');
  return values.length === 1 ? parseAttributionSourceKey(values[0]) : null;
}

export function parseSignupPath(value: unknown) {
  if (
    typeof value !== 'string' ||
    value.length < 1 ||
    value.length > 256 ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('?') ||
    value.includes('#')
  ) {
    return UNKNOWN_SIGNUP_PATH;
  }

  return value;
}
