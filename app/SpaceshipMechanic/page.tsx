import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { CookieSettingsButton } from '@/components/analytics-consent';
import { NewsletterSignup } from '@/components/newsletter-signup';
import {
  getSpaceshipAttributionContext,
  purchaseUrlForBook,
} from '@/lib/attribution';
import {
  ATTRIBUTION_QUERY_PARAM,
  withAttribution,
} from '@/lib/attribution-routing';
import { getSeriesLandingData, type BookRecord } from '@/lib/catalog';

import { SpaceshipBookCarousel } from './spaceship-book-carousel';
import styles from './spaceship-mechanic.module.css';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

export const metadata: Metadata = {
  title: 'Spaceship Mechanic | Jamie McFarlane',
  description:
    'Meet Rix Banner, the crew of Calypso, and the battered universe of Jamie McFarlane’s Spaceship Mechanic series. Find the latest release, preorder, reading order, videos, and more.',
  alternates: {
    canonical: '/SpaceshipMechanic',
  },
  openGraph: {
    title: 'Spaceship Mechanic | Jamie McFarlane',
    description:
      'One busted spaceship. One small-town mechanic. One wild ride into the galaxy.',
    images: [
      {
        url: '/images/spaceship-mechanic/boltguns-gas-station-unlettered.jpg',
        width: 3600,
        height: 1461,
        alt: 'Spaceship Mechanic by Jamie McFarlane',
      },
    ],
  },
};

function bookPath(book: BookRecord) {
  return `/books/${encodeURIComponent(book.slug)}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date);
}

type SpaceshipMechanicPageProps = {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

export default async function SpaceshipMechanicPage({
  searchParams,
}: SpaceshipMechanicPageProps) {
  const { series, books } = await getSeriesLandingData('spaceship-mechanic', [
    'published',
    'coming_soon',
  ]);
  const query = await searchParams;
  const attribution = await getSpaceshipAttributionContext(
    query[ATTRIBUTION_QUERY_PARAM],
    books,
  );
  const startBook = books.find((book) => book.series_number === 1) ?? books[0];
  const upcomingBook = books.find((book) => book.status === 'coming_soon');
  const seriesIntro = series.description.split('\n\n')[1] || series.description;

  return (
    <main className={styles.page}>
      <a className={styles.skipLink} href="#books">
        Skip to the books
      </a>

      <header className={styles.siteHeader}>
        <Link className={styles.wordmark} href="/">
          Jamie McFarlane
        </Link>
        <nav aria-label="Spaceship Mechanic">
          <a href="#books">The books</a>
          <Link
            href={withAttribution(
              '/SpaceshipMechanic/explore',
              attribution?.sourceKey ?? null,
            )}
          >
            Explore the universe
          </Link>
        </nav>
        {startBook ? (
          <Link
            className={styles.headerButton}
            href={withAttribution(
              bookPath(startBook),
              attribution?.sourceKey ?? null,
            )}
          >
            Start the series
          </Link>
        ) : null}
      </header>

      <section className={styles.hero}>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>A Jamie McFarlane series</p>
            <h1>
              Spaceship
              <span>Mechanic</span>
            </h1>
            <p className={styles.heroTagline}>{series.tagline}</p>
            <p className={styles.heroDescription}>{seriesIntro}</p>

            {upcomingBook ? (
              <div className={styles.releaseNotice} id="coming-soon">
                <div>
                  <span>Coming {formatDate(upcomingBook.release_date)}</span>
                  <strong>{upcomingBook.title}</strong>
                </div>
                {upcomingBook.store_url ? (
                  <a
                    href={purchaseUrlForBook(upcomingBook, attribution)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Preorder <ArrowRight aria-hidden="true" />
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className={styles.heroShip} aria-label="The starship Calypso">
            <span className={styles.orbitOne} aria-hidden="true" />
            <span className={styles.orbitTwo} aria-hidden="true" />
            <Image
              src="/images/spaceship-mechanic/calypso-chrome-hero.png"
              alt="Calypso, a chrome-covered retro-futurist freighter from Spaceship Mechanic"
              width={1774}
              height={887}
              priority
              sizes="(max-width: 800px) 100vw, 58vw"
            />
            <div className={styles.shipPlate}>
              <span>Calypso</span>
              <small>C-57 · Still flying</small>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.storyFlow}>
        <div className={styles.exploreImage}>
          <Image
            src="/images/spaceship-mechanic/patience-station.png"
            alt="Patience Station inside a vast hollow asteroid, with repair bays, work lights, and ships"
            fill
            sizes="100vw"
          />
          <span className={styles.exploreShade} aria-hidden="true" />
        </div>

        <section className={styles.storyShelfSection} id="books">
          <div className={styles.storyShelfGrid}>
            <div className={styles.storyShelfCopy} id="explore">
              <p className={styles.eyebrow}>Old-school space opera</p>
              <h2>The garage door opens onto the galaxy</h2>
              <p>
                One busted spaceship. One small-town mechanic. One wild ride.
                Meet the crew, step aboard Calypso, and explore the universe
                behind the repairs.
              </p>
              <Link
                className={styles.secondaryButton}
                href={withAttribution(
                  '/SpaceshipMechanic/explore',
                  attribution?.sourceKey ?? null,
                )}
              >
                Explore the Spaceship Mechanic universe
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>

            <div className={styles.storyShelfBooks}>
              <div className={styles.storyShelfLabel}>
                <p className={styles.eyebrow}>Reading order</p>
              </div>
              <SpaceshipBookCarousel books={books} attribution={attribution} />
            </div>
          </div>
        </section>

        <section className={styles.dispatchSection}>
          <div>
            <p className={styles.eyebrow}>Station dispatches</p>
            <h2>
              Get the next release notice
              <span className={styles.dispatchBenefit}>
                and a free starter library
              </span>
            </h2>
            <p>
              Occasional book news from Jamie. No airlock paperwork required.
            </p>
          </div>
          <NewsletterSignup compact />
        </section>
      </div>

      <footer className={styles.footer}>
        <Link className={styles.wordmark} href="/">
          Jamie McFarlane
        </Link>
        <p>Spaceship Mechanic is a series by Jamie McFarlane.</p>
        <div>
          <Link href="/privacy">Privacy &amp; cookies</Link>
          <CookieSettingsButton className={styles.cookieButton} />
        </div>
      </footer>
    </main>
  );
}
