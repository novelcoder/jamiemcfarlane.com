'use client';

import Image from 'next/image';
import type { ComponentProps } from 'react';

import { appwritePreviewUrl, nextOptimizedUrl } from '@/lib/appwrite-image';

type ImageLoaderProps = { src: string; width: number; quality?: number };

// Appwrite artwork is resized by Appwrite itself (see lib/appwrite-image.ts).
function appwriteLoader({ src, width, quality }: ImageLoaderProps) {
  return (
    appwritePreviewUrl(src, width, quality) ??
    nextOptimizedUrl(src, width, quality)
  );
}

// Drop-in for next/image. Appwrite sources are requested at the width the page
// needs; local files, WordPress covers and blog images keep the built-in
// optimizer.
export default function SiteImage(props: ComponentProps<typeof Image>) {
  const useAppwrite =
    typeof props.src === 'string' && appwritePreviewUrl(props.src, 1) !== null;
  return <Image {...props} loader={useAppwrite ? appwriteLoader : undefined} />;
}
