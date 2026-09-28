import { parseAttributionSourceKey } from './attribution-routing.ts';

export type AnalyticsEventName =
  | 'view_series_landing'
  | 'select_book'
  | 'amazon_purchase_click';

export type AnalyticsEventContext = {
  seriesSlug: string;
  sourceKey?: string | null;
  bookSlug?: string;
  seriesNumber?: number | null;
  placement?: string;
  linkType?: 'public_store' | 'amazon_attribution';
};

const SAFE_VALUE = /^[a-z0-9](?:[a-z0-9_-]{0,62}[a-z0-9])?$/;

function safeValue(value: string | undefined) {
  return value && SAFE_VALUE.test(value) ? value : undefined;
}

export function buildAnalyticsEvent(
  eventName: AnalyticsEventName,
  context: AnalyticsEventContext,
) {
  const seriesSlug = safeValue(context.seriesSlug);
  if (!seriesSlug) return null;

  const sourceKey = parseAttributionSourceKey(context.sourceKey ?? undefined);
  const bookSlug = safeValue(context.bookSlug);
  const placement = safeValue(context.placement);

  return {
    eventName,
    parameters: {
      series_slug: seriesSlug,
      ...(sourceKey ? { source_key: sourceKey } : {}),
      ...(bookSlug ? { book_slug: bookSlug } : {}),
      ...(context.seriesNumber !== null &&
      context.seriesNumber !== undefined &&
      Number.isFinite(context.seriesNumber)
        ? { series_number: context.seriesNumber }
        : {}),
      ...(placement ? { placement } : {}),
      ...(context.linkType ? { link_type: context.linkType } : {}),
    },
  };
}
