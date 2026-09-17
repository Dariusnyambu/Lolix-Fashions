import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import type { Product } from '@/types';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { Badge } from '@/components/ui/Badge';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/cn';

export function ProductCard({ product }: { product: Product }) {
  const { isWishlisted, toggle } = useWishlist();
  const { addItem } = useCart();
  const image = product.images?.[0]?.image_url;
  const secondImage = product.images?.[1]?.image_url;
  const wishlisted = isWishlisted(product.id);
  const outOfStock = product.is_sold_out || (product.track_inventory && product.stock_quantity <= 0);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-soft)] transition-all duration-300 hover:shadow-[var(--shadow-lift)] hover:-translate-y-1">
      <Link to={`/product/${product.slug}`} className="relative block aspect-[3/4] overflow-hidden bg-royal-50">
        {image ? (
          <>
            <img
              src={image}
              alt={product.name}
              loading="lazy"
              className={cn(
                'h-full w-full object-cover transition-opacity duration-300',
                secondImage && 'group-hover:opacity-0'
              )}
            />
            {secondImage && (
              <img
                src={secondImage}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-royal-200">
            <ShoppingBag size={40} />
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.badges?.slice(0, 2).map((b) => (
            <Badge key={b.id} badge={b} />
          ))}
        </div>

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-royal-950/50">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-royal-900">Out of Stock</span>
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggle(product.id);
          }}
          aria-label="Toggle wishlist"
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur transition-colors hover:bg-white"
        >
          <Heart size={16} className={wishlisted ? 'fill-gold-500 text-gold-500' : 'text-royal-400'} />
        </button>

        {/* Quick add */}
        {!outOfStock && (
          <button
            onClick={(e) => {
              e.preventDefault();
              addItem(product, { quantity: 1 });
            }}
            className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full purple-gradient text-white opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 hover:scale-105"
            aria-label="Quick add to cart"
          >
            <ShoppingBag size={16} />
          </button>
        )}
      </Link>

      <Link to={`/product/${product.slug}`} className="flex flex-1 flex-col gap-1.5 p-3.5">
        {product.category?.name && (
          <span className="text-[11px] font-medium uppercase tracking-wide text-royal-400">
            {product.category.name}
          </span>
        )}
        <h3 className="line-clamp-2 text-sm font-semibold text-royal-900">{product.name}</h3>
        <PriceDisplay normalPrice={product.normal_price} offerPrice={product.offer_price} size="sm" />
        {product.variants && product.variants.length > 0 && (
          <div className="mt-0.5 flex flex-wrap gap-1">
            {[...new Set(product.variants.map((v) => v.size?.label).filter(Boolean))]
              .slice(0, 4)
              .map((label) => (
                <span key={label} className="rounded border border-royal-100 px-1.5 py-0.5 text-[10px] text-royal-500">
                  {label}
                </span>
              ))}
          </div>
        )}
      </Link>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-soft)]">
      <div className="skeleton aspect-[3/4] w-full" />
      <div className="space-y-2 p-3.5">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-20 rounded" />
      </div>
    </div>
  );
}
