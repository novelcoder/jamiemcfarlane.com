// Book statuses stored in the shared Appwrite `books` table.
//
// - published:   released, has a book page
// - preorder:    retailer preorder is live, has a book page
// - coming_soon: announced without a buy link, listed on series pages only
// - draft:       never shown

export const PUBLIC_BOOK_STATUSES = ['published', 'preorder'] as const;

export const SERIES_LISTED_BOOK_STATUSES = [
  'published',
  'preorder',
  'coming_soon',
] as const;

export function hasBookPage(status: string) {
  return (PUBLIC_BOOK_STATUSES as readonly string[]).includes(status);
}

export function isPreorder(status: string) {
  return status === 'preorder';
}

export function isUpcoming(status: string) {
  return status === 'preorder' || status === 'coming_soon';
}

export function defaultStoreLabel(status: string) {
  return isPreorder(status) ? 'Preorder now' : 'Buy the book';
}

export function releaseDateLabel(status: string, formattedDate: string) {
  if (!formattedDate) return '';
  return isUpcoming(status)
    ? `Releases ${formattedDate}`
    : `Published ${formattedDate}`;
}

export function upcomingNoticeLabel(status: string, formattedDate: string) {
  if (isPreorder(status)) {
    return formattedDate ? `Preorder now · ${formattedDate}` : 'Preorder now';
  }
  return formattedDate ? `Coming ${formattedDate}` : 'Coming soon';
}
