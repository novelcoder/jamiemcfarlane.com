import {
  APPWRITE_DATABASE_ID,
  appwriteFetch,
  equalQuery,
  limitQuery,
} from './catalog.ts';

type AppwriteRow = Record<string, unknown> & { $id: string };

// attribution_routes is shared with Mac Worden. Mac keys carry the `mw` brand
// segment (e.g. gads_mw_jc_b1_2026_09); they are never Jamie McFarlane sources,
// even when their route is enabled.
const OTHER_BRAND_SEGMENTS = new Set(['mw']);

export function isJamieAttributionSourceKey(sourceKey: string) {
  return !sourceKey
    .split('_')
    .some((segment) => OTHER_BRAND_SEGMENTS.has(segment));
}

export async function hasEnabledAttributionSource(sourceKey: string) {
  if (!isJamieAttributionSourceKey(sourceKey)) return false;

  const queries = new URLSearchParams();
  queries.append('queries[]', equalQuery('source_key', [sourceKey]));
  queries.append('queries[]', equalQuery('enabled', [true]));
  queries.append('queries[]', limitQuery(1));

  const result = await appwriteFetch<{ rows: AppwriteRow[] }>(
    `/tablesdb/${APPWRITE_DATABASE_ID}/tables/attribution_routes/rows?${queries.toString()}`,
  );

  return result.rows.some(
    (row) => row.source_key === sourceKey && row.enabled === true,
  );
}
