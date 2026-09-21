import {
  ArrowRight,
  BookOpen,
  Globe2,
  ListOrdered,
  Rocket,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import { NewsletterSignup } from '@/components/newsletter-signup';

const series = [
  {
    name: 'Spaceship Mechanic',
    href: 'https://fickledragon.com/spaceship-mechanic',
    domain: 'fickledragon.com',
    cover:
      'https://sfo.cloud.appwrite.io/v1/storage/buckets/6a50ff920031640f71bd/files/boltguns-ducttape-cover/view?project=6a0b4638002a71c2b8ec',
    cardImage: '/cards/boltguns-card.jpg',
    alt: 'Boltguns and Duct Tape by Jamie McFarlane',
    className: 'spaceship',
  },
  {
    name: 'Crownlocked Heirs',
    href: 'https://crownlockedheirs.com',
    domain: 'crownlockedheirs.com',
    cover:
      'https://sfo.cloud.appwrite.io/v1/storage/buckets/6aabf091000da4dc7980/files/6aabf396003b238d5d33/view?project=6a0b4638002a71c2b8ec',
    cardImage:
      'https://sfo.cloud.appwrite.io/v1/storage/buckets/6aabf091000da4dc7980/files/6aabf396003b238d5d33/view?project=6a0b4638002a71c2b8ec',
    alt: 'Drakon Prince by Jamie McFarlane',
    className: 'crownlocked',
  },
  {
    name: 'Privateer Tales',
    href: 'https://privateertales.com',
    domain: 'privateertales.com',
    cover:
      'https://i0.wp.com/fickledragon.com/wp-content/uploads/2016/08/rookie_ebook_cover-600x900.jpg?resize=600%2C900',
    cardImage: '/cards/rookie-privateer-card.jpg',
    alt: 'Rookie Privateer by Jamie McFarlane',
    className: 'privateer',
  },
  {
    name: 'Junkyard Pirate',
    href: 'https://junkyardpirate.com',
    domain: 'junkyardpirate.com',
    cover:
      'https://sfo.cloud.appwrite.io/v1/storage/buckets/6a50ff920031640f71bd/files/6a510087040ed2c6f583/view?project=6a0b4638002a71c2b8ec',
    cardImage: '/cards/junkyard-pirate-card.jpg',
    alt: 'Junkyard Pirate by Jamie McFarlane',
    className: 'junkyard',
  },
] as const;

const comingSoon = [
  { label: 'Complete catalog', icon: BookOpen },
  { label: 'Reading orders', icon: ListOrdered },
  { label: 'Ships & equipment', icon: Rocket },
  { label: 'Characters', icon: Users },
  { label: 'Maps & timelines', icon: Globe2 },
] as const;

export default function Home() {
  return (
    <main>
      <a className="skip-link" href="#worlds">
        Skip to featured worlds
      </a>

      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Jamie McFarlane home">
          Jamie McFarlane
        </a>
        <nav aria-label="Primary navigation">
          <a href="#worlds">Books</a>
          <a className="nav-highlight" href="#free-books">
            Free Books
          </a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-backdrop" aria-hidden="true" />
        <div className="hero-grid site-shell">
          <div className="hero-copy">
            <p className="status-pill">
              <span aria-hidden="true" /> New site · Now taking shape
            </p>
            <h1>
              Your next adventure <em>starts here.</em>
            </h1>
            <p className="hero-description">
              Jamie McFarlane&apos;s books, worlds, reading orders, and
              behind-the-scenes material are getting a new home.
            </p>
            <NewsletterSignup anchorId="free-books" />
            <p className="signup-note">
              Occasional book news. Unsubscribe whenever you like.
            </p>
          </div>

          <div
            className="cover-stage"
            aria-label="Featured Jamie McFarlane series"
          >
            {series.map((item, index) => (
              <a
                className={`hero-cover hero-cover-${index + 1}`}
                href={item.href}
                key={item.name}
                aria-label={`Explore ${item.name} at ${item.domain}`}
              >
                <Image
                  src={item.cover}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 768px) 35vw, 14vw"
                />
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="worlds-section" id="worlds">
        <div className="site-shell">
          <div className="section-heading">
            <h2>Worlds to explore</h2>
            <p>Different worlds. The same sense of wonder.</p>
          </div>

          <div className="world-grid">
            {series.map((item) => (
              <a
                className={`world-card world-card-${item.className}`}
                href={item.href}
                key={item.name}
                aria-label={`Visit ${item.name} at ${item.domain}`}
              >
                <span className="world-art">
                  <Image
                    src={item.cardImage}
                    alt=""
                    fill
                    sizes="(max-width: 680px) 100vw, (max-width: 1040px) 50vw, 25vw"
                  />
                  <span className="world-art-shade" />
                </span>
                <span className="world-card-footer">
                  <span>
                    <strong>{item.name}</strong>
                    <small>{item.domain}</small>
                  </span>
                  <ArrowRight aria-hidden="true" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="coming-section" aria-labelledby="coming-title">
        <div className="site-shell">
          <div className="ornament-heading">
            <span aria-hidden="true" />
            <h2 id="coming-title">More of the universe is on the way</h2>
            <span aria-hidden="true" />
          </div>

          <div className="coming-grid">
            {comingSoon.map(({ label, icon: Icon }) => (
              <div className="coming-item" key={label}>
                <Icon aria-hidden="true" strokeWidth={1.25} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="author-banner">
        <div className="author-banner-backdrop" aria-hidden="true" />
        <div className="author-grid site-shell">
          <blockquote>
            <p>
              I&apos;m building this site to make it easier to find the next
              book, enter a new series, and explore the worlds behind the
              stories.
            </p>
            <cite>— Jamie</cite>
          </blockquote>
          <div className="closing-cta">
            <h2>Start with a free library</h2>
            <NewsletterSignup compact />
            <p className="signup-note">
              Occasional book news. Unsubscribe whenever you like.
            </p>
          </div>
        </div>
      </section>

      <footer className="site-footer site-shell">
        <span className="wordmark">Jamie McFarlane</span>
        <p>A new reader home is taking shape.</p>
      </footer>
    </main>
  );
}
