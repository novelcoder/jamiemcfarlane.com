import Link from 'next/link';

import { AffiliateDisclosure } from '@/components/affiliate-disclosure';
import { CookieSettingsButton } from '@/components/analytics-consent';

export function SiteFooter() {
  return (
    <footer className="site-footer site-shell">
      <span className="footer-identity">
        <span className="wordmark">Jamie McFarlane</span>
        <AffiliateDisclosure variant="footer" />
      </span>
      <div className="footer-links">
        <p>Science fiction, fantasy, and adventures worth getting lost in.</p>
        <Link href="/news">News &amp; Notes</Link>
        <Link href="/privacy">Privacy &amp; cookies</Link>
        <CookieSettingsButton />
      </div>
    </footer>
  );
}
