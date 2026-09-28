'use client';

import Link from 'next/link';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

import type { AnalyticsEventContext } from '@/lib/analytics-events';

import { trackAnalyticsEvent } from './analytics-consent';

type SharedProps = {
  children: ReactNode;
  tracking: AnalyticsEventContext;
};

type TrackedAmazonLinkProps = SharedProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'href'> & {
    href: string;
  };

export function TrackedAmazonLink({
  children,
  tracking,
  href,
  onClick,
  ...props
}: TrackedAmazonLinkProps) {
  return (
    <a
      {...props}
      href={href}
      onClick={(event) => {
        trackAnalyticsEvent('amazon_purchase_click', tracking);
        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}

type TrackedBookLinkProps = SharedProps & {
  href: string;
  className?: string;
  ariaLabel?: string;
};

export function TrackedBookLink({
  children,
  tracking,
  href,
  className,
  ariaLabel,
}: TrackedBookLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      aria-label={ariaLabel}
      onClick={() => trackAnalyticsEvent('select_book', tracking)}
    >
      {children}
    </Link>
  );
}
