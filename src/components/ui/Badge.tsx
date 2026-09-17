import { cn } from '@/lib/cn';
import type { Badge as BadgeType } from '@/types';

export function Badge({ badge, className }: { badge: BadgeType; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase shadow-sm',
        className
      )}
      style={{ backgroundColor: badge.bg_color, color: badge.text_color }}
    >
      {badge.label}
    </span>
  );
}

/** Simple presentational discount badge, e.g. "-20%" — computed client-side, not from DB. */
export function DiscountBadge({ percentage }: { percentage: number }) {
  if (percentage <= 0) return null;
  return (
    <span className="inline-flex items-center rounded-md gold-gradient px-2 py-0.5 text-[11px] font-bold text-royal-950 shadow-[var(--shadow-gold)]">
      -{percentage}%
    </span>
  );
}
