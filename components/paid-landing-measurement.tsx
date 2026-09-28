'use client';

import { useEffect, useRef } from 'react';

import { SPACESHIP_MECHANIC_LANDING_PATH } from '@/lib/paid-landing-view-shared';

import {
  ANALYTICS_CONSENT_CHANGED_EVENT,
  trackAnalyticsEvent,
} from './analytics-consent';

export function PaidLandingMeasurement({
  sourceKey,
}: {
  sourceKey: string | null;
}) {
  const landingSent = useRef(false);
  const gaEventSent = useRef(false);

  useEffect(() => {
    if (!sourceKey) return;

    if (!landingSent.current) {
      landingSent.current = true;
      void fetch('/api/analytics/paid-landing-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_key: sourceKey,
          landing_path: SPACESHIP_MECHANIC_LANDING_PATH,
        }),
        credentials: 'same-origin',
        keepalive: true,
      }).catch(() => undefined);
    }

    const trackConsentedLanding = () => {
      if (gaEventSent.current) return;
      gaEventSent.current = trackAnalyticsEvent('view_series_landing', {
        seriesSlug: 'spaceship-mechanic',
        sourceKey,
        placement: 'series_landing',
      });
    };

    trackConsentedLanding();
    window.addEventListener(
      ANALYTICS_CONSENT_CHANGED_EVENT,
      trackConsentedLanding,
    );
    return () =>
      window.removeEventListener(
        ANALYTICS_CONSENT_CHANGED_EVENT,
        trackConsentedLanding,
      );
  }, [sourceKey]);

  return null;
}
