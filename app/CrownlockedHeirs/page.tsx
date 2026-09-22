import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Headphones } from 'lucide-react';

import { CookieSettingsButton } from '@/components/analytics-consent';
import { NewsletterSignup } from '@/components/newsletter-signup';
import { getSeriesLandingData, type BookRecord } from '@/lib/catalog';

import styles from './crownlocked-heirs.module.css';

export const metadata: Metadata = {
  title: 'Crownlocked Heirs | Jamie McFarlane',
  description:
    'Explore Crownlocked Heirs, Jamie McFarlane’s LitRPG fantasy series of hidden heirs, fallen kingdoms, dragons, and impossible quests.',
  alternates: {
    canonical: '/CrownlockedHeirs',
  },
  openGraph: {
    title: 'Crownlocked Heirs | Jamie McFarlane',
    description:
      'Two hidden heirs. Two fallen kingdoms. One impossible fellowship.',
    images: [
      {
        url: '/images/crownlocked-heirs/hero-bjargfold.jpg',
        width: 1672,
        height: 941,
        alt: 'A storm gathers over a fortress in Bjargfold',
      },
    ],
  },
};

function bookLabel(book: BookRecord) {
  return book.series_number === null
    ? 'A Crownlocked Heirs story'
    : `Book ${book.series_number}`;
}

export default async function CrownlockedHeirsPage() {
  const { series, books } = await getSeriesLandingData('crownlocked-heirs', [
    'published',
    'coming_soon',
  ]);
  const startBook = books.find((book) => book.series_number === 1) ?? books[0];
  const description = series.description
    .split('\n\n')
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <main className={styles.page}>
      <a className={styles.skipLink} href="#reading-order">
        Skip to the books
      </a>

      <header className={styles.siteHeader}>
        <Link className={styles.authorWordmark} href="/">
          Jamie McFarlane
        </Link>
        <nav aria-label="Crownlocked Heirs">
          <a href="#series">The series</a>
          <a href="#reading-order">Reading order</a>
        </nav>
        <a className={styles.headerButton} href="#reading-order">
          Explore the books
        </a>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>A LitRPG fantasy series</p>
          <h1 className={styles.seriesWordmark}>
            <Image
              src="/images/crownlocked-heirs/crownlocked-heirs-wordmark.png"
              alt="Crownlocked Heirs"
              width={2138}
              height={736}
              priority
              sizes="(max-width: 720px) 90vw, 46rem"
            />
          </h1>
          <p className={styles.heroTagline}>{series.tagline}</p>
          <div className={styles.heroActions}>
            {startBook?.store_url ? (
              <a
                className={styles.primaryButton}
                href={startBook.store_url}
                target="_blank"
                rel="noreferrer"
              >
                Start with {startBook.title}
                <ArrowUpRight aria-hidden="true" />
              </a>
            ) : null}
            <a className={styles.secondaryButton} href="#reading-order">
              See the reading order
            </a>
          </div>
        </div>
      </section>

      <section className={styles.seriesSection} id="series">
        <div className={styles.seriesHeading}>
          <p className={styles.eyebrow}>Beyond the safe world</p>
          <h2>Bjargfold remembers its heirs.</h2>
        </div>
        <div className={styles.seriesCopy}>
          {description.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <ul className={styles.seriesFeatures} aria-label="Series features">
          <li>LitRPG progression</li>
          <li>Fortresses &amp; kingdoms</li>
          <li>Dragons &amp; found family</li>
        </ul>
      </section>

      <section className={styles.booksSection} id="reading-order">
        <div className={styles.sectionIntro}>
          <div>
            <p className={styles.eyebrow}>Reading order</p>
            <h2>The Crownlocked path</h2>
          </div>
          <p>
            Begin with Theo&apos;s inheritance, then follow the hidden heirs as
            their worlds collide.
          </p>
        </div>

        <div className={styles.bookGrid}>
          {books.map((book) => (
            <article className={styles.bookCard} key={book.id}>
              <div className={styles.bookCover}>
                <Image
                  src={book.cover_thumb_url || book.cover_url}
                  alt={book.cover_alt}
                  width={600}
                  height={900}
                  sizes="(max-width: 560px) 72vw, (max-width: 900px) 38vw, 18rem"
                />
              </div>
              <div className={styles.bookCopy}>
                <p>{bookLabel(book)}</p>
                <h3>{book.title}</h3>
                <span>{book.tagline || book.card_description}</span>
                <div className={styles.bookLinks}>
                  {book.store_url ? (
                    <a href={book.store_url} target="_blank" rel="noreferrer">
                      {book.store_label || 'View the book'}
                      <ArrowUpRight aria-hidden="true" />
                    </a>
                  ) : null}
                  {book.audible_url ? (
                    <a
                      className={styles.audioLink}
                      href={book.audible_url}
                      target="_blank"
                      rel="noreferrer"
                    >
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
          <p className={styles.eyebrow}>Continue the adventure</p>
          <h2>
            Get Jamie&apos;s next release notice
            <span>and a free starter library</span>
          </h2>
          <p>Occasional book news. No royal obligations.</p>
        </div>
        <NewsletterSignup compact />
      </section>

      <footer className={styles.footer}>
        <Link className={styles.authorWordmark} href="/">
          Jamie McFarlane
        </Link>
        <p>Crownlocked Heirs is a series by Jamie McFarlane.</p>
        <div>
          <Link href="/privacy">Privacy &amp; cookies</Link>
          <CookieSettingsButton className={styles.cookieButton} />
        </div>
      </footer>
    </main>
  );
}
