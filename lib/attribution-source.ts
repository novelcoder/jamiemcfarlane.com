import {
  APPWRITE_DATABASE_ID,
  appwriteFetch,
  equalQuery,
  limitQuery,
} from './catalog.ts';

type AppwriteRow = Record<string, unknown> & { $id: string };

export async function hasEnabledAttributionSource(sourceKey: string) {
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
