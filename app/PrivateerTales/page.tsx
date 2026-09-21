import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Compass,
  ExternalLink,
  Orbit,
  Rocket,
  Users,
} from 'lucide-react';

import { CookieSettingsButton } from '@/components/analytics-consent';
import { getSeriesLandingData } from '@/lib/catalog';

import { PrivateerBookCarousel } from './privateer-book-carousel';
import styles from './privateer.module.css';

const PRIVATEER_SITE = 'https://privateertales.com';

const discoveryCards = [
  {
    id: 'universe',
    icon: Orbit,
    title: 'Explore the universe',
    description: 'Planets, factions, and the forces that shape the galaxy.',
    action: 'Learn more',
    href: '/PrivateerTales/books',
  },
  {
    id: 'characters',
    icon: Users,
    title: 'Meet the characters',
    description:
      'Liam, his crew, and the allies and adversaries they encounter.',
    action: 'Meet the crew',
    href: '/PrivateerTales/books',
  },
  {
    id: 'extras',
    icon: Rocket,
    title: 'Ships & gear',
    description: 'From the Sterra to the latest acquisitions.',
    action: 'Take a look',
    href: `${PRIVATEER_SITE}/ships`,
  },
  {
    id: 'reading-order',
    icon: BookOpen,
    title: 'Reading order',
    description: 'New to the series? We’ll get you started.',
    action: 'View the guide',
    href: '/PrivateerTales/books',
  },
] as const;

export const metadata: Metadata = {
  title: 'Privateer Tales | Jamie McFarlane',
  description:
    'Bold crews, distant worlds, and space-opera adventures by Jamie McFarlane.',
  alternates: {
    canonical: '/PrivateerTales',
  },
};

export default async function PrivateerTalesPage() {
  const { series, books } = await getSeriesLandingData('privateer-tales');
  const heroBook = books.find((book) => book.series_number === 1) ?? books[0];

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
          <a href="#universe">The Universe</a>
          <a href="#characters">Characters</a>
          <a href="#extras">Extras</a>
          <a href="#news">News</a>
        </nav>

        <Link
          className={`${styles.button} ${styles.buttonSmall}`}
          href={
            heroBook
              ? `/books/${encodeURIComponent(heroBook.slug)}`
              : '/PrivateerTales/books'
          }
        >
          Start here
        </Link>
      </header>

      <section id="top" className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>The Privateer Tales</p>
          <h1>Adventure has a different flag.</h1>
          <p className={styles.heroDescription}>{series.description}</p>

          {heroBook ? (
            <div className={styles.heroActions}>
              <Link
                className={styles.button}
                href={`/books/${encodeURIComponent(heroBook.slug)}`}
              >
                <span>
                  Start the series
                  <small>
                    {heroBook.title} — Book {heroBook.series_number}
                  </small>
                </span>
                <ArrowRight aria-hidden="true" />
              </Link>
              <Link className={styles.textLink} href="/PrivateerTales/books">
                View all books <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          ) : null}
        </div>

        <div className={styles.heroFeature}>
          {heroBook ? (
            <div
              className={styles.heroCoverWrap}
              aria-label={`Featured book: ${heroBook.title}`}
            >
              <span className={styles.coverGlow} aria-hidden="true" />
              <Image
                className={styles.heroKindle}
                src="/images/rookie-privateer-kindle.png"
                alt={`${heroBook.title} shown on an e-reader`}
                width="1024"
                height="1536"
                priority
              />
            </div>
          ) : null}

          <p className={styles.heroManifesto} aria-label="Series themes">
            <span className={styles.manifestoLine}>
              Freedom <span className={styles.manifestoSeparator}>•</span>{' '}
              Profit <span className={styles.manifestoSeparator}>•</span>{' '}
              Friends <span className={styles.manifestoSeparator}>•</span>{' '}
              Trouble <span className={styles.manifestoSeparator}>•</span>{' '}
              Repeat
            </span>
          </p>

          <div className={styles.heroReview}>
            <p>“Fast, fun, and impossible to put down.”</p>
            <span>— Reader review</span>
          </div>
        </div>
      </section>

      <section id="books" className={styles.bookSection}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>{series.card_tag || 'The Series'}</p>
            <h2>{books.length} books. A universe of opportunity.</h2>
          </div>
          <div className={styles.sectionNote}>
            <p>{series.card_meta}</p>
            <Link className={styles.textLink} href="/PrivateerTales/books">
              View reading order <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>

        <PrivateerBookCarousel books={books} />
      </section>

      <section
        className={styles.discoveryGrid}
        aria-label="Explore Privateer Tales"
      >
        {discoveryCards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              id={card.id}
              className={styles.discoveryCard}
              key={card.id}
            >
              <Icon aria-hidden="true" strokeWidth={1.35} />
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <Link className={styles.textLink} href={card.href}>
                {card.action} <ArrowRight aria-hidden="true" />
              </Link>
            </article>
          );
        })}
      </section>

      <section className={styles.frontierBanner}>
        <div className={styles.frontierStatement}>
          <h2>Some people follow orders. Others chart their own course.</h2>
          <span aria-hidden="true" />
        </div>
        <blockquote>
          “Jamie McFarlane delivers space adventure the way it should be — big,
          bold, and endlessly entertaining.”
          <cite>— Reader review</cite>
        </blockquote>
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
