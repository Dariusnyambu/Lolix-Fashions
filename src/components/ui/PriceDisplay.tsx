import { formatPrice, getDiscountPercentage, getEffectivePrice, isOnOffer } from '@/utils/format';
import { cn } from '@/lib/cn';

interface PriceDisplayProps {
  normalPrice: number;
  offerPrice?: number | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: { current: 'text-sm', original: 'text-xs' },
  md: { current: 'text-lg', original: 'text-sm' },
  lg: { current: 'text-2xl', original: 'text-base' },
};

export function PriceDisplay({ normalPrice, offerPrice, size = 'md', className }: PriceDisplayProps) {
  const onOffer = isOnOffer(normalPrice, offerPrice);
  const current = getEffectivePrice(normalPrice, offerPrice);
  const pct = getDiscountPercentage(normalPrice, offerPrice);
  const s = sizeClasses[size];

  return (
    <div className={cn('flex items-baseline gap-2 flex-wrap', className)}>
      <span className={cn('font-bold text-royal-900', s.current)}>{formatPrice(current)}</span>
      {onOffer && (
        <>
          <span className={cn('text-royal-400 line-through', s.original)}>{formatPrice(normalPrice)}</span>
          <span className="text-xs font-bold text-gold-600">-{pct}%</span>
        </>
      )}
    </div>
  );
}
