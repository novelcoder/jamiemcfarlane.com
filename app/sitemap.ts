import type { MetadataRoute } from 'next';

import { getPublishedBooks } from '@/lib/catalog';

const siteUrl = 'https://www.jamiemcfarlane.com';

export const dynamic = 'force-dynamic';

function lastModified(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const books = await getPublishedBooks();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
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
  ];
}
