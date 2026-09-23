export const ATTRIBUTION_QUERY_PARAM = 'source_key';

export type AttributionSearchParam = string | string[] | undefined;

const SOURCE_KEY_PATTERN = /^[a-z0-9](?:[a-z0-9_]{0,62}[a-z0-9])?$/;
const DISALLOWED_AMAZON_PARAMETERS = ['gclid', 'gbraid', 'wbraid'] as const;

export function parseAttributionSourceKey(value: AttributionSearchParam) {
  if (typeof value !== 'string' || !SOURCE_KEY_PATTERN.test(value)) {
    return null;
  }

  return value;
}

export function withAttribution(path: string, sourceKey: string | null) {
  if (!sourceKey || !path.startsWith('/') || path.startsWith('//')) {
    return path;
  }

  const url = new URL(path, 'https://www.jamiemcfarlane.com');
  url.searchParams.set(ATTRIBUTION_QUERY_PARAM, sourceKey);
  return `${url.pathname}${url.search}${url.hash}`;
}

function isExpectedAmazonProductUrl(url: URL, expectedAsin: string) {
  return (
    url.protocol === 'https:' &&
    url.hostname === 'www.amazon.com' &&
    url.port === '' &&
    url.username === '' &&
    url.password === '' &&
    url.pathname === `/dp/${expectedAsin}` &&
    url.hash === ''
  );
}

export function isValidAmazonClickThroughUrl(
  value: string,
  expectedAsin: string,
) {
  try {
    const url = new URL(value);
    return isExpectedAmazonProductUrl(url, expectedAsin) && url.search === '';
  } catch {
    return false;
  }
}

export function isValidAmazonAttributionUrl(
  value: string,
  expectedAsin: string,
) {
  try {
    const url = new URL(value);
    if (!isExpectedAmazonProductUrl(url, expectedAsin)) return false;

    if (
      url.searchParams.getAll('maas').length !== 1 ||
      !url.searchParams.get('maas') ||
      url.searchParams.getAll('ref_').length !== 1 ||
      url.searchParams.get('ref_') !== 'aa_maas' ||
      url.searchParams.getAll('tag').length !== 1 ||
      url.searchParams.get('tag') !== 'maas'
    ) {
      return false;
    }

    return DISALLOWED_AMAZON_PARAMETERS.every(
      (parameter) => !url.searchParams.has(parameter),
    );
  } catch {
    return false;
  }
}

export function selectPurchaseUrl({
  publicStoreUrl,
  attributionUrl,
  expectedAsin,
}: {
  publicStoreUrl: string;
  attributionUrl?: string;
  expectedAsin: string;
}) {
  if (
    attributionUrl &&
    isValidAmazonAttributionUrl(attributionUrl, expectedAsin)
  ) {
    return attributionUrl;
  }

  return publicStoreUrl;
}
