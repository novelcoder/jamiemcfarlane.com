import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

import { AMAZON_ASSOCIATE_DISCLOSURE } from '../lib/affiliate-disclosure.ts';

const root = new URL('..', import.meta.url).pathname;
const source = (path: string) => readFileSync(join(root, path), 'utf8');

function pageFiles(dir: string): string[] {
  return readdirSync(join(root, dir)).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(join(root, path)).isDirectory()) return pageFiles(path);
    return name === 'page.tsx' ? [path] : [];
  });
}

void test("uses Amazon's required Associates wording verbatim", () => {
  assert.equal(
    AMAZON_ASSOCIATE_DISCLOSURE,
    'As an Amazon Associate I earn from qualifying purchases.',
  );
});

void test('every footer on the site carries the disclosure', () => {
  const footers = [
    'components/site-footer.tsx',
    ...pageFiles('app').filter((path) => source(path).includes('</footer>')),
  ];
  assert.ok(footers.length >= 10);
  for (const path of footers) {
    assert.match(
      source(path),
      /<span className="footer-identity">[\s\S]*?<AffiliateDisclosure variant="footer" \/>\s*<\/span>/,
      `${path} footer is missing the disclosure`,
    );
  }
});

void test('every page renders a footer (or redirects)', () => {
  for (const path of pageFiles('app')) {
    const page = source(path);
    const hasFooter =
      page.includes('</footer>') || page.includes('<SiteFooter />');
    const redirectsOnly = page.includes('permanentRedirect(');
    assert.ok(hasFooter || redirectsOnly, `${path} has no footer`);
  }
});

void test('the book page shows the disclosure beside the Amazon button', () => {
  assert.match(
    source('app/books/[slug]/page.tsx'),
    /\{book\.store_url \? <AffiliateDisclosure variant="inline" \/> : null\}/,
  );
});
