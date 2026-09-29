import { randomUUID } from 'node:crypto';

import { hasEnabledAttributionSource } from './attribution-source.ts';
import { parseAttributionSourceKey } from './attribution-routing.ts';
import { APPWRITE_DATABASE_ID, appwriteFetch } from './catalog.ts';
import { eventDateInTimeZone } from './paid-landing-view.ts';
import { parseSignupPath } from './newsletter-attribution-shared.ts';

export const NEWSLETTER_SIGNUP_EVENTS_TABLE = 'newsletter_signup_events';
export const NEWSLETTER_SITE_KEY = 'jamie_mcfarlane';

export type NewsletterSourceType = 'google_ads' | 'website_unattributed';

export type NewsletterSignupContext = {
  sourceKey: string | null;
  signupPath: string;
};

export function parseNewsletterSignupContext(
  fields: Record<string, unknown>,
): NewsletterSignupContext {
  return {
    sourceKey: parseAttributionSourceKey(
      typeof fields.source_key === 'string' ? fields.source_key : undefined,
    ),
    signupPath: parseSignupPath(fields.signup_path),
  };
}

export function sourceTypeForValidatedKey(
  sourceKey: string | null,
): NewsletterSourceType {
  return sourceKey?.startsWith('gads_') ? 'google_ads' : 'website_unattributed';
}

export async function recordNewsletterSignup(context: NewsletterSignupContext) {
  const isEnabledGoogleSource =
    context.sourceKey?.startsWith('gads_') === true &&
    (await hasEnabledAttributionSource(context.sourceKey));
  const sourceKey = isEnabledGoogleSource ? context.sourceKey : null;
  const sourceType = sourceTypeForValidatedKey(sourceKey);

  await appwriteFetch(
    `/tablesdb/${APPWRITE_DATABASE_ID}/tables/${NEWSLETTER_SIGNUP_EVENTS_TABLE}/rows`,
    {
      method: 'POST',
      body: JSON.stringify({
        rowId: randomUUID(),
        data: {
          site_key: NEWSLETTER_SITE_KEY,
          event_date: eventDateInTimeZone(new Date()),
          source_type: sourceType,
          ...(sourceKey ? { source_key: sourceKey } : {}),
          signup_path: context.signupPath,
        },
        permissions: [],
      }),
    },
  );
}
