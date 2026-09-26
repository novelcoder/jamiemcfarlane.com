import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { NewsletterSignup } from '@/components/newsletter-signup';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { getSeriesLandingData } from '@/lib/catalog';
import {
  blogImagePath,
  formatPostDate,
  getPublishedPosts,
  postUrl,
} from '@/lib/posts';

const featuredSeries = [
  {
    name: 'Spaceship Mechanic',
    href: '/SpaceshipMechanic',
    cover:
      'https://sfo.cloud.appwrite.io/v1/storage/buckets/6a50ff920031640f71bd/files/boltguns-ducttape-cover/view?project=6a0b4638002a71c2b8ec',
    cardImage: '/cards/boltguns-card.jpg',
    alt: 'Boltguns and Duct Tape by Jamie McFarlane',
    className: 'spaceship',
  },
  {
    name: 'Crownlocked Heirs',
    href: '/CrownlockedHeirs',
    cover:
      'https://sfo.cloud.appwrite.io/v1/storage/buckets/6aabf091000da4dc7980/files/6aabf396003b238d5d33/view?project=6a0b4638002a71c2b8ec',
    cardImage:
      'https://sfo.cloud.appwrite.io/v1/storage/buckets/6aabf091000da4dc7980/files/6aabf396003b238d5d33/view?project=6a0b4638002a71c2b8ec',
    alt: 'Drakon Prince by Jamie McFarlane',
    className: 'crownlocked',
  },
  {
    name: 'Privateer Tales',
    href: '/PrivateerTales',
    cover:
      'https://i0.wp.com/fickledragon.com/wp-content/uploads/2016/08/rookie_ebook_cover-600x900.jpg?resize=600%2C900',
    cardImage: '/cards/rookie-privateer-card.jpg',
    alt: 'Rookie Privateer by Jamie McFarlane',
    className: 'privateer',
  },
  {
    name: 'Junkyard Pirate',
    href: '/JunkyardPirate',
    cover:
      'https://sfo.cloud.appwrite.io/v1/storage/buckets/6a50ff920031640f71bd/files/6a510087040ed2c6f583/view?project=6a0b4638002a71c2b8ec',
    cardImage: '/cards/junkyard-pirate-card.jpg',
    alt: 'Junkyard Pirate by Jamie McFarlane',
    className: 'junkyard',
  },
] as const;

export default async function Home() {
  const [scienceFictionSeries, latestNews] = await Promise.all([
    Promise.all([
      getSeriesLandingData('oldest-starfighter'),
      getSeriesLandingData('space-troopers'),
      getSeriesLandingData('tinker-knight-adventures'),
    ]),
    getPublishedPosts({ limit: 3 }),
  ]);
  const scienceFictionCovers = scienceFictionSeries
    .map(
      ({ books }) => books.find((book) => book.series_number === 1) ?? books[0],
    )
    .filter((book) => book !== undefined);

  return (
    <main>
      <a className="skip-link" href="#worlds">
        Skip to featured worlds
      </a>

      <SiteHeader overlay />

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
            {featuredSeries.map((item, index) => (
              <a
                className={`hero-cover hero-cover-${index + 1}`}
                href={item.href}
                key={item.name}
                aria-label={`Explore ${item.name}`}
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
            {featuredSeries.map((item) => (
              <a
                className={`world-card world-card-${item.className}`}
                href={item.href}
                key={item.name}
                aria-label={`Visit ${item.name}`}
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
                  </span>
                  <ArrowRight aria-hidden="true" />
                </span>
              </a>
            ))}
          </div>

          <div className="supporting-worlds">
            <p className="supporting-worlds-heading">More adventures</p>
            <div className="supporting-worlds-grid">
              <Link className="supporting-world-card" href="/WitchyWorld">
                <span className="supporting-world-art supporting-world-art-witchy">
                  <Image
                    src="/images/witchy-world/witchy-world-hero.jpg"
                    alt=""
                    fill
                    sizes="7rem"
                  />
                </span>
                <span className="supporting-world-copy">
                  <small>Dark urban fantasy</small>
                  <strong>Witchy World</strong>
                  <span>Witches, visions, and dangerous magic.</span>
                </span>
                <ArrowRight aria-hidden="true" />
              </Link>

              <Link
                className="supporting-world-card"
                href="/ScienceFictionAdventures"
              >
                <span className="supporting-cover-strip" aria-hidden="true">
                  {scienceFictionCovers.map((book) => (
                    <span className="supporting-cover" key={book.id}>
                      <Image
                        src={book.cover_thumb_url || book.cover_url}
                        alt=""
                        fill
                        sizes="2.6rem"
                      />
                    </span>
                  ))}
                </span>
                <span className="supporting-world-copy">
                  <small>Three series · Six books</small>
                  <strong>Science Fiction Adventures</strong>
                  <span>Old soldiers, space cadets, and alien wars.</span>
                </span>
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {latestNews.posts.length > 0 ? (
        <section
          className="latest-news-section"
          aria-labelledby="latest-news-heading"
        >
          <div className="site-shell">
            <div className="section-heading latest-news-heading">
              <div>
                <p className="section-kicker">From Jamie&apos;s desk</p>
                <h2 id="latest-news-heading">Latest news</h2>
              </div>
              <Link className="all-news-link" href="/news">
                All News <ArrowRight aria-hidden="true" />
              </Link>
            </div>
            <div className="latest-news-grid">
              {latestNews.posts.map((post, index) => (
                <article
                  className={`latest-news-card${index === 0 ? ' latest-news-card-featured' : ''}`}
                  key={post.id}
                >
                  {post.hero_image_id ? (
                    <Link
                      className="latest-news-art"
                      href={postUrl(post.slug)}
                      tabIndex={-1}
                    >
                      <Image
                        src={blogImagePath(post.hero_image_id)}
                        alt={post.hero_image_alt}
                        fill
                        sizes={
                          index === 0
                            ? '(max-width: 900px) 100vw, 55vw'
                            : '(max-width: 900px) 100vw, 28vw'
                        }
                      />
                    </Link>
                  ) : null}
                  <div className="latest-news-copy">
                    <p>
                      {post.category ? <span>{post.category}</span> : null}
                      <time dateTime={post.published_at}>
                        {formatPostDate(post.published_at)}
                      </time>
                    </p>
                    <h3>
                      <Link href={postUrl(post.slug)}>{post.title}</Link>
                    </h3>
                    <span className="latest-news-excerpt">{post.excerpt}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

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

      <SiteFooter />
    </main>
  );
}
