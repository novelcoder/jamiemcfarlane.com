import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpen, Headphones } from 'lucide-react';
import { notFound, permanentRedirect } from 'next/navigation';

import {
  getSpaceshipAttributionContext,
  purchaseUrlForBook,
} from '@/lib/attribution';
import {
  ATTRIBUTION_QUERY_PARAM,
  withAttribution,
} from '@/lib/attribution-routing';
import { getBookPageData } from '@/lib/catalog';
import { seriesLandingPath, seriesReadingOrderPath } from '@/lib/series-routes';

import styles from './book.module.css';

const SITE_URL = 'https://www.jamiemcfarlane.com';

type BookPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

function canonicalBookPath(slug: string) {
  return `/books/${encodeURIComponent(slug)}`;
}

function bookPosition(seriesName: string, seriesNumber: number | null) {
  return seriesNumber === null
    ? `A ${seriesName} story`
    : `${seriesName} · Book ${seriesNumber}`;
}

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

export async function generateMetadata({
  params,
}: BookPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getBookPageData(slug);

  if (!data) {
    return {
      title: 'Book not found | Jamie McFarlane',
      robots: { index: false, follow: false },
    };
  }

  const { book, series } = data;
  const canonicalPath = canonicalBookPath(book.slug);
  const description =
    book.card_description || book.tagline || book.blurb.slice(0, 160);

  return {
    title: `${book.title} | Jamie McFarlane`,
    description,
    alternates: {
      canonical: `${SITE_URL}${canonicalPath}`,
    },
    openGraph: {
      type: 'book',
      title: book.title,
      description,
      url: `${SITE_URL}${canonicalPath}`,
      siteName: 'Jamie McFarlane',
      images: [
        {
          url: book.cover_url,
          alt: book.cover_alt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: book.title,
      description,
      images: [book.cover_url],
    },
    other: {
      'book:release_date': book.release_date,
      'book:series': series.name,
    },
  };
}

export default async function BookPage({
  params,
  searchParams,
}: BookPageProps) {
  const { slug } = await params;
  const data = await getBookPageData(slug);

  if (!data) notFound();

  const { book, series, seriesBooks, previousBook, nextBook } = data;
  const query = await searchParams;
  const attribution =
    series.slug === 'spaceship-mechanic'
      ? await getSpaceshipAttributionContext(
          query[ATTRIBUTION_QUERY_PARAM],
          seriesBooks,
        )
      : null;
  const attributedPath = (path: string) =>
    withAttribution(path, attribution?.sourceKey ?? null);
  if (slug !== book.slug) {
    permanentRedirect(attributedPath(canonicalBookPath(book.slug)));
  }

  const canonicalUrl = `${SITE_URL}${canonicalBookPath(book.slug)}`;
  const paragraphs = book.blurb.split(/\n\s*\n/).filter(Boolean);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    url: canonicalUrl,
    image: book.cover_url,
    description: book.card_description || book.tagline || book.blurb,
    datePublished: book.release_date || undefined,
    author: {
      '@type': 'Person',
      name: 'Jamie McFarlane',
      url: SITE_URL,
    },
    isPartOf: {
      '@type': 'CreativeWorkSeries',
      name: series.name,
      url: `${SITE_URL}${seriesLandingPath(series.slug)}`,
    },
    sameAs: book.store_url || undefined,
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.wordmark} href="/">
          Jamie McFarlane
        </Link>
        <Link
          className={styles.seriesLink}
          href={attributedPath(seriesLandingPath(series.slug))}
        >
          {series.name}
        </Link>
      </header>

      <article className={styles.bookDetail}>
        <div className={styles.coverWrap}>
          <span className={styles.coverGlow} aria-hidden="true" />
          <Image
            src={book.cover_url}
            alt={book.cover_alt}
            width={600}
            height={900}
            sizes="(max-width: 760px) 64vw, 30vw"
            priority
            className={styles.cover}
          />
        </div>

        <div className={styles.copy}>
          <Link
            className={styles.backLink}
            href={attributedPath(seriesReadingOrderPath(series.slug))}
          >
            <ArrowLeft aria-hidden="true" /> {series.name} reading order
          </Link>
          <p className={styles.eyebrow}>
            {bookPosition(series.name, book.series_number)}
          </p>
          <h1>{book.title}</h1>
          {book.tagline ? (
            <p className={styles.tagline}>{book.tagline}</p>
          ) : null}
          {book.release_date ? (
            <p className={styles.releaseDate}>
              Published {formatDate(book.release_date)}
            </p>
          ) : null}

          <div className={styles.blurb}>
            {paragraphs.map((paragraph, index) => (
              <p key={`${book.id}-${index}`}>{paragraph}</p>
            ))}
          </div>

          <div className={styles.actions}>
            {book.store_url ? (
              <a
                className={styles.primaryButton}
                href={purchaseUrlForBook(book, attribution)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <BookOpen aria-hidden="true" />
                {book.store_label || 'Buy the book'}
              </a>
            ) : null}
            {book.audible_url ? (
              <a
                className={styles.secondaryButton}
                href={book.audible_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Headphones aria-hidden="true" /> Listen on Audible
              </a>
            ) : null}
          </div>
        </div>
      </article>

      <nav className={styles.pagination} aria-label="Adjacent books">
        {previousBook ? (
          <Link href={attributedPath(canonicalBookPath(previousBook.slug))}>
            <ArrowLeft aria-hidden="true" />
            <span>
              Previous
              <strong>{previousBook.title}</strong>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {nextBook ? (
          <Link href={attributedPath(canonicalBookPath(nextBook.slug))}>
            <span>
              Next
              <strong>{nextBook.title}</strong>
            </span>
            <ArrowRight aria-hidden="true" />
          </Link>
        ) : (
          <span />
        )}
      </nav>

      <footer className={styles.footer}>
        <Link className={styles.wordmark} href="/">
          Jamie McFarlane
        </Link>
        <Link href={attributedPath(seriesLandingPath(series.slug))}>
          Explore {series.name}
        </Link>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
    </main>
  );
}
