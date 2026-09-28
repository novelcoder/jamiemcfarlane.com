import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { getSeriesLandingData, type BookRecord } from '@/lib/catalog';

import styles from './science-fiction-adventures.module.css';

const seriesDescriptions: Record<string, string> = {
  'oldest-starfighter':
    'Retired Air Force ace Gordy Harmen gets a new body and an impossible second career: defending an alien union from invasion. A military science-fiction series about skill, defiance, and one pilot too stubborn to stay grounded.',
  'space-troopers':
    'Separated twins Peyton and Jai Foster enter Space Academy from opposite worlds, then discover that the corporations controlling the solar system may be more dangerous than the enemies they were trained to fight.',
  'tinker-knight-adventures':
    'When alien armies turn Elm Bluff, Iowa, into a buffer between two forces, Lester Knight, Jeremy Tinker, and Clara Daws discover how far they will go to protect their home.',
};

export const metadata: Metadata = {
  title: 'Science Fiction Adventures | Jamie McFarlane',
  description:
    'Explore Oldest Starfighter, Space Troopers, and Tinker/Knight Adventures by Jamie McFarlane.',
  alternates: {
    canonical: '/ScienceFictionAdventures',
  },
};

function bookPath(book: BookRecord) {
  return `/books/${encodeURIComponent(book.slug)}`;
}

function bookDescription(book: BookRecord) {
  return book.card_description || book.tagline || book.blurb.split('\n')[0];
}

function SeriesBooks({
  id,
  orderLabel,
  series,
  books,
}: {
  id: string;
  orderLabel: string;
  series: Awaited<ReturnType<typeof getSeriesLandingData>>['series'];
  books: BookRecord[];
}) {
  return (
    <section className={styles.seriesSection} id={id}>
      <div className={styles.seriesInner}>
        <div className={styles.seriesHeading}>
          <div>
            <p className={styles.eyebrow}>{orderLabel}</p>
            <h2>{series.name}</h2>
          </div>
          <p className={styles.seriesDescription}>
            {series.description || seriesDescriptions[series.slug]}
          </p>
        </div>

        <div className={styles.bookList}>
          {books.map((book) => (
            <Link
              className={styles.bookRow}
              href={bookPath(book)}
              key={book.id}
              aria-label={`Open ${book.title} book details`}
            >
              <Image
                className={styles.bookCover}
                src={book.cover_thumb_url || book.cover_url}
                alt={book.cover_alt}
                width={600}
                height={900}
                sizes="(max-width: 520px) 5rem, 8rem"
              />
              <div className={styles.bookCopy}>
                <p className={styles.bookNumber}>
                  {book.series_number === null
                    ? `A ${series.name} story`
                    : `Book ${book.series_number}`}
                </p>
                <h3>{book.title}</h3>
                <p>{bookDescription(book)}</p>
              </div>
              <span className={styles.bookAction}>
                Book details <ArrowRight aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function ScienceFictionAdventuresPage() {
  const [oldestStarfighter, spaceTroopers, tinkerKnight] = await Promise.all([
    getSeriesLandingData('oldest-starfighter'),
    getSeriesLandingData('space-troopers'),
    getSeriesLandingData('tinker-knight-adventures'),
  ]);

  return (
    <main className={styles.page}>
      <header className={styles.siteHeader}>
        <Link className={styles.wordmark} href="/">
          Jamie McFarlane
        </Link>
        <nav aria-label="Series on this page">
          <a href="#oldest-starfighter">Oldest Starfighter</a>
          <a href="#space-troopers">Space Troopers</a>
          <a href="#tinker-knight">Tinker/Knight</a>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Three series · Six books</p>
          <h1>
            More ways to find
            <span>your next adventure.</span>
          </h1>
          <p className={styles.heroDescription}>
            Older heroes, impossible missions, and ordinary people thrown into
            extraordinary wars. Explore three distinct science-fiction series,
            each with its own reading order.
          </p>
        </div>
      </section>

      <SeriesBooks
        id="oldest-starfighter"
        orderLabel="First stop · Two-book series"
        {...oldestStarfighter}
      />
      <SeriesBooks
        id="space-troopers"
        orderLabel="Next mission · Three-book series"
        {...spaceTroopers}
      />
      <SeriesBooks
        id="tinker-knight"
        orderLabel="One more world · One-book series"
        {...tinkerKnight}
      />

      <footer className={styles.footer}>
        <Link className={styles.wordmark} href="/">
          Jamie McFarlane
        </Link>
        <div>
          <Link href="/">Back to the homepage</Link>
          <Link href="/privacy">Privacy &amp; cookies</Link>
        </div>
      </footer>
    </main>
  );
}
