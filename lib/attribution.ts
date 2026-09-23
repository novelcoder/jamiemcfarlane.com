import {
  APPWRITE_DATABASE_ID,
  appwriteFetch,
  type BookRecord,
  equalQuery,
  limitQuery,
} from '@/lib/catalog';

import {
  type AttributionSearchParam,
  isValidAmazonAttributionUrl,
  isValidAmazonClickThroughUrl,
  parseAttributionSourceKey,
  selectPurchaseUrl,
} from './attribution-routing';

const ATTRIBUTION_ROUTES_TABLE = 'attribution_routes';
const AMAZON_ATTRIBUTION_LINKS_TABLE = 'amazon_attribution_links';

type AppwriteRow = Record<string, unknown> & {
  $id: string;
};

export type AttributionContext = {
  sourceKey: string;
  purchaseUrls: Record<string, string>;
};

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function relationshipId(value: unknown) {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && '$id' in value) {
    return stringValue((value as { $id?: unknown }).$id);
  }
  return '';
}

async function getAttributionLink(linkId: string) {
  return appwriteFetch<AppwriteRow>(
    `/tablesdb/${APPWRITE_DATABASE_ID}/tables/${AMAZON_ATTRIBUTION_LINKS_TABLE}/rows/${encodeURIComponent(linkId)}`,
  );
}

export async function getSpaceshipAttributionContext(
  rawSourceKey: AttributionSearchParam,
  books: BookRecord[],
): Promise<AttributionContext | null> {
  const sourceKey = parseAttributionSourceKey(rawSourceKey);
  if (!sourceKey || books.length === 0) return null;

  try {
    const queries = new URLSearchParams();
    queries.append('queries[]', equalQuery('source_key', [sourceKey]));
    queries.append('queries[]', equalQuery('enabled', [true]));
    queries.append('queries[]', limitQuery(100));

    const result = await appwriteFetch<{ rows: AppwriteRow[] }>(
      `/tablesdb/${APPWRITE_DATABASE_ID}/tables/${ATTRIBUTION_ROUTES_TABLE}/rows?${queries.toString()}`,
    );
    if (result.rows.length === 0) return null;

    const booksBySlug = new Map(books.map((book) => [book.slug, book]));
    const routes = result.rows.map((route) => ({
      sourceKey: stringValue(route.source_key),
      bookSlug: stringValue(route.book_slug),
      linkId: relationshipId(route.attribution_link),
      enabled: route.enabled === true,
    }));
    const linkIds = [...new Set(routes.map((route) => route.linkId))].filter(
      Boolean,
    );
    const links = new Map<string, AppwriteRow>(
      await Promise.all(
        linkIds.map(
          async (linkId) => [linkId, await getAttributionLink(linkId)] as const,
        ),
      ),
    );
    const purchaseUrls: Record<string, string> = {};
    const rejectedSlugs = new Set<string>();

    for (const route of routes) {
      const book = booksBySlug.get(route.bookSlug);
      const link = links.get(route.linkId);
      if (
        !book ||
        !link ||
        !route.enabled ||
        route.sourceKey !== sourceKey ||
        relationshipId(link.book_id) !== book.id ||
        stringValue(link.kindle_asin) !== book.kindle_asin ||
        stringValue(link.status) !== 'active' ||
        !isValidAmazonClickThroughUrl(
          stringValue(link.click_through_url),
          book.kindle_asin,
        ) ||
        !isValidAmazonAttributionUrl(
          stringValue(link.attribution_url),
          book.kindle_asin,
        )
      ) {
        rejectedSlugs.add(route.bookSlug);
        delete purchaseUrls[route.bookSlug];
        continue;
      }

      if (purchaseUrls[route.bookSlug]) {
        rejectedSlugs.add(route.bookSlug);
        delete purchaseUrls[route.bookSlug];
        continue;
      }

      if (!rejectedSlugs.has(route.bookSlug)) {
        purchaseUrls[route.bookSlug] = stringValue(link.attribution_url);
      }
    }

    return Object.keys(purchaseUrls).length > 0
      ? { sourceKey, purchaseUrls }
      : null;
  } catch (error) {
    console.error(
      'Amazon Attribution routing is unavailable; using public store URLs.',
      error,
    );
    return null;
  }
}

export function purchaseUrlForBook(
  book: BookRecord,
  context: AttributionContext | null,
) {
  return selectPurchaseUrl({
    publicStoreUrl: book.store_url,
    attributionUrl: context?.purchaseUrls[book.slug],
    expectedAsin: book.kindle_asin,
  });
}
