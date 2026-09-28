import Link from 'next/link';

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  return (
    <header className={`site-header${overlay ? '' : ' site-header-solid'}`}>
      <Link
        className="wordmark"
        href={overlay ? '#top' : '/'}
        aria-label="Jamie McFarlane home"
      >
        Jamie McFarlane
      </Link>
      <nav aria-label="Primary navigation">
        <Link href={overlay ? '#worlds' : '/#worlds'}>Books</Link>
        <Link href="/news">News</Link>
        <Link
          className="nav-highlight"
          href={overlay ? '#free-books' : '/#free-books'}
        >
          Free Books
        </Link>
      </nav>
    </header>
  );
}
