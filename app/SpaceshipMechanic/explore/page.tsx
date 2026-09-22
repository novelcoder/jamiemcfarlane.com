import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  MapPin,
  Rocket,
  Users,
  Wrench,
} from 'lucide-react';

import { CookieSettingsButton } from '@/components/analytics-consent';
import { getSeriesLandingData } from '@/lib/catalog';

import { SpaceshipVideoGallery } from '../spaceship-video-gallery';
import styles from '../spaceship-mechanic.module.css';

const crew = [
  {
    initials: 'RB',
    name: 'Rix Banner',
    role: 'Mechanic · Reluctant hero',
    image: '/images/spaceship-mechanic/rix-crew.png',
    imageAlt:
      'Rix Banner posing beside engine machinery in Calypso’s engine room',
    portraitTopAligned: true,
    description:
      'A World War II airplane mechanic who can diagnose almost anything—usually while calculating what the repair is going to cost him.',
  },
  {
    initials: 'KW',
    name: 'Kel Warp',
    role: 'Pilot · Trader · Instigator',
    image: '/images/spaceship-mechanic/kel-crew.png',
    imageAlt:
      'Kel Warp posing in a tailored flight suit with Calypso behind her in a bright hangar',
    portraitTopAligned: true,
    description:
      'Calypso’s fearless pilot and Rix’s fifty-fifty partner. Kel sees opportunity where everyone else sees incoming fire.',
  },
  {
    initials: 'AM',
    name: 'Amari',
    role: 'Pilot · Strategist',
    image: '/images/spaceship-mechanic/amari-crew.png',
    imageAlt:
      'Amari posing beside a space-station observation window overlooking a sparse asteroid field',
    portraitTopAligned: true,
    description:
      'Perceptive, formidable, and impossible to underestimate. Amari brings sharp instincts to the crew’s messiest problems.',
  },
  {
    initials: 'PH',
    name: 'Philo',
    role: 'Crew · Repair · Cargo',
    image: '/images/spaceship-mechanic/philo-crew-human.png',
    imageAlt:
      'Philo smiling in his coveralls in front of a tall workshop tool chest',
    portraitTopAligned: false,
    description:
      'A short, bearded Korrali with impressive strength, a gift for making friends at every port, and absolute loyalty to his found family.',
  },
  {
    initials: 'BV',
    name: 'Beverly',
    role: 'Research · Translation · Systems',
    image: '/images/spaceship-mechanic/beverly-crew.png',
    imageAlt:
      'Beverly’s projected avatar leaning against a full-sized coffee cup on a workshop table',
    portraitTopAligned: false,
    description:
      'A microscopic Beltigersk symbiote with a projected avatar, formidable processing power, and opinions about almost everything.',
  },
] as const;

const videos = [
  {
    id: 'PNl6bOEX4k8',
    title: 'Boltguns and Duct Tape Trailer',
    label: 'Series trailer · 0:57',
  },
  {
    id: 'd4sKd2mMp1o',
    title: 'Ray Guns and Late Fees Now Available',
    label: 'Release video · 0:21',
  },
  {
    id: 'o30lpdwkgeM',
    title: 'Some Repairs Needed',
    label: 'From the repair bay · 0:38',
  },
  {
    id: 'iGqUIvzHkuc',
    title: 'Structural Duct Tape',
    label: 'From the repair bay · 0:50',
  },
] as const;

export const metadata: Metadata = {
  title: 'Explore Spaceship Mechanic | Jamie McFarlane',
  description:
    'Meet the crew, step aboard Calypso, visit Patience Station, and watch videos from Jamie McFarlane’s Spaceship Mechanic universe.',
  alternates: {
    canonical: '/SpaceshipMechanic/explore',
  },
};

