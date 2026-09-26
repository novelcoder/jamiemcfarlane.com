import type { MetadataRoute } from 'next';

import { getPublishedBooks } from '@/lib/catalog';
import { getAllPublishedPosts } from '@/lib/posts';

const siteUrl = 'https://www.jamiemcfarlane.com';

export const dynamic = 'force-dynamic';

function lastModified(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [books, posts] = await Promise.all([
    getPublishedBooks(),
    getAllPublishedPosts(),
  ]);
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteUrl}/news`,
      lastModified: posts[0]
        ? lastModified(posts[0].updated_at || posts[0].published_at)
        : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/PrivateerTales`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/SpaceshipMechanic`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/JunkyardPirate`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/CrownlockedHeirs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/WitchyWorld`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/ScienceFictionAdventures`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/SpaceshipMechanic/explore`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/PrivateerTales/books`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/PrivateerTales/ships`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  return [
    ...staticRoutes,
    ...books.map((book) => ({
      url: `${siteUrl}/books/${encodeURIComponent(book.slug)}`,
      lastModified: lastModified(book.updated_at || book.release_date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...posts.map((post) => ({
      url: `${siteUrl}/news/${encodeURIComponent(post.slug)}`,
      lastModified: lastModified(post.updated_at || post.published_at),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
