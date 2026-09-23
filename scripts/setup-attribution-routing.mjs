const APPWRITE_ENDPOINT = 'https://sfo.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '6a0b4638002a71c2b8ec';
const APPWRITE_DATABASE_ID = '6a0b628900008b8506e3';
const AMAZON_LINKS_TABLE = 'amazon_attribution_links';
const ROUTES_TABLE = 'attribution_routes';
const SOURCE_KEY = 'gads_sm_b1_2026_09';

const apiKey = process.env.APPWRITE_SCHEMA_API?.trim();
if (!apiKey) {
  throw new Error(
    'APPWRITE_SCHEMA_API is required. Load the local development key with Node --env-file.',
  );
}

const attributionLinks = [
  {
    id: 'gads_sm_b1_2026_09_b1',
    campaign_name:
      'Google Search | Spaceship Mechanic | B1 Acquisition | Jamie Site | Sep 2026',
    ad_group_name: 'Google Search | Ad 783104886197 | B1 Button',
    publisher: 'Google Adwords',
    channel: 'Search',
    kindle_asin: 'B0FQG1S63H',
    book_id: 'boltguns-and-duct-tape',
    attribution_url:
      'https://www.amazon.com/dp/B0FQG1S63H?maas=maas_adg_F1D77CBE6246D2F728434EBB517F0820_afap_abs&ref_=aa_maas&tag=maas',
    click_through_url: 'https://www.amazon.com/dp/B0FQG1S63H',
    status: 'active',
  },
  {
    id: 'gads_sm_b1_2026_09_b2',
    campaign_name:
      'Google Search | Spaceship Mechanic | B1 Acquisition | Jamie Site | Sep 2026',
    ad_group_name: 'Google Search | Ad 783104886197 | B2 Button',
    publisher: 'Google Adwords',
    channel: 'Search',
    kindle_asin: 'B0G6FY869B',
    book_id: 'jump-drives-and-coffee-stains',
    attribution_url:
      'https://www.amazon.com/dp/B0G6FY869B?maas=maas_adg_4D7E183AC1F7124720DFCD0F21B99DED_afap_abs&ref_=aa_maas&tag=maas',
    click_through_url: 'https://www.amazon.com/dp/B0G6FY869B',
    status: 'active',
  },
  {
    id: 'gads_sm_b1_2026_09_b3',
    campaign_name:
      'Google Search | Spaceship Mechanic | B1 Acquisition | Jamie Site | Sep 2026',
    ad_group_name: 'Google Search | Ad 783104886197 | B3 Button',
    publisher: 'Google Adwords',
    channel: 'Search',
    kindle_asin: 'B0GWS3KM7B',
    book_id: 'ray-guns-and-late-fees',
    attribution_url:
      'https://www.amazon.com/dp/B0GWS3KM7B?maas=maas_adg_B8A41B868F0C76F6DCB7F8D9EF748EF1_afap_abs&ref_=aa_maas&tag=maas',
    click_through_url: 'https://www.amazon.com/dp/B0GWS3KM7B',
    status: 'active',
  },
  {
    id: 'gads_sm_b1_2026_09_b4',
    campaign_name:
      'Google Search | Spaceship Mechanic | B1 Acquisition | Jamie Site | Sep 2026',
    ad_group_name: 'Google Search | Ad 783104886197 | B4 Button',
    publisher: 'Google Adwords',
    channel: 'Search',
    kindle_asin: 'B0HGZZZKRD',
    book_id: 'flying-saucers-and-chrome-plate',
    attribution_url:
      'https://www.amazon.com/dp/B0HGZZZKRD?maas=maas_adg_3B260E2481B5F3E75DCC40E4FD735C96_afap_abs&ref_=aa_maas&tag=maas',
    click_through_url: 'https://www.amazon.com/dp/B0HGZZZKRD',
    status: 'active',
  },
];

function tablePath(tableId, suffix = '') {
  return `/tablesdb/${APPWRITE_DATABASE_ID}/tables/${tableId}${suffix}`;
}

async function request(
  path,
  { method = 'GET', body, allowNotFound = false } = {},
) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Appwrite-Project': APPWRITE_PROJECT_ID,
      'X-Appwrite-Key': apiKey,
      'X-Appwrite-Response-Format': '2.3.0',
    },
  };
  if (body !== undefined) options.body = JSON.stringify(body);

  const response = await fetch(`${APPWRITE_ENDPOINT}${path}`, options);

  const payload = await response.json().catch(() => null);
  if (allowNotFound && response.status === 404) return null;
  if (!response.ok) {
    throw new Error(
      `${method} ${path} failed with ${response.status}: ${payload?.message || response.statusText}`,
    );
  }
  return payload;
}

async function waitUntilAvailable(read, label) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const value = await read();
    if (value?.status === undefined || value.status === 'available')
      return value;
    if (value.status === 'failed' || value.status === 'stuck') {
      throw new Error(`${label} failed: ${value.error || value.status}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`${label} did not become available within 30 seconds.`);
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(
      `${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    );
  }
}

