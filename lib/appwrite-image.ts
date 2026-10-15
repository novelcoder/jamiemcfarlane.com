const APPWRITE_STORAGE_FILE =
  /^(https:\/\/[^/]+\/v1\/storage\/buckets\/[^/]+\/files\/[^/]+)\/(?:view|download|preview)(\?.*)?$/;

export const DEFAULT_IMAGE_QUALITY = 75;

// Appwrite serves the original upload from /view (some covers are several MB).
// /preview resizes and re-encodes it, so each request asks for just the width
// the page needs. Returns null for anything that is not an Appwrite storage URL.
export function appwritePreviewUrl(
  src: string,
  width: number,
  quality = DEFAULT_IMAGE_QUALITY,
) {
  const match = APPWRITE_STORAGE_FILE.exec(src);
  if (!match) return null;

  const params = new URLSearchParams(match[2] ?? '');
  params.set('width', String(Math.round(width)));
  params.set('output', 'webp');
  params.set('quality', String(quality));
  return `${match[1]}/preview?${params.toString()}`;
}

// Same URL shape next/image's built-in loader produces.
export function nextOptimizedUrl(
  src: string,
  width: number,
  quality = DEFAULT_IMAGE_QUALITY,
) {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}
