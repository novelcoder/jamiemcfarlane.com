import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jamie McFarlane | Science Fiction & Fantasy Author',
  description:
    'Explore the books and worlds of Jamie McFarlane, join the reader list, and receive a free starter library.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
