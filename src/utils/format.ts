export function formatPrice(amount: number, currency: string = 'KSh'): string {
  return `${currency} ${Math.round(amount).toLocaleString('en-KE')}`;
}

/** Returns the price the customer actually pays right now. */
export function getEffectivePrice(normalPrice: number, offerPrice?: number | null): number {
  if (offerPrice != null && offerPrice > 0 && offerPrice < normalPrice) {
    return offerPrice;
  }
  return normalPrice;
}

export function isOnOffer(normalPrice: number, offerPrice?: number | null): boolean {
  return offerPrice != null && offerPrice > 0 && offerPrice < normalPrice;
}

/** Discount amount in currency units. */
export function getDiscountAmount(normalPrice: number, offerPrice?: number | null): number {
  if (!isOnOffer(normalPrice, offerPrice)) return 0;
  return normalPrice - (offerPrice as number);
}

/** Discount as a whole-number percentage, e.g. 20 for 20% off. */
export function getDiscountPercentage(normalPrice: number, offerPrice?: number | null): number {
  if (!isOnOffer(normalPrice, offerPrice) || normalPrice <= 0) return 0;
  return Math.round(((normalPrice - (offerPrice as number)) / normalPrice) * 100);
}

export function formatOrderDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
