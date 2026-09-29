'use client';

import { useEffect } from 'react';

import {
  newsletterSourceFromSearch,
  rememberNewsletterSource,
} from '@/lib/newsletter-attribution-shared';

export function NewsletterSourceCapture() {
  useEffect(() => {
    const sourceKey = newsletterSourceFromSearch(window.location.search);
    if (sourceKey) {
      rememberNewsletterSource(sourceKey, window.sessionStorage);
    }
  }, []);

  return null;
}
