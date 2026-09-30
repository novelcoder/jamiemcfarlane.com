'use client';

import Image from 'next/image';

import { TrackedAmazonLink, TrackedBookLink } from '@/components/tracked-links';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import type { AttributionContext } from '@/lib/attribution';
import { selectPurchaseUrl, withAttribution } from '@/lib/attribution-routing';
import { hasBookPage } from '@/lib/book-status';
import type { BookRecord } from '@/lib/catalog';

import styles from './spaceship-mechanic.module.css';

function bookNumber(book: BookRecord) {
  return book.series_number === null
    ? 'Spaceship Mechanic'
    : `Book ${book.series_number}`;
}

export function SpaceshipBookCarousel({
  books,
  attribution,
}: {
  books: BookRecord[];
  attribution: AttributionContext | null;
}) {
  return (
    <Carousel
      className={styles.bookCarousel}
      opts={{ align: 'start', slidesToScroll: 1 }}
      aria-label="Spaceship Mechanic books in reading order"
    >
      <CarouselContent className={styles.bookCarouselTrack}>
        {books.map((book) => {
          const cover = (
            <>
              <span className={styles.thumbnailCover}>
                <Image
                  src={book.cover_thumb_url || book.cover_url}
                  alt={book.cover_alt}
                  width={600}
                  height={900}
                  sizes="(max-width: 520px) 48vw, (max-width: 720px) 40vw, 13rem"
                />
              </span>
              <span className={styles.thumbnailMeta}>{bookNumber(book)}</span>
              <strong>{book.title}</strong>
            </>
          );

          return (
            <CarouselItem className={styles.bookSlide} key={book.id}>
              <article className={styles.thumbnailCard}>
                {hasBookPage(book.status) ? (
                  <TrackedBookLink
                    href={withAttribution(
                      `/books/${encodeURIComponent(book.slug)}`,
                      attribution?.sourceKey ?? null,
                    )}
                    ariaLabel={`${book.title}, ${bookNumber(book)}`}
                    tracking={{
                      seriesSlug: 'spaceship-mechanic',
                      sourceKey: attribution?.sourceKey,
                      bookSlug: book.slug,
                      seriesNumber: book.series_number,
                      placement: 'book_carousel',
                    }}
                  >
                    {cover}
                  </TrackedBookLink>
                ) : book.store_url ? (
                  <TrackedAmazonLink
                    href={selectPurchaseUrl({
                      publicStoreUrl: book.store_url,
                      attributionUrl: attribution?.purchaseUrls[book.slug],
                      expectedAsin: book.kindle_asin,
                    })}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${book.title}, ${bookNumber(book)}, preorder`}
                    tracking={{
                      seriesSlug: 'spaceship-mechanic',
                      sourceKey: attribution?.sourceKey,
                      bookSlug: book.slug,
                      seriesNumber: book.series_number,
                      placement: 'book_carousel',
                      linkType: attribution?.purchaseUrls[book.slug]
                        ? 'amazon_attribution'
                        : 'public_store',
                    }}
                  >
                    {cover}
                  </TrackedAmazonLink>
                ) : (
                  <div>{cover}</div>
                )}
              </article>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious
        className={`${styles.bookCarouselArrow} ${styles.bookCarouselPrevious}`}
      />
      <CarouselNext
        className={`${styles.bookCarouselArrow} ${styles.bookCarouselNext}`}
      />
    </Carousel>
  );
}
