import { parseAttributionSourceKey } from './attribution-routing.ts';
import { parseSignupPath } from './newsletter-attribution-shared.ts';

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
