import assert from 'node:assert/strict';
import test from 'node:test';

import {
  defaultStoreLabel,
  hasBookPage,
  isUpcoming,
  releaseDateLabel,
  upcomingNoticeLabel,
} from '../lib/book-status.ts';

void test('published and preorder books get a book page', () => {
  assert.equal(hasBookPage('published'), true);
  assert.equal(hasBookPage('preorder'), true);
});

void test('coming soon, draft and unknown books do not get a book page', () => {
  assert.equal(hasBookPage('coming_soon'), false);
  assert.equal(hasBookPage('draft'), false);
  assert.equal(hasBookPage(''), false);
});

void test('preorder and coming soon are upcoming; published is not', () => {
  assert.equal(isUpcoming('preorder'), true);
  assert.equal(isUpcoming('coming_soon'), true);
  assert.equal(isUpcoming('published'), false);
});

void test('uses preorder wording for the default store label', () => {
  assert.equal(defaultStoreLabel('preorder'), 'Preorder now');
  assert.equal(defaultStoreLabel('published'), 'Buy the book');
});

void test('release date label depends on status', () => {
  assert.equal(
    releaseDateLabel('preorder', 'October 1, 2026'),
    'Releases October 1, 2026',
  );
  assert.equal(
    releaseDateLabel('published', 'May 1, 2026'),
    'Published May 1, 2026',
  );
  assert.equal(releaseDateLabel('preorder', ''), '');
});

void test('upcoming notice says preorder now instead of coming soon', () => {
  assert.equal(
    upcomingNoticeLabel('preorder', 'October 1, 2026'),
    'Preorder now · October 1, 2026',
  );
  assert.equal(upcomingNoticeLabel('preorder', ''), 'Preorder now');
  assert.equal(
    upcomingNoticeLabel('coming_soon', 'January 1, 2027'),
    'Coming January 1, 2027',
  );
  assert.equal(upcomingNoticeLabel('coming_soon', ''), 'Coming soon');
});
