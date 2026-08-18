import { Link } from 'react-router-dom';
import type { Category } from '@/types';

const PLACEHOLDER_IMAGES: Record<string, string> = {
  default: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=800&auto=format&fit=crop',
};

export function FeaturedCategories({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-royal-900 sm:text-3xl">Shop by Category</h2>
          <p className="mt-1 text-sm text-royal-500">Find exactly what you're looking for</p>
        </div>
        <Link to="/categories" className="hidden text-sm font-semibold text-royal-700 hover:text-gold-600 sm:block">
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/shop?category=${cat.slug}`}
            className="group relative overflow-hidden rounded-2xl aspect-square shadow-[var(--shadow-soft)] transition-transform duration-300 hover:-translate-y-1"
          >
            <img
              src={cat.image_url || PLACEHOLDER_IMAGES.default}
              alt={cat.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-royal-950/80 via-royal-950/10 to-transparent" />
            <span className="absolute bottom-3 left-3 right-3 text-sm font-bold text-white">{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
