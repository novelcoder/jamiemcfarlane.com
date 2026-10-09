import { AMAZON_ASSOCIATE_DISCLOSURE } from '@/lib/affiliate-disclosure';
import { cn } from '@/lib/utils';

type AffiliateDisclosureProps = {
  /** `footer`: full-width last row of a site footer. `inline`: small note beside a buy button. */
  variant: 'footer' | 'inline';
  className?: string;
};

export function AffiliateDisclosure({
  variant,
  className,
}: AffiliateDisclosureProps) {
  return (
    <p
      className={cn(
        'affiliate-disclosure',
        `affiliate-disclosure--${variant}`,
        className,
      )}
    >
      {AMAZON_ASSOCIATE_DISCLOSURE}
    </p>
  );
}
