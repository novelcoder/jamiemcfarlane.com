import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PostCard } from '@/components/post-card';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { getPublishedPosts, NEWS_PAGE_SIZE } from '@/lib/posts';

import styles from './news.module.css';

function pageNumber(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return 1;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}): Promise<Metadata> {
  const page = pageNumber((await searchParams).page);
  const canonical = page && page > 1 ? `/news?page=${page}` : '/news';
  const pageLabel = page && page > 1 ? ` — Page ${page}` : '';

  return {
    title: `News & Notes${pageLabel} | Jamie McFarlane`,
    description:
      'Book news, release updates, and behind-the-scenes notes from science fiction and fantasy author Jamie McFarlane.',
    alternates: {
      canonical,
      types: {
        'application/rss+xml': '/feed',
      },
    },
    openGraph: {
      title: `News & Notes${pageLabel} | Jamie McFarlane`,
      description:
        'Book news, release updates, and behind-the-scenes notes from Jamie McFarlane.',
      type: 'website',
      url: canonical,
    },
  };
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const page = pageNumber((await searchParams).page);
  if (page === null) notFound();

  const { posts, total } = await getPublishedPosts({
    limit: NEWS_PAGE_SIZE,
    offset: (page - 1) * NEWS_PAGE_SIZE,
  });
  const pageCount = Math.max(1, Math.ceil(total / NEWS_PAGE_SIZE));
  if (page > pageCount || (page > 1 && posts.length === 0)) notFound();

  return (
    <main className={styles.page}>
      <SiteHeader />
      <header className={styles.hero}>
        <div className="site-shell">
          <p className={styles.eyebrow}>From Jamie&apos;s desk</p>
          <h1>News &amp; Notes</h1>
          <p>
            New releases, works in progress, and the stories behind the stories.
          </p>
        </div>
      </header>

      <section
        className={`${styles.archive} site-shell`}
        aria-label="News archive"
      >
        <div className={styles.grid}>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {pageCount > 1 ? (
          <nav className={styles.pagination} aria-label="News archive pages">
            {page > 1 ? (
              <Link href={page === 2 ? '/news' : `/news?page=${page - 1}`}>
                Newer posts
              </Link>
            ) : (
              <span />
            )}
            <span>
              Page {page} of {pageCount}
            </span>
            {page < pageCount ? (
              <Link href={`/news?page=${page + 1}`}>Older posts</Link>
            ) : (
              <span />
            )}
          </nav>
        ) : null}
      </section>
      <SiteFooter />
    </main>
  );
}
