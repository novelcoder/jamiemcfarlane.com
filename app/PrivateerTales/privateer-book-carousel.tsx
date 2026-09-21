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

import styles from './privateer.module.css';

function bookLabel(book: BookRecord) {
  return book.series_number === null
    ? 'A Privateer Tales story'
    : `Book ${book.series_number}`;
}

export function PrivateerBookCarousel({ books }: { books: BookRecord[] }) {
  return (
    <Carousel
      className={styles.seriesCarousel}
      opts={{ align: 'start', slidesToScroll: 2 }}
    >
      <CarouselContent className={styles.seriesCarouselTrack}>
        {books.map((book) => (
          <CarouselItem className={styles.seriesSlide} key={book.id}>
            <article className={styles.bookCard}>
              <Link
                href={`/books/${encodeURIComponent(book.slug)}`}
                aria-label={`${book.title}, ${bookLabel(book)}`}
              >
                <Image
                  src={book.cover_thumb_url || book.cover_url}
                  alt={book.cover_alt}
                  width="600"
                  height="900"
                  sizes="(max-width: 700px) 50vw, (max-width: 980px) 25vw, (max-width: 1100px) 20vw, 17vw"
                  loading={
                    book.series_number !== null && book.series_number <= 6
                      ? 'eager'
                      : 'lazy'
                  }
                />
                <span>{bookLabel(book)}</span>
              </Link>
            </article>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious
        className={`${styles.seriesArrow} ${styles.seriesArrowLeft}`}
      />
      <CarouselNext
        className={`${styles.seriesArrow} ${styles.seriesArrowRight}`}
      />
    </Carousel>
  );
}
