import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingBag, Minus, Plus, ShieldCheck, Truck, Tag } from 'lucide-react';
import type { Product } from '@/types';
import { fetchProductBySlug } from '@/services/products';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { WhatsAppButton } from '@/components/whatsapp/WhatsAppButton';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { getProductWhatsAppLink } from '@/utils/whatsapp';
import { cn } from '@/lib/cn';

export default function ProductDetails() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchProductBySlug(slug)
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  const sizeOptions = useMemo(() => {
    if (!product?.variants) return [];
    const seen = new Map<string, string>();
    product.variants.forEach((v) => {
      if (v.size?.label) seen.set(v.size.id, v.size.label);
    });
    return Array.from(seen.entries());
  }, [product]);

  const colorOptions = useMemo(() => {
    if (!product?.variants) return [];
    const seen = new Map<string, { name: string; hex: string | null }>();
    product.variants.forEach((v) => {
      if (v.color?.name) seen.set(v.color.id, { name: v.color.name, hex: v.color.hex_code });
    });
    return Array.from(seen.entries());
  }, [product]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="skeleton aspect-square rounded-2xl" />
          <div className="space-y-4">
            <div className="skeleton h-8 w-2/3 rounded" />
            <div className="skeleton h-6 w-1/3 rounded" />
            <div className="skeleton h-24 w-full rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="text-royal-500">Product not found.</p>
        <Link to="/shop" className="mt-3 inline-block text-sm font-semibold text-royal-700">
          ← Back to Shop
        </Link>
      </div>
    );
  }

  const outOfStock = product.is_sold_out || (product.track_inventory && product.stock_quantity <= 0);
  const productUrl = typeof window !== 'undefined' ? window.location.href : '';
  const images = product.images && product.images.length > 0 ? product.images : [];

  function handleAddToCart() {
    if (!product) return;
    const variant = product.variants?.find(
      (v) => (v.size?.label ?? null) === selectedSize && (v.color?.name ?? null) === selectedColor
    );
    addItem(product, { variant, sizeLabel: selectedSize ?? undefined, colorName: selectedColor ?? undefined, quantity });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="aspect-square overflow-hidden rounded-2xl bg-royal-50">
            {images[activeImage] ? (
              <img src={images[activeImage].image_url} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-royal-200">
                <ShoppingBag size={64} />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    'h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors',
                    i === activeImage ? 'border-royal-600' : 'border-transparent'
                  )}
                >
                  <img src={img.image_url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            {product.badges?.map((b) => (
              <Badge key={b.id} badge={b} />
            ))}
          </div>
          <h1 className="font-display text-2xl font-bold text-royal-900 sm:text-3xl">{product.name}</h1>
          {product.category?.name && <p className="mt-1 text-sm text-royal-400">{product.category.name}</p>}

          <div className="mt-4">
            <PriceDisplay normalPrice={product.normal_price} offerPrice={product.offer_price} size="lg" />
          </div>

          {product.description && <p className="mt-4 text-sm leading-relaxed text-royal-600">{product.description}</p>}

          {/* Size selector */}
          {sizeOptions.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-semibold text-royal-900">
                Size {selectedSize && <span className="text-royal-400 font-normal">— {selectedSize}</span>}
              </h3>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => setSelectedSize(label)}
                    className={cn(
                      'min-w-[42px] rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                      selectedSize === label
                        ? 'border-royal-700 bg-royal-700 text-white'
                        : 'border-royal-200 text-royal-700 hover:border-royal-400'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color selector */}
          {colorOptions.length > 0 && (
            <div className="mt-5">
              <h3 className="mb-2 text-sm font-semibold text-royal-900">
                Color {selectedColor && <span className="text-royal-400 font-normal">— {selectedColor}</span>}
              </h3>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map(([id, { name, hex }]) => (
                  <button
                    key={id}
                    onClick={() => setSelectedColor(name)}
                    title={name}
                    className={cn(
                      'h-9 w-9 rounded-full border-2 transition-transform',
                      selectedColor === name ? 'border-royal-700 scale-110' : 'border-royal-100'
                    )}
                    style={{ backgroundColor: hex || '#ccc' }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mt-5">
            <h3 className="mb-2 text-sm font-semibold text-royal-900">Quantity</h3>
            <div className="inline-flex items-center gap-3 rounded-full border border-royal-200 px-2 py-1">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full text-royal-700 hover:bg-royal-50"
              >
                <Minus size={14} />
              </button>
              <span className="w-6 text-center text-sm font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(q + 1, Math.max(product.stock_quantity, 1)))}
                className="flex h-8 w-8 items-center justify-center rounded-full text-royal-700 hover:bg-royal-50"
              >
                <Plus size={14} />
              </button>
            </div>
            {product.track_inventory && (
              <span className="ml-3 text-xs text-royal-400">{product.stock_quantity} in stock</span>
            )}
          </div>

          {/* CTAs */}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              fullWidth
              disabled={outOfStock}
              onClick={handleAddToCart}
              icon={<ShoppingBag size={18} />}
            >
              {outOfStock ? 'Out of Stock' : 'Add to Cart'}
            </Button>
            <button
              onClick={() => toggle(product.id)}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-royal-200 text-royal-600 hover:bg-royal-50"
              aria-label="Toggle wishlist"
            >
              <Heart size={20} className={isWishlisted(product.id) ? 'fill-gold-500 text-gold-500' : ''} />
            </button>
          </div>
          <div className="mt-3">
            <WhatsAppButton
              href={getProductWhatsAppLink({
                product,
                size: selectedSize ?? undefined,
                color: selectedColor ?? undefined,
                quantity,
                productUrl,
              })}
              fullWidth
              size="lg"
            />
          </div>

          {/* Meta */}
          <div className="mt-8 grid grid-cols-1 gap-3 border-t border-royal-100 pt-6 sm:grid-cols-3">
            <MetaItem icon={ShieldCheck} label="Condition" value={formatCondition(product.condition)} />
            {product.sku && <MetaItem icon={Tag} label="SKU" value={product.sku} />}
            <MetaItem icon={Truck} label="Delivery" value="Nairobi & Countrywide" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaItem({ icon: Icon, label, value }: { icon: typeof ShieldCheck; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-royal-600">
      <Icon size={16} className="text-royal-400" />
      <span className="font-medium text-royal-900">{label}:</span> {value}
    </div>
  );
}

function formatCondition(condition: string) {
  return { new: 'New', thrift_premium: 'Thrift — Premium', thrift_standard: 'Thrift — Standard' }[condition] ?? condition;
}
