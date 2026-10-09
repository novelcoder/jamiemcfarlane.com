import { AMAZON_ASSOCIATE_DISCLOSURE } from '@/lib/affiliate-disclosure';
import { cn } from '@/lib/utils';

type AffiliateDisclosureProps = {
  /** `footer`: small line tucked under the footer wordmark. `inline`: small note beside a buy button. */
  variant: 'footer' | 'inline';
  className?: string;
};

export function AffiliateDisclosure({
  variant,
  className,
}: AffiliateDisclosureProps) {
  // In a footer it sits inside the wordmark block, so it must be inline-level.
  const Tag = variant === 'footer' ? 'span' : 'p';
  return (
    <Tag
      className={cn(
        'affiliate-disclosure',
        `affiliate-disclosure--${variant}`,
        className,
      )}
    >
      {AMAZON_ASSOCIATE_DISCLOSURE}
    </Tag>
  );
}
