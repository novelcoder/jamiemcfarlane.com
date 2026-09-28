import Link from 'next/link';

import { CookieSettingsButton } from '@/components/analytics-consent';

export function SiteFooter() {
  return (
    <footer className="site-footer site-shell">
      <span className="wordmark">Jamie McFarlane</span>
      <div className="footer-links">
        <p>Science fiction, fantasy, and adventures worth getting lost in.</p>
        <Link href="/news">News &amp; Notes</Link>
        <Link href="/privacy">Privacy &amp; cookies</Link>
        <CookieSettingsButton />
      </div>
    </footer>
  );
}
