import { Link } from 'react-router-dom';
import type { Product } from '@/types';
import { ProductCard, ProductCardSkeleton } from '@/components/product/ProductCard';

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  loading?: boolean;
  viewAllLink?: string;
  tint?: 'default' | 'gold';
}

export function ProductSection({ title, subtitle, products, loading, viewAllLink, tint = 'default' }: ProductSectionProps) {
  if (!loading && products.length === 0) return null;

  return (
    <section className={tint === 'gold' ? 'bg-gold-50/60' : undefined}>
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-royal-900 sm:text-3xl">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-royal-500">{subtitle}</p>}
          </div>
          {viewAllLink && (
            <Link to={viewAllLink} className="hidden text-sm font-semibold text-royal-700 hover:text-gold-600 sm:block">
              View All →
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>

        {viewAllLink && (
          <div className="mt-8 text-center sm:hidden">
            <Link to={viewAllLink} className="text-sm font-semibold text-royal-700 hover:text-gold-600">
              View All →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
