import assert from 'node:assert/strict';
import test from 'node:test';

import {
  JAMIE_MCFARLANE_SITE_ID,
  getPublicBooks,
  publicBookQueries,
  resolvePublicBook,
  siteSeriesQueries,
} from '../lib/catalog.ts';

const MAC_WORDEN_SITE_ID = '6a50421f00049e6726ae';

type Row = Record<string, unknown> & { $id: string };

const tables: Record<string, Row[]> = {
  series: [
    {
      $id: 'privateer-tales',
      slug: 'privateer-tales',
      sites: JAMIE_MCFARLANE_SITE_ID,
    },
    { $id: 'jack-and-coke', slug: 'jack-and-coke', sites: MAC_WORDEN_SITE_ID },
  ],
  books: [
    {
      $id: 'b1',
      slug: 'rookie-privateer',
      title: 'Rookie Privateer',
      status: 'published',
      series_id: 'privateer-tales',
    },
    {
      $id: 'b2',
      slug: 'fool-me-once',
      title: 'Fool Me Once',
      status: 'preorder',
      series_id: 'privateer-tales',
    },
    {
      $id: 'b3',
      slug: 'secret-draft',
      title: 'Secret Draft',
      status: 'draft',
      series_id: 'privateer-tales',
    },
    {
      $id: 'b4',
      slug: 'stray-evidence',
      title: 'Stray Evidence',
      status: 'published',
      series_id: 'jack-and-coke',
    },
  ],
};

// Minimal stand-in for the Appwrite TablesDB list endpoint: applies `equal`
// queries the way Appwrite does, so the test checks what the site asks for.
function fakeAppwrite(input: string | URL | Request) {
  const url = new URL(String(input));
  const table = url.pathname.match(/\/tables\/([^/]+)\/rows$/)?.[1] ?? '';
  const queries = url.searchParams
    .getAll('queries[]')
    .map(
      (query) =>
        JSON.parse(query) as {
          method: string;
          attribute?: string;
          values: unknown[];
        },
    );

  const rows = (tables[table] ?? []).filter((row) =>
    queries.every(
      (query) =>
        query.method !== 'equal' ||
        query.values.includes(row[query.attribute as string]),
    ),
  );

  return Promise.resolve(Response.json({ total: rows.length, rows }));
}

void test('series lookup is scoped to the jamiemcfarlane.com author site', () => {
  assert.deepEqual(JSON.parse(siteSeriesQueries(JAMIE_MCFARLANE_SITE_ID)[0]), {
    method: 'equal',
    attribute: 'sites',
    values: ['6ac921fe001bfe4ecb28'],
  });
});

void test('public book query filters by status and by this site’s series', () => {
  const queries = publicBookQueries(['privateer-tales']).map((query) =>
    JSON.parse(query),
  );
  assert.deepEqual(queries.slice(0, 2), [
    { method: 'equal', attribute: 'status', values: ['published', 'preorder'] },
    { method: 'equal', attribute: 'series_id', values: ['privateer-tales'] },
  ]);
});

void test('books from another author site are not public here', async (t) => {
  process.env.CATALOG_API_KEY = 'test-key';
  t.mock.method(globalThis, 'fetch', fakeAppwrite);

  const slugs = (await getPublicBooks()).map((book) => book.slug);
  assert.deepEqual(slugs, ['fool-me-once', 'rookie-privateer']);

  assert.equal(await resolvePublicBook('stray-evidence'), null);
  assert.equal(
    (await resolvePublicBook('RookiePrivateer'))?.slug,
    'rookie-privateer',
  );
});
