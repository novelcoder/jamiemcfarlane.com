import { imageSize } from 'image-size';

export type ImageMeta = { width: number; height: number; type: string };

const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  avif: 'image/avif',
};

// Reads pixel dimensions and MIME type from image bytes. Returns null for
// anything unrecognised, so callers can fall back to omitting the fields.
export function readImageMeta(bytes: Uint8Array): ImageMeta | null {
  try {
    const { width, height, type } = imageSize(bytes);
    const mime = type ? MIME_TYPES[type] : undefined;
    if (!width || !height || !mime) return null;
    return { width, height, type: mime };
  } catch {
    return null;
  }
}
