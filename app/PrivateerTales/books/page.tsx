import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Compass, ExternalLink } from 'lucide-react';

import { CookieSettingsButton } from '@/components/analytics-consent';
import { getSeriesLandingData } from '@/lib/catalog';

import styles from '../privateer.module.css';

export const metadata: Metadata = {
  title: 'Reading Order | Privateer Tales',
  description: 'The complete Privateer Tales reading order by Jamie McFarlane.',
  alternates: {
    canonical: '/PrivateerTales/books',
  },
};

function formatDate(value: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function bookLabel(seriesNumber: number | null) {
  return seriesNumber === null
    ? 'Privateer Tales story'
    : `Book ${seriesNumber}`;
}

export default async function PrivateerBooksPage() {
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
          <Link className={styles.activeNav} href="/PrivateerTales/books">
            Books
          </Link>
          <Link href="/PrivateerTales#universe">The Universe</Link>
          <Link href="/PrivateerTales#characters">Characters</Link>
          <Link href="/PrivateerTales#extras">Extras</Link>
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

      <section className={styles.pageMasthead}>
        <p className={styles.eyebrow}>The complete series</p>
        <h1>Reading order</h1>
        <p>{series.card_meta}</p>
      </section>

      <section
        className={styles.catalogGrid}
        aria-label="Privateer Tales reading order"
      >
        {books.map((book) => (
          <article className={styles.catalogCard} key={book.id}>
            <Link className={styles.catalogCover} href={`/books/${book.slug}`}>
              <Image
                src={book.cover_thumb_url || book.cover_url}
                alt={book.cover_alt}
                width={600}
                height={900}
                sizes="(max-width: 700px) 36vw, (max-width: 980px) 24vw, 15rem"
                loading={
                  book.series_number !== null && book.series_number <= 8
                    ? 'eager'
                    : 'lazy'
                }
              />
              <span className={styles.catalogNumber}>
                {bookLabel(book.series_number)}
              </span>
            </Link>
            <div className={styles.catalogCopy}>
              {book.release_date ? (
                <p className={styles.catalogDate}>
                  {formatDate(book.release_date)}
                </p>
              ) : null}
              <h2>
                <Link href={`/books/${book.slug}`}>{book.title}</Link>
              </h2>
              {book.tagline ? (
                <p className={styles.catalogTagline}>{book.tagline}</p>
              ) : null}
              {book.card_description ? <p>{book.card_description}</p> : null}
              <Link className={styles.textLink} href={`/books/${book.slug}`}>
                View book <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </article>
        ))}
      </section>

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