export default async function SpaceshipMechanicExplorePage() {
  const { books } = await getSeriesLandingData('spaceship-mechanic', [
    'published',
    'coming_soon',
  ]);
  const startBook = books.find((book) => book.series_number === 1) ?? books[0];

  return (
    <main className={styles.page}>
      <a className={styles.skipLink} href="#crew">
        Skip to the crew
      </a>

      <header className={styles.siteHeader}>
        <Link className={styles.wordmark} href="/">
          Jamie McFarlane
        </Link>
        <nav aria-label="Explore Spaceship Mechanic">
          <Link href="/SpaceshipMechanic">Series home</Link>
          <a href="#crew">Crew</a>
          <a href="#calypso">Calypso</a>
          <a href="#patience">Patience Station</a>
          <a href="#watch">Watch</a>
        </nav>
        {startBook ? (
          <Link
            className={styles.headerButton}
            href={`/books/${encodeURIComponent(startBook.slug)}`}
          >
            Start the series
          </Link>
        ) : null}
      </header>

      <section className={styles.exploreHero}>
        <Image
          src="/images/spaceship-mechanic/boltguns-gas-station-unlettered.jpg"
          alt="A retro roadside garage beneath a vivid alien sky"
          fill
          priority
          sizes="100vw"
        />
        <span className={styles.exploreHeroShade} aria-hidden="true" />
        <div className={styles.exploreHeroCopy}>
          <p className={styles.eyebrow}>Spaceship Mechanic</p>
          <h1>Beyond the repair bay</h1>
          <p>
            Meet the people, ships, and places that turn one Wisconsin
            mechanic’s bad day into a life among the stars.
          </p>
          <Link className={styles.textLink} href="/SpaceshipMechanic">
            <ArrowLeft aria-hidden="true" /> Back to the series
          </Link>
        </div>
      </section>

      <section className={styles.crewSection} id="crew">
        <div className={styles.sectionIntroRow}>
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>The crew</p>
            <h2>Found family, questionable plans, excellent repairs</h2>
          </div>
          <Users className={styles.sectionIcon} aria-hidden="true" />
        </div>

        <div className={styles.crewGrid}>
          {crew.map((person, index) => (
            <article
              className={`${styles.crewCard} ${person.image ? styles.crewCardPortrait : ''}`}
              key={person.name}
            >
              {person.image ? (
                <>
                  <Image
                    className={`${styles.crewPortrait} ${person.portraitTopAligned ? styles.crewPortraitTopAligned : ''}`}
                    src={person.image}
                    alt={person.imageAlt ?? ''}
                    fill
                    sizes="(max-width: 920px) min(78vw, 20rem), 18vw"
                  />
                  <span
                    className={styles.crewPortraitShade}
                    aria-hidden="true"
                  />
                </>
              ) : null}
              <div className={styles.crewIndex}>
                <span>{person.initials}</span>
                <small>{String(index + 1).padStart(2, '0')}</small>
              </div>
              <p>{person.role}</p>
              <h3>{person.name}</h3>
              <div className={styles.crewDescription}>{person.description}</div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.calypsoSection} id="calypso">
        <div className={styles.calypsoArt}>
          <span className={styles.shipGrid} aria-hidden="true" />
          <Image
            src="/images/spaceship-mechanic/calypso-chrome-hero.png"
            alt="Port-side view of Calypso, a chrome-covered retro-futurist interstellar freighter"
            width={1774}
            height={887}
            sizes="(max-width: 850px) 100vw, 60vw"
          />
        </div>

        <div className={styles.calypsoCopy}>
          <p className={styles.eyebrow}>Primary ship</p>
          <h2>Meet Calypso</h2>
          <p>
            Old, rounded, rust-prone, and patched more times than anyone can
            count, Calypso is the crew’s freighter, workshop, escape plan, and
            home between ports.
          </p>
          <blockquote>
            “The ship survives because Kel can fly and Rix refuses to accept
            broken as final.”
          </blockquote>
          <ul className={styles.shipFacts}>
            <li>
              <Rocket aria-hidden="true" /> Jump capable
            </li>
            <li>
              <Wrench aria-hidden="true" /> Extensively improvised
            </li>
            <li>
              <Users aria-hidden="true" /> Crew-built home
            </li>
          </ul>
        </div>
      </section>

      <section className={styles.patienceSection} id="patience">
        <div className={styles.patienceImage}>
          <Image
            src="/images/spaceship-mechanic/patience-station.png"
            alt="Patience Station inside a vast hollow asteroid, with layered repair bays, piers, work lights, and ships"
            fill
            sizes="100vw"
          />
          <span className={styles.patienceShade} aria-hidden="true" />
        </div>
        <div className={styles.patienceCopy}>
          <p className={styles.eyebrow}>Home port · Surnac Belt</p>
          <h2>Patience Station</h2>
          <p>
            Hollowed into an asteroid and held together by patched systems, busy
            repair bays, and the people who refuse to abandon it, Patience
            becomes the series’ working heart—and Rix’s first real home beyond
            Earth.
          </p>
          <div className={styles.stationFacts}>
            <span>
              <MapPin aria-hidden="true" /> Narlux-4 system
            </span>
            <span>
              <Wrench aria-hidden="true" /> Bay 807 · Rix’s shop
            </span>
            <span>
              <BookOpen aria-hidden="true" /> Primary series home base
            </span>
          </div>
        </div>
      </section>

      <section className={styles.videoSection} id="watch">
        <div className={styles.sectionIntroRow}>
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>Watch</p>
            <h2>From the repair bay</h2>
          </div>
          <a
            className={styles.channelLink}
            href="https://www.youtube.com/@jamiemcfarlaneauthor"
            target="_blank"
            rel="noreferrer"
          >
            Jamie on YouTube <ExternalLink aria-hidden="true" />
          </a>
        </div>

        <SpaceshipVideoGallery videos={videos} />
      </section>

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
