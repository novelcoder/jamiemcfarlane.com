import Link from 'next/link';

import { CookieSettingsButton } from '@/components/analytics-consent';

export const metadata = {
  title: 'Privacy & Cookies | Jamie McFarlane',
  description:
    'How jamiemcfarlane.com handles newsletter signups, cookies, and optional analytics.',
};

export default function PrivacyPage() {
  return (
    <main className="privacy-page">
      <article className="privacy-card site-shell">
        <Link className="privacy-back" href="/">
          ← Back to Jamie McFarlane
        </Link>
        <h1>Privacy &amp; cookies</h1>
        <p>
          This site uses a small preference cookie to remember whether you allow
          optional Google Analytics. Analytics does not load until you choose{' '}
          <strong>Allow analytics</strong>.
        </p>
        <h2>Optional analytics</h2>
        <p>
          When allowed, Google Analytics records general information such as
          pages viewed, approximate location, device type, and referral source.
          Google Signals and advertising personalization are disabled.
        </p>
        <h2>Your choice</h2>
        <p>
          Your analytics preference lasts for six months. You can change it at
          any time using Cookie settings below.
        </p>
        <CookieSettingsButton className="privacy-settings-button" />
        <h2>Newsletter signup</h2>
        <p>
          If you request the free books, the email address you provide is sent
          to MailerLite so Jamie McFarlane can deliver the books and occasional
          book news. You can unsubscribe from those emails at any time.
        </p>
      </article>
    </main>
  );
}
