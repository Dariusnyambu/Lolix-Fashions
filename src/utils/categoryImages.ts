/**
 * Fallback cover images per category slug, used only when the category has
 * no image_url set in Supabase (admin can always override via the Categories
 * or Banners dashboard). Keeps each category visually distinct instead of
 * falling back to one generic photo for everything.
 */
export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  'thrift-clothes': 'https://images.unsplash.com/photo-1624192647570-1131acc12ccf?q=80&w=800&auto=format&fit=crop',
  shoes: 'https://images.unsplash.com/photo-1669671943625-e20799ee5f42?q=80&w=800&auto=format&fit=crop',
  suits: 'https://images.unsplash.com/photo-1600091166971-7f9faad6c1e2?q=80&w=800&auto=format&fit=crop',
  beddings: 'https://images.unsplash.com/photo-1542728929-2b5d9a0c8d48?q=80&w=800&auto=format&fit=crop',
  'new-arrivals': 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=800&auto=format&fit=crop',
  offers: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=800&auto=format&fit=crop',
};

const GENERIC_FALLBACK = CATEGORY_FALLBACK_IMAGES['thrift-clothes'];

export function getCategoryImage(category: { slug: string; image_url?: string | null }): string {
  if (category.image_url) return category.image_url;
  return CATEGORY_FALLBACK_IMAGES[category.slug] ?? GENERIC_FALLBACK;
}
