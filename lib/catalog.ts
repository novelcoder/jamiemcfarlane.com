import { cache } from 'react';

const APPWRITE_ENDPOINT = 'https://sfo.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '6a0b4638002a71c2b8ec';
const APPWRITE_DATABASE_ID = '6a0b628900008b8506e3';

export type SeriesRecord = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  card_tag?: string;
  card_meta?: string;
};

export type BookRecord = {
  id: string;
  series_id: string;
  series_number: number | null;
  title: string;
  slug: string;
  tagline: string;
  blurb: string;
  card_description: string;
  status: string;
  cover_url: string;
  cover_thumb_url: string;
  cover_alt: string;
  store_label: string;
  store_url: string;
  audible_url: string;
  release_date: string;
  kindle_asin: string;
  updated_at: string;
};

type AppwriteRow = Record<string, unknown> & {
  $id: string;
  $updatedAt?: string;
};

function stringValue(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function numberValue(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function getCatalogApiKey() {
  return (
    process.env.CATALOG_API_KEY?.trim() ||
    process.env.PRIVATEER_CATALOG_API_KEY?.trim()
  );
}

async function appwriteFetch<T>(path: string): Promise<T> {
  const apiKey = getCatalogApiKey();
  if (!apiKey) {
    throw new Error(
      'CATALOG_API_KEY is required to load the Jamie McFarlane catalog.',
    );
  }

  const response = await fetch(`${APPWRITE_ENDPOINT}${path}`, {
    headers: {
      'X-Appwrite-Project': APPWRITE_PROJECT_ID,
      'X-Appwrite-Key': apiKey,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as {
      message?: unknown;
      type?: unknown;
    } | null;
    const errorType = stringValue(error?.type);
    const errorMessage = stringValue(error?.message, response.statusText);
    const details = [errorType, errorMessage].filter(Boolean).join(': ');

    throw new Error(
      `Appwrite request failed with status ${response.status}${details ? `: ${details}` : ''}`,
    );
  }

  return response.json() as Promise<T>;
}

function asSeries(row: AppwriteRow): SeriesRecord {
  return {
    id: row.$id,
    name: stringValue(row.name),
    slug: stringValue(row.slug),
    tagline: stringValue(row.tagline),
    description: stringValue(row.description),
    card_tag: stringValue(row.card_tag),
    card_meta: stringValue(row.card_meta),
  };
}

function asBook(row: AppwriteRow): BookRecord {
  return {
    id: row.$id,
    series_id: stringValue(row.series_id),
    series_number: numberValue(row.series_number),
    title: stringValue(row.title),
    slug: stringValue(row.slug),
    tagline: stringValue(row.tagline),
    blurb: stringValue(row.blurb),
    card_description: stringValue(row.card_description),
    status: stringValue(row.status),
    cover_url: stringValue(row.cover_url),
    cover_thumb_url: stringValue(row.cover_thumb_url),
    cover_alt: stringValue(
      row.cover_alt,
      `${stringValue(row.title, 'Book')} cover`,
    ),
    store_label: stringValue(row.store_label, 'Buy the book'),
    store_url: stringValue(row.store_url),
    audible_url: stringValue(row.audible_url),
    release_date: stringValue(row.release_date),
    kindle_asin: stringValue(row.kindle_asin),
    updated_at: stringValue(row.$updatedAt),
  };
}

function equalQuery(attribute: string, values: unknown[]) {
  return JSON.stringify({ method: 'equal', attribute, values });
}

function limitQuery(limit: number) {
  return JSON.stringify({ method: 'limit', values: [limit] });
}

async function getSeriesBySlug(slug: string) {
  const queries = new URLSearchParams();
  queries.append('queries[]', equalQuery('slug', [slug]));
  queries.append('queries[]', limitQuery(1));

  const result = await appwriteFetch<{ rows: AppwriteRow[] }>(
    `/tablesdb/${APPWRITE_DATABASE_ID}/tables/series/rows?${queries.toString()}`,
  );
  const row = result.rows[0];

  if (!row) throw new Error(`Catalog series not found for slug: ${slug}`);
  return asSeries(row);
}

export const getSeriesById = cache(async (seriesId: string) => {
  const row = await appwriteFetch<AppwriteRow>(
    `/tablesdb/${APPWRITE_DATABASE_ID}/tables/series/rows/${encodeURIComponent(seriesId)}`,
  );
  return asSeries(row);
});

function sortBooks(left: BookRecord, right: BookRecord) {
  if (left.series_number === null && right.series_number === null) {
    return left.release_date.localeCompare(right.release_date);
  }
  if (left.series_number === null) return 1;
  if (right.series_number === null) return -1;
  return left.series_number - right.series_number;
}

export const getPublishedBooks = cache(async () => {
  const queries = new URLSearchParams();
  queries.append('queries[]', equalQuery('status', ['published']));
  queries.append('queries[]', limitQuery(100));

  const result = await appwriteFetch<{ rows: AppwriteRow[] }>(
    `/tablesdb/${APPWRITE_DATABASE_ID}/tables/books/rows?${queries.toString()}`,
  );

  return result.rows
    .map(asBook)
    .sort((left, right) => left.title.localeCompare(right.title));
});

export function normalizeBookRouteSlug(slug: string) {
  return slug.toLocaleLowerCase('en-US').replaceAll('-', '');
}

export const resolvePublishedBook = cache(async (requestedSlug: string) => {
  const books = await getPublishedBooks();
  const aliases = new Map<string, BookRecord>();

  for (const book of books) {
    const alias = normalizeBookRouteSlug(book.slug);
    const existing = aliases.get(alias);
    if (existing && existing.id !== book.id) {
      throw new Error(
        `Published book slugs have a normalized alias collision: ${existing.slug} and ${book.slug}`,
      );
    }
    aliases.set(alias, book);
  }

  return aliases.get(normalizeBookRouteSlug(requestedSlug)) ?? null;
});

export const getBookPageData = cache(async (requestedSlug: string) => {
  const book = await resolvePublishedBook(requestedSlug);
  if (!book) return null;

  const [series, books] = await Promise.all([
    getSeriesById(book.series_id),
    getPublishedBooks(),
  ]);
  const seriesBooks = books
    .filter((candidate) => candidate.series_id === book.series_id)
    .sort(sortBooks);
  const index = seriesBooks.findIndex((candidate) => candidate.id === book.id);

  return {
    book,
    series,
    previousBook: index > 0 ? seriesBooks[index - 1] : null,
    nextBook:
      index >= 0 && index < seriesBooks.length - 1
        ? seriesBooks[index + 1]
        : null,
  };
});

async function getBooksForSeries(seriesId: string, statuses: string[]) {
  const queries = new URLSearchParams();
  queries.append('queries[]', equalQuery('series_id', [seriesId]));
  queries.append('queries[]', equalQuery('status', statuses));
  queries.append('queries[]', limitQuery(100));

  const result = await appwriteFetch<{ rows: AppwriteRow[] }>(
    `/tablesdb/${APPWRITE_DATABASE_ID}/tables/books/rows?${queries.toString()}`,
  );

  return result.rows.map(asBook).sort(sortBooks);
}

export async function getSeriesLandingData(
  slug: string,
  statuses = ['published'],
): Promise<{
  series: SeriesRecord;
  books: BookRecord[];
}> {
  const series = await getSeriesBySlug(slug);
  const books = await getBooksForSeries(series.id, statuses);
  return { series, books };
}
