const APPWRITE_ENDPOINT = 'https://sfo.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '6a0b4638002a71c2b8ec';
const APPWRITE_DATABASE_ID = '6a0b628900008b8506e3';
const TABLE_ID = 'newsletter_signup_events';
const SITE_KEY = 'jamie_mcfarlane';
const apply = process.argv.includes('--apply');

const apiKey = process.env.APPWRITE_SCHEMA_API?.trim();
const runtimeApiKey = process.env.CATALOG_API_KEY?.trim();
if (!apiKey) {
  throw new Error(
    'APPWRITE_SCHEMA_API is required. Load the local development key with Node --env-file.',
  );
}

const columns = [
  { key: 'site_key', type: 'varchar', size: 32, required: true },
  { key: 'event_date', type: 'varchar', size: 10, required: true },
  { key: 'source_type', type: 'varchar', size: 32, required: true },
  { key: 'source_key', type: 'varchar', size: 64, required: false },
  { key: 'signup_path', type: 'varchar', size: 256, required: true },
];

const indexes = [
  {
    key: 'idx_site_source_date',
    type: 'key',
    columns: ['site_key', 'source_type', 'event_date'],
  },
  {
    key: 'idx_source_type_date',
    type: 'key',
    columns: ['source_type', 'event_date'],
  },
  {
    key: 'idx_source_key_date',
    type: 'key',
    columns: ['source_key', 'event_date'],
  },
  {
    key: 'idx_signup_path_date',
    type: 'key',
    columns: ['signup_path', 'event_date'],
  },
];

function tablePath(suffix = '') {
  return `/tablesdb/${APPWRITE_DATABASE_ID}/tables/${TABLE_ID}${suffix}`;
}

async function request(
  path,
  { method = 'GET', body, allowNotFound = false, key = apiKey } = {},
) {
  const response = await fetch(`${APPWRITE_ENDPOINT}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Appwrite-Project': APPWRITE_PROJECT_ID,
      'X-Appwrite-Key': key,
      'X-Appwrite-Response-Format': '2.3.0',
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
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
    if (value?.status === undefined || value.status === 'available') {
      return value;
    }
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

let table = await request(tablePath(), { allowNotFound: true });
const missingColumns = [];
const missingIndexes = [];

if (!table && !apply) {
  console.log(
    JSON.stringify(
      {
        mode: 'preview',
        action: 'create',
        table: TABLE_ID,
        columns,
        indexes,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

if (!table) {
  await request(`/tablesdb/${APPWRITE_DATABASE_ID}/tables`, {
    method: 'POST',
    body: {
      tableId: TABLE_ID,
      name: 'Newsletter Signup Events',
      permissions: [],
      rowSecurity: false,
      enabled: true,
      columns,
    },
  });
  table = await request(tablePath());
}

const actualColumns = new Map(
  table.columns.map((column) => [column.key, column]),
);
for (const expected of columns) {
  let actual = actualColumns.get(expected.key);
  if (!actual) {
    missingColumns.push(expected.key);
    if (!apply) continue;
    await request(tablePath('/columns/varchar'), {
      method: 'POST',
      body: {
        key: expected.key,
        size: expected.size,
        required: expected.required,
        array: false,
      },
    });
    actual = await waitUntilAvailable(
      () => request(tablePath(`/columns/${expected.key}`)),
      `${TABLE_ID}.${expected.key}`,
    );
  }
  assertEqual(actual.type, expected.type, `${TABLE_ID}.${expected.key} type`);
  assertEqual(
    actual.required,
    expected.required,
    `${TABLE_ID}.${expected.key} required`,
  );
  assertEqual(actual.size, expected.size, `${TABLE_ID}.${expected.key} size`);
}

for (const index of indexes) {
  let current = await request(tablePath(`/indexes/${index.key}`), {
    allowNotFound: true,
  });
  if (!current) {
    missingIndexes.push(index.key);
    if (!apply) continue;
    await request(tablePath('/indexes'), { method: 'POST', body: index });
    current = await waitUntilAvailable(
      () => request(tablePath(`/indexes/${index.key}`)),
      `${TABLE_ID}.${index.key}`,
    );
  }
  if (current) {
    assertEqual(current.type, index.type, `${TABLE_ID}.${index.key} type`);
    assertEqual(
      JSON.stringify(current.columns),
      JSON.stringify(index.columns),
      `${TABLE_ID}.${index.key} columns`,
    );
  }
}

let runtimeWriteVerified = false;
if (apply) {
  if (!runtimeApiKey) {
    throw new Error(
      'CATALOG_API_KEY is required to verify the deployed runtime write path.',
    );
  }

  const probeId = `setup_probe_${Date.now()}`;
  await request(tablePath('/rows'), {
    method: 'POST',
    key: runtimeApiKey,
    body: {
      rowId: probeId,
      data: {
        site_key: SITE_KEY,
        event_date: '1970-01-01',
        source_type: 'website_unattributed',
        signup_path: '/setup-probe',
      },
      permissions: [],
    },
  });
  await request(tablePath(`/rows/${probeId}`), { method: 'DELETE' });
  const removedProbe = await request(tablePath(`/rows/${probeId}`), {
    allowNotFound: true,
  });
  if (removedProbe) throw new Error('Runtime write probe cleanup failed.');
  runtimeWriteVerified = true;
}

console.log(
  JSON.stringify(
    {
      mode: apply ? 'apply' : 'preview',
      table: TABLE_ID,
      status: apply ? 'ready' : 'exists',
      missingColumns,
      missingIndexes,
      runtimeWriteVerified,
    },
    null,
    2,
  ),
);