async function ensureTable({ id, name, columns }) {
  let table = await request(tablePath(id), { allowNotFound: true });
  if (!table) {
    await request(`/tablesdb/${APPWRITE_DATABASE_ID}/tables`, {
      method: 'POST',
      body: {
        tableId: id,
        name,
        permissions: [],
        rowSecurity: false,
        enabled: true,
        columns,
      },
    });
    table = await request(tablePath(id));
  }

  const actualColumns = new Map(
    table.columns.map((column) => [column.key, column]),
  );
  for (const expected of columns) {
    const actual = actualColumns.get(expected.key);
    if (!actual) throw new Error(`${id}.${expected.key} is missing.`);
    if (expected.type === 'url') {
      assertEqual(actual.type, 'string', `${id}.${expected.key} type`);
      assertEqual(actual.format, 'url', `${id}.${expected.key} format`);
    } else {
      assertEqual(actual.type, expected.type, `${id}.${expected.key} type`);
    }
    assertEqual(
      actual.required,
      expected.required,
      `${id}.${expected.key} required`,
    );
    if (expected.size !== undefined) {
      assertEqual(actual.size, expected.size, `${id}.${expected.key} size`);
    }
    if (expected.default !== undefined) {
      assertEqual(
        actual.default,
        expected.default,
        `${id}.${expected.key} default`,
      );
    }
  }
}

async function ensureRelationship(tableId, definition) {
  const path = tablePath(tableId, `/columns/${definition.key}`);
  let column = await request(path, { allowNotFound: true });
  if (!column) {
    await request(tablePath(tableId, '/columns/relationship'), {
      method: 'POST',
      body: definition,
    });
    column = await waitUntilAvailable(
      () => request(path),
      `${tableId}.${definition.key}`,
    );
  }

  assertEqual(column.type, 'relationship', `${tableId}.${definition.key} type`);
  assertEqual(
    column.relatedTable,
    definition.relatedTableId,
    `${tableId}.${definition.key} related table`,
  );
  assertEqual(
    column.relationType,
    definition.type,
    `${tableId}.${definition.key} relationship type`,
  );
  assertEqual(column.twoWay, false, `${tableId}.${definition.key} direction`);
  assertEqual(
    column.onDelete,
    definition.onDelete,
    `${tableId}.${definition.key} delete behavior`,
  );
}

async function ensureIndex(tableId, definition) {
  const path = tablePath(tableId, `/indexes/${definition.key}`);
  let index = await request(path, { allowNotFound: true });
  if (!index) {
    await request(tablePath(tableId, '/indexes'), {
      method: 'POST',
      body: definition,
    });
    index = await waitUntilAvailable(
      () => request(path),
      `${tableId}.${definition.key}`,
    );
  }

  assertEqual(index.type, definition.type, `${tableId}.${definition.key} type`);
  assertEqual(
    JSON.stringify(index.columns),
    JSON.stringify(definition.columns),
    `${tableId}.${definition.key} columns`,
  );
  if (definition.lengths) {
    assertEqual(
      JSON.stringify(index.lengths),
      JSON.stringify(definition.lengths),
      `${tableId}.${definition.key} lengths`,
    );
  }
}

async function getRow(tableId, rowId) {
  return request(tablePath(tableId, `/rows/${encodeURIComponent(rowId)}`), {
    allowNotFound: true,
  });
}

async function ensureRow(tableId, rowId, data, preservedKeys = []) {
  const existing = await getRow(tableId, rowId);
  if (!existing) {
    return request(tablePath(tableId, '/rows'), {
      method: 'POST',
      body: { rowId, data, permissions: [] },
    });
  }

  const update = { ...data };
  for (const key of preservedKeys) {
    if (existing[key] !== undefined) update[key] = existing[key];
  }
  return request(tablePath(tableId, `/rows/${encodeURIComponent(rowId)}`), {
    method: 'PATCH',
    body: { data: update },
  });
}

function relationshipId(value) {
  if (typeof value === 'string') return value;
  return value && typeof value === 'object' ? value.$id || '' : '';
}

function validateAmazonLink(link) {
  const clickThrough = new URL(link.click_through_url);
  const attributed = new URL(link.attribution_url);
  const expectedPath = `/dp/${link.kindle_asin}`;

  for (const [label, url] of [
    ['click-through URL', clickThrough],
    ['Attribution URL', attributed],
  ]) {
    assertEqual(url.protocol, 'https:', `${link.id} ${label} protocol`);
    assertEqual(url.hostname, 'www.amazon.com', `${link.id} ${label} host`);
    assertEqual(url.pathname, expectedPath, `${link.id} ${label} ASIN path`);
    assertEqual(url.hash, '', `${link.id} ${label} hash`);
  }

  assertEqual(clickThrough.search, '', `${link.id} click-through query`);
  assertEqual(
    attributed.searchParams.get('ref_'),
    'aa_maas',
    `${link.id} ref_`,
  );
  assertEqual(attributed.searchParams.get('tag'), 'maas', `${link.id} tag`);
  if (!attributed.searchParams.get('maas')) {
    throw new Error(`${link.id} is missing its maas value.`);
  }
  for (const parameter of ['gclid', 'gbraid', 'wbraid']) {
    if (attributed.searchParams.has(parameter)) {
      throw new Error(`${link.id} unexpectedly contains ${parameter}.`);
    }
  }
}

