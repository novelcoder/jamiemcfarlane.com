import { randomUUID } from 'node:crypto';

import {
  APPWRITE_DATABASE_ID,
  appwriteFetch,
  equalQuery,
  limitQuery,
} from './catalog.ts';
import { parseAttributionSourceKey } from './attribution-routing.ts';
import { SPACESHIP_MECHANIC_LANDING_PATH } from './paid-landing-view-shared.ts';

export const PAID_LANDING_VIEWS_TABLE = 'paid_landing_views';
export { SPACESHIP_MECHANIC_LANDING_PATH };

type AppwriteRow = Record<string, unknown> & { $id: string };

export type PaidLandingView = {
  sourceKey: string;
  landingPath: typeof SPACESHIP_MECHANIC_LANDING_PATH;
};

export function eventDateInTimeZone(date: Date, timeZone = 'America/Chicago') {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  );
  return `${values.year}-${values.month}-${values.day}`;
}

export function parsePaidLandingView(value: unknown): PaidLandingView | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

  const fields = value as Record<string, unknown>;
  const sourceKey = parseAttributionSourceKey(
    typeof fields.source_key === 'string' ? fields.source_key : undefined,
  );
  if (!sourceKey || fields.landing_path !== SPACESHIP_MECHANIC_LANDING_PATH) {
    return null;
  }

  return { sourceKey, landingPath: SPACESHIP_MECHANIC_LANDING_PATH };
}

async function hasEnabledAttributionSource(sourceKey: string) {
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

export async function recordPaidLandingView(view: PaidLandingView) {
  if (!(await hasEnabledAttributionSource(view.sourceKey))) return false;

  await appwriteFetch(
    `/tablesdb/${APPWRITE_DATABASE_ID}/tables/${PAID_LANDING_VIEWS_TABLE}/rows`,
    {
      method: 'POST',
      body: JSON.stringify({
        rowId: randomUUID(),
        data: {
          event_date: eventDateInTimeZone(new Date()),
          landing_path: view.landingPath,
          source_key: view.sourceKey,
        },
        permissions: [],
      }),
    },
  );

  return true;
}
