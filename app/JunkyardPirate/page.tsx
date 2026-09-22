import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, Headphones } from 'lucide-react';

import { CookieSettingsButton } from '@/components/analytics-consent';
import { NewsletterSignup } from '@/components/newsletter-signup';
import { getSeriesLandingData, type BookRecord } from '@/lib/catalog';

import styles from './junkyard-pirate.module.css';

export const metadata: Metadata = {
  title: 'Junkyard Pirate | Jamie McFarlane',
  description:
    'Meet Albert “AJ” Jenkins and read Jamie McFarlane’s nine-book Junkyard Pirate military science-fiction series in order.',
  alternates: {
    canonical: '/JunkyardPirate',
  },
  openGraph: {
    title: 'Junkyard Pirate | Jamie McFarlane',
    description: 'The galaxy picked a fight with the wrong old veterans.',
    images: [
      {
        url: 'https://sfo.cloud.appwrite.io/v1/storage/buckets/6a50ff920031640f71bd/files/6a510087040ed2c6f583/view?project=6a0b4638002a71c2b8ec',
        width: 600,
        height: 900,
        alt: 'Junkyard Pirate by Jamie McFarlane',
      },
    ],
  },
};

function bookPath(book: BookRecord) {
  return `/books/${encodeURIComponent(book.slug)}`;
}

function bookLabel(book: BookRecord) {
  return book.series_number === null
    ? 'A Junkyard Pirate story'
    : `Book ${book.series_number}`;
}

export default async function JunkyardPiratePage() {
  const { series, books } = await getSeriesLandingData('junkyard-pirate');
  const startBook = books.find((book) => book.series_number === 1) ?? books[0];
  const description = series.description
    .split('\n\n')
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <main className={styles.page}>
      <a className={styles.skipLink} href="#reading-order">
        Skip to the reading order
      </a>

      <header className={styles.siteHeader}>
        <Link className={styles.wordmark} href="/">
          Jamie McFarlane
        </Link>
        <nav aria-label="Junkyard Pirate">
          <a href="#series">The series</a>
          <a href="#reading-order">Reading order</a>
        </nav>
        {startBook ? (
          <Link className={styles.headerButton} href={bookPath(startBook)}>
            Start Book 1
          </Link>
        ) : null}
      </header>

      <section className={styles.hero}>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>A nine-book science-fiction series</p>
            <h1>
              Junkyard
              <span>Pirate</span>
            </h1>
            <p className={styles.heroTagline}>{series.tagline}</p>
            <p className={styles.heroDescription}>
              {description[0] || series.description}
            </p>
            <div className={styles.heroActions}>
              {startBook ? (
                <Link
                  className={styles.primaryButton}
                  href={bookPath(startBook)}
                >
                  Start with Junkyard Pirate
                  <ArrowRight aria-hidden="true" />
                </Link>
              ) : null}
              <a className={styles.secondaryButton} href="#reading-order">
                See all nine books
              </a>
            </div>
          </div>

          {startBook ? (
            <div className={styles.heroVisual}>
              <span className={styles.heroStamp} aria-hidden="true">
                AJ
                <small>Jenkins Salvage</small>
              </span>
              <Link
                className={styles.heroCover}
                href={bookPath(startBook)}
                aria-label="Open Junkyard Pirate, Book 1"
              >
                <Image
                  src={startBook.cover_thumb_url || startBook.cover_url}
                  alt={startBook.cover_alt}
                  width={600}
                  height={900}
                  loading="eager"
                  sizes="(max-width: 720px) 68vw, 25rem"
                />
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      <section className={styles.seriesSection} id="series">
        <div className={styles.seriesHeading}>
          <p className={styles.eyebrow}>Old soldiers. New war.</p>
          <h2>From a Tucson junkyard to the front lines of the galaxy</h2>
        </div>
        <div className={styles.seriesCopy}>
          <p>{description[1] || description[0]}</p>
          <p>{description[2] || description.at(-1)}</p>
        </div>
        <dl className={styles.seriesFacts}>
          <div>
            <dt>{books.length}</dt>
            <dd>Books in order</dd>
          </div>
          <div>
            <dt>AJ</dt>
            <dd>One stubborn veteran</dd>
          </div>
          <div>
            <dt>Earth</dt>
            <dd>And then the galaxy</dd>
          </div>
        </dl>
      </section>

      <section className={styles.booksSection} id="reading-order">
        <div className={styles.sectionIntro}>
          <div>
            <p className={styles.eyebrow}>Reading order</p>
            <h2>Nine missions. Start at the junkyard.</h2>
          </div>
          <p>
            Follow AJ and his crew from Earth&apos;s first hidden invasion to
            the conflicts waiting beyond it.
          </p>
        </div>

        <div className={styles.bookGrid}>
          {books.map((book) => (
            <article className={styles.bookCard} key={book.id}>
              <Link
                className={styles.bookCover}
                href={bookPath(book)}
                aria-label={`${book.title}, ${bookLabel(book)}`}
              >
                <Image
                  src={book.cover_thumb_url || book.cover_url}
                  alt={book.cover_alt}
                  width={600}
                  height={900}
                  sizes="(max-width: 520px) 44vw, (max-width: 860px) 28vw, 15vw"
                />
              </Link>
              <div className={styles.bookCopy}>
                <p>{bookLabel(book)}</p>
                <h3>
                  <Link href={bookPath(book)}>{book.title}</Link>
                </h3>
                <span className={styles.bookTagline}>{book.tagline}</span>
                <div className={styles.bookLinks}>
                  <Link href={bookPath(book)}>
                    <BookOpen aria-hidden="true" /> Book details
                  </Link>
                  {book.audible_url ? (
                    <a href={book.audible_url} target="_blank" rel="noreferrer">
                      <Headphones aria-hidden="true" /> Audible
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.newsletterSection}>
        <div>
          <p className={styles.eyebrow}>Stay on the crew list</p>
          <h2>
            Get Jamie&apos;s next release notice
            <span>and a free starter library</span>
          </h2>
          <p>Occasional book news. No galactic bureaucracy.</p>
        </div>
        <NewsletterSignup compact />
      </section>

      <footer className={styles.footer}>
        <Link className={styles.wordmark} href="/">
          Jamie McFarlane
        </Link>
        <p>Junkyard Pirate is a series by Jamie McFarlane.</p>
        <div>
          <Link href="/privacy">Privacy &amp; cookies</Link>
          <CookieSettingsButton className={styles.cookieButton} />
        </div>
      </footer>
    </main>
  );
}
