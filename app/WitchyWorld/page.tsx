import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { getSeriesLandingData, type BookRecord } from '@/lib/catalog';

import styles from './witchy-world.module.css';

const bookDescriptions: Record<string, string> = {
  'wizard-in-a-witchy-world':
    'A vision of a witch dying at the hands of a werewolf pulls modern-day wizard Felix Slade into a murder, a suspicious coven, and a danger he cannot ignore.',
  'wicked-folk':
    'A demon is loose, a young witch is being hunted, and Felix must confront the darkness inside himself before it reaches everyone he loves.',
  'wizard-unleashed':
    'Felix crosses into a new realm to uncover the truth of his origins—and decide whether the power he fears is the only thing that can save his family.',
  'as-a-crow-flies':
    'Maggie watches over young Felix from the shadows, but when his emerging magic sets fire to a foster home, she must risk discovery to save him.',
  'grave-consideration':
    'A haunted house, a magically sealed room, and a fanged menace leave Felix needing witchy help to survive his newest home.',
};

export const metadata: Metadata = {
  title: 'Witchy World | Jamie McFarlane',
  description:
    'Enter Witchy World, Jamie McFarlane’s dark urban-fantasy series of wizards, witches, werewolves, demons, and dangerous visions.',
  alternates: {
    canonical: '/WitchyWorld',
  },
};

function bookPath(book: BookRecord) {
  return `/books/${encodeURIComponent(book.slug)}`;
}

function bookLabel(book: BookRecord) {
  return book.series_number === null
    ? 'A Witchy World story'
    : `Book ${book.series_number}`;
}

export default async function WitchyWorldPage() {
  const { series, books } = await getSeriesLandingData('witchy-world');

  return (
    <main className={styles.page}>
      <header className={styles.siteHeader}>
        <Link className={styles.wordmark} href="/">
          Jamie McFarlane
        </Link>
        <nav aria-label="Witchy World">
          <a href="#world">The world</a>
          <a href="#reading-order">Reading order</a>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroArtwork} aria-hidden="true">
          <Image
            src="/images/witchy-world/witchy-world-hero.jpg"
            alt=""
            fill
            sizes="100vw"
            priority
          />
        </div>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Dark urban fantasy</p>
            <h1>
              Witchy
              <span>World</span>
            </h1>
            <p className={styles.heroDescription}>
              Felix Slade knows better than to meddle in the lives of witches.
              Visions of blood, demons, and impossible danger keep giving him no
              choice.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.worldSection} id="world">
        <div className={styles.worldInner}>
          <p className={styles.eyebrow}>Where the ordinary world ends</p>
          <h2>Every vision leaves a mark.</h2>
          <p>
            Modern wizard Felix Slade would prefer to keep his secrets buried.
            Instead, his visions draw him toward threatened witches, restless
            ghosts, werewolves, demons, and the dangerous source of his own
            magic. Witchy World is an urban-fantasy journey through love,
            family, and the darkness power can awaken.
          </p>
        </div>
      </section>

      <section className={styles.booksSection} id="reading-order">
        <div className={styles.booksInner}>
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>Reading order</p>
              <h2>{series.name}</h2>
            </div>
            <p>
              Begin with Felix’s first vision, follow the numbered trilogy, then
              continue with the unnumbered Witchy World stories.
            </p>
          </div>

          <div className={styles.bookList}>
            {books.map((book) => (
              <Link
                className={styles.bookRow}
                href={bookPath(book)}
                key={book.id}
                aria-label={`Open ${book.title}, ${bookLabel(book)}`}
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
                  <p className={styles.bookNumber}>{bookLabel(book)}</p>
                  <h3>{book.title}</h3>
                  <p>
                    {bookDescriptions[book.slug] ||
                      book.tagline ||
                      book.blurb.split('\n')[0]}
                  </p>
                </div>
                <span className={styles.bookAction}>
                  Book details <ArrowRight aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

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
