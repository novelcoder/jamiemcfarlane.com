import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';

import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { renderMarkdown } from '@/lib/markdown';
import { blogImagePath, formatPostDate, getPublishedPost } from '@/lib/posts';

import styles from './post.module.css';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const requestedSlug = decodeURIComponent((await params).slug);
  const post = await getPublishedPost(requestedSlug);
  if (!post) return {};

  const canonical = `/news/${encodeURIComponent(post.slug)}`;
  const image = post.hero_image_id
    ? blogImagePath(post.hero_image_id)
    : undefined;

  return {
    title: post.seo_title || `${post.title} | Jamie McFarlane`,
    description: post.seo_description || post.excerpt,
    alternates: { canonical },
    openGraph: {
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt,
      type: 'article',
      url: canonical,
      publishedTime: post.published_at,
      modifiedTime: post.updated_at || post.published_at,
      authors: [post.author_name],
      tags: [post.category, ...post.tags].filter(Boolean),
      ...(image ? { images: [{ url: image, alt: post.hero_image_alt }] } : {}),
    },
  };
}

export default async function PostPage({ params }: Props) {
  const requestedSlug = decodeURIComponent((await params).slug);
  const post = await getPublishedPost(requestedSlug);
  if (!post) notFound();
  if (requestedSlug !== post.slug) {
    permanentRedirect(`/news/${encodeURIComponent(post.slug)}`);
  }

  const html = await renderMarkdown(post.content_markdown);
  const canonicalUrl = `https://www.jamiemcfarlane.com/news/${encodeURIComponent(post.slug)}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    author: {
      '@type': 'Person',
      name: post.author_name,
      url: 'https://www.jamiemcfarlane.com',
    },
    mainEntityOfPage: canonicalUrl,
    ...(post.hero_image_id
      ? {
          image: `https://www.jamiemcfarlane.com${blogImagePath(post.hero_image_id)}`,
        }
      : {}),
  };

  return (
    <main className={styles.page}>
      <SiteHeader />
      <article>
        <header className={styles.header}>
          <div className={`${styles.headerInner} site-shell`}>
            <Link className={styles.back} href="/news">
              News &amp; Notes
            </Link>
            {post.category ? (
              <p className={styles.category}>{post.category}</p>
            ) : null}
            <h1>{post.title}</h1>
            <p className={styles.byline}>
              By {post.author_name} ·{' '}
              <time dateTime={post.published_at}>
                {formatPostDate(post.published_at)}
              </time>
            </p>
          </div>
        </header>

        {post.hero_image_id ? (
          <figure className={`${styles.heroImage} site-shell`}>
            <div>
              <Image
                src={blogImagePath(post.hero_image_id)}
                alt={post.hero_image_alt}
                fill
                priority
                sizes="(max-width: 1320px) 100vw, 82rem"
              />
            </div>
            {post.hero_image_caption ? (
              <figcaption>{post.hero_image_caption}</figcaption>
            ) : null}
          </figure>
        ) : null}

        <div
          className={`${styles.content} site-shell`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteFooter />
    </main>
  );
}
