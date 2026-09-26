import { cache } from 'react';

import {
  APPWRITE_DATABASE_ID,
  appwriteFetch,
  equalQuery,
  limitQuery,
} from './catalog.ts';

export const POSTS_TABLE_ID = 'posts';
export const BLOG_IMAGE_BUCKET_ID = '6ab752530015aa3cfd3b';
export const NEWS_PAGE_SIZE = 12;

type AppwritePostRow = Record<string, unknown> & {
  $id: string;
  $updatedAt?: string;
};

export type PostRecord = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content_markdown: string;
  status: string;
  published_at: string;
  author_name: string;
  category: string;
  tags: string[];
  is_featured: boolean;
  hero_image_id: string;
  hero_image_alt: string;
  hero_image_caption: string;
  seo_title: string;
  seo_description: string;
  wordpress_post_id: number | null;
  legacy_url: string;
  updated_at: string;
};

function stringValue(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function numberValue(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function asPost(row: AppwritePostRow): PostRecord {
  return {
    id: row.$id,
    title: stringValue(row.title),
    slug: stringValue(row.slug),
    excerpt: stringValue(row.excerpt),
    content_markdown: stringValue(row.content_markdown),
    status: stringValue(row.status),
    published_at: stringValue(row.published_at),
    author_name: stringValue(row.author_name, 'Jamie McFarlane'),
    category: stringValue(row.category),
    tags: stringArray(row.tags),
    is_featured: row.is_featured === true,
    hero_image_id: stringValue(row.hero_image_id),
    hero_image_alt: stringValue(row.hero_image_alt),
    hero_image_caption: stringValue(row.hero_image_caption),
    seo_title: stringValue(row.seo_title),
    seo_description: stringValue(row.seo_description),
    wordpress_post_id: numberValue(row.wordpress_post_id),
    legacy_url: stringValue(row.legacy_url),
    updated_at: stringValue(row.$updatedAt),
  };
}

function orderDescQuery(attribute: string) {
  return JSON.stringify({ method: 'orderDesc', attribute });
}

function offsetQuery(offset: number) {
  return JSON.stringify({ method: 'offset', values: [offset] });
}

function postTablePath(suffix = '') {
  return `/tablesdb/${APPWRITE_DATABASE_ID}/tables/${POSTS_TABLE_ID}${suffix}`;
}

export function blogImagePath(fileId: string) {
  return fileId ? `/blog-images/${encodeURIComponent(fileId)}` : '';
}

export function postUrl(slug: string) {
  return `/news/${encodeURIComponent(slug)}`;
}

export function formatPostDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export async function getPublishedPosts({
  limit = NEWS_PAGE_SIZE,
  offset = 0,
}: {
  limit?: number;
  offset?: number;
} = {}) {
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
  const safeOffset = Math.max(Math.trunc(offset), 0);
  const queries = new URLSearchParams();
  queries.append('queries[]', equalQuery('status', ['published']));
  queries.append('queries[]', orderDescQuery('published_at'));
  queries.append('queries[]', limitQuery(safeLimit));
  if (safeOffset > 0) {
    queries.append('queries[]', offsetQuery(safeOffset));
  }

  const result = await appwriteFetch<{
    total: number;
    rows: AppwritePostRow[];
  }>(`${postTablePath('/rows')}?${queries.toString()}`);

  return {
    total: result.total,
    posts: result.rows.map(asPost),
  };
}

export const getPublishedPost = cache(async (slug: string) => {
  const queries = new URLSearchParams();
  queries.append('queries[]', equalQuery('status', ['published']));
  queries.append('queries[]', equalQuery('slug', [slug]));
  queries.append('queries[]', limitQuery(1));

  const result = await appwriteFetch<{ rows: AppwritePostRow[] }>(
    `${postTablePath('/rows')}?${queries.toString()}`,
  );
  return result.rows[0] ? asPost(result.rows[0]) : null;
});

export async function getAllPublishedPosts() {
  const posts: PostRecord[] = [];
  let total = 0;

  do {
    const page = await getPublishedPosts({ limit: 100, offset: posts.length });
    total = page.total;
    posts.push(...page.posts);
    if (page.posts.length === 0) break;
  } while (posts.length < total);

  return posts;
}
