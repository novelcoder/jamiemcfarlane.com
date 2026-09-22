'use client';

import Image from 'next/image';
import Link from 'next/link';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import type { BookRecord } from '@/lib/catalog';

import styles from './spaceship-mechanic.module.css';

function bookNumber(book: BookRecord) {
  return book.series_number === null
    ? 'Spaceship Mechanic'
    : `Book ${book.series_number}`;
}

export function SpaceshipBookCarousel({ books }: { books: BookRecord[] }) {
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
                {book.status === 'published' ? (
                  <Link
                    href={`/books/${encodeURIComponent(book.slug)}`}
                    aria-label={`${book.title}, ${bookNumber(book)}`}
                  >
                    {cover}
                  </Link>
                ) : book.store_url ? (
                  <a
                    href={book.store_url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${book.title}, ${bookNumber(book)}, preorder`}
                  >
                    {cover}
                  </a>
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
