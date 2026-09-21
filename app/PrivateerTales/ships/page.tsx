import type { Metadata } from 'next';
import Link from 'next/link';
import { Compass, ExternalLink } from 'lucide-react';

import { CookieSettingsButton } from '@/components/analytics-consent';
import { ShipRegistry } from '@/components/ship-registry';
import { getSeriesLandingData } from '@/lib/catalog';

import styles from '../privateer.module.css';
import '../ship-registry.css';

export const metadata: Metadata = {
  title: 'Ship Registry | Privateer Tales | Jamie McFarlane',
  description:
    'Explore the ships of Privateer Tales, with specifications, histories, and source passages through Parley.',
  alternates: {
    canonical: '/PrivateerTales/ships',
  },
};

export default async function PrivateerShipsPage() {
  const { series, books } = await getSeriesLandingData('privateer-tales');
  const firstBook = books.find((book) => book.series_number === 1) ?? books[0];

  return (
    <main className={styles.page}>
      <header className={styles.siteHeader}>
        <Link
          className={styles.brand}
          href="/PrivateerTales"
          aria-label="Privateer Tales home"
        >
          <span className={styles.brandMark} aria-hidden="true">
            <Compass strokeWidth={1.25} />
          </span>
          <span>
            <strong>{series.name}</strong>
            <small>{series.tagline}</small>
          </span>
        </Link>

        <nav className={styles.primaryNav} aria-label="Privateer Tales">
          <Link href="/PrivateerTales/books">Books</Link>
          <Link href="/PrivateerTales#universe">The Universe</Link>
          <Link href="/PrivateerTales#characters">Characters</Link>
          <Link
            aria-current="page"
            className={styles.activeNav}
            href="/PrivateerTales/ships"
          >
            Extras
          </Link>
          <Link href="/PrivateerTales#news">News</Link>
        </nav>

        <Link
          className={`${styles.button} ${styles.buttonSmall}`}
          href={
            firstBook ? `/books/${firstBook.slug}` : '/PrivateerTales/books'
          }
        >
          Start here
        </Link>
      </header>

      <div className="ship-registry-page">
        <ShipRegistry />
      </div>

      <footer className={styles.siteFooter} id="news">
        <Link className={`${styles.brand} ${styles.footerBrand}`} href="/">
          <span className={styles.brandMark} aria-hidden="true">
            <Compass strokeWidth={1.25} />
          </span>
          <span>
            <strong>{series.name}</strong>
            <small>A series by Jamie McFarlane</small>
          </span>
        </Link>

        <div className={styles.footerJoin}>
          <p className={styles.footerTitle}>Join the crew</p>
          <p>News, new releases, and exclusive content from Jamie McFarlane.</p>
        </div>

        <div className={styles.footerLegal} aria-label="Privacy links">
          <Link href="/privacy">Privacy &amp; cookies</Link>
          <CookieSettingsButton className={styles.cookieSettingsButton} />
        </div>

        <Link className={`${styles.button} ${styles.footerButton}`} href="/">
          Visit Jamie McFarlane <ExternalLink aria-hidden="true" />
        </Link>
      </footer>
    </main>
  );
}