await ensureTable({
  id: AMAZON_LINKS_TABLE,
  name: 'Amazon Attribution Links',
  columns: [
    { key: 'campaign_name', type: 'varchar', size: 255, required: true },
    { key: 'ad_group_name', type: 'varchar', size: 255, required: true },
    { key: 'publisher', type: 'varchar', size: 100, required: true },
    { key: 'channel', type: 'varchar', size: 50, required: true },
    { key: 'kindle_asin', type: 'varchar', size: 10, required: true },
    { key: 'attribution_url', type: 'url', required: true },
    { key: 'click_through_url', type: 'url', required: true },
    {
      key: 'status',
      type: 'varchar',
      size: 20,
      required: false,
      default: 'active',
    },
  ],
});

await ensureTable({
  id: ROUTES_TABLE,
  name: 'Attribution Routes',
  columns: [
    { key: 'source_key', type: 'varchar', size: 64, required: true },
    { key: 'book_slug', type: 'varchar', size: 100, required: true },
    {
      key: 'enabled',
      type: 'boolean',
      required: false,
      default: false,
    },
  ],
});

await ensureRelationship(AMAZON_LINKS_TABLE, {
  key: 'book_id',
  relatedTableId: 'books',
  type: 'manyToOne',
  twoWay: false,
  onDelete: 'setNull',
});
await ensureRelationship(ROUTES_TABLE, {
  key: 'attribution_link',
  relatedTableId: AMAZON_LINKS_TABLE,
  type: 'manyToOne',
  twoWay: false,
  onDelete: 'restrict',
});

for (const index of [
  {
    key: 'uniq_attribution_url',
    type: 'unique',
    columns: ['attribution_url'],
    lengths: [191],
  },
  {
    key: 'idx_campaign',
    type: 'key',
    columns: ['campaign_name'],
    lengths: [191],
  },
  { key: 'idx_asin', type: 'key', columns: ['kindle_asin'] },
]) {
  await ensureIndex(AMAZON_LINKS_TABLE, index);
}
for (const index of [
  {
    key: 'uniq_source_book',
    type: 'unique',
    columns: ['source_key', 'book_slug'],
  },
  {
    key: 'idx_source_enabled',
    type: 'key',
    columns: ['source_key', 'enabled'],
  },
]) {
  await ensureIndex(ROUTES_TABLE, index);
}

for (const link of attributionLinks) {
  validateAmazonLink(link);
  const { id, ...data } = link;
  await ensureRow(AMAZON_LINKS_TABLE, id, data);
  await ensureRow(
    ROUTES_TABLE,
    id,
    {
      source_key: SOURCE_KEY,
      book_slug: link.book_id,
      attribution_link: id,
      enabled: false,
    },
    ['enabled'],
  );
}

for (const expected of attributionLinks) {
  const link = await getRow(AMAZON_LINKS_TABLE, expected.id);
  const route = await getRow(ROUTES_TABLE, expected.id);
  if (!link || !route) throw new Error(`${expected.id} failed readback.`);

  for (const key of [
    'campaign_name',
    'ad_group_name',
    'publisher',
    'channel',
    'kindle_asin',
    'attribution_url',
    'click_through_url',
    'status',
  ]) {
    assertEqual(link[key], expected[key], `${expected.id}.${key}`);
  }
  assertEqual(
    relationshipId(link.book_id),
    expected.book_id,
    `${expected.id}.book_id`,
  );
  assertEqual(route.source_key, SOURCE_KEY, `${expected.id}.source_key`);
  assertEqual(route.book_slug, expected.book_id, `${expected.id}.book_slug`);
  assertEqual(
    relationshipId(route.attribution_link),
    expected.id,
    `${expected.id}.attribution_link`,
  );
}

for (const link of attributionLinks) {
  await request(tablePath(ROUTES_TABLE, `/rows/${link.id}`), {
    method: 'PATCH',
    body: { data: { enabled: true } },
  });
}

const finalRoutes = await Promise.all(
  attributionLinks.map((link) => getRow(ROUTES_TABLE, link.id)),
);
if (finalRoutes.some((route) => route?.enabled !== true)) {
  throw new Error(
    'Not all Attribution routes were enabled after verification.',
  );
}

console.log(
  JSON.stringify(
    {
      tables: [AMAZON_LINKS_TABLE, ROUTES_TABLE],
      sourceKey: SOURCE_KEY,
      links: attributionLinks.map((link) => ({
        id: link.id,
        bookId: link.book_id,
        asin: link.kindle_asin,
      })),
      enabledRoutes: finalRoutes.length,
    },
    null,
    2,
  ),
);
