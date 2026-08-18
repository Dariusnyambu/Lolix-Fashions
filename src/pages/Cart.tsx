import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatPrice, getEffectivePrice } from '@/utils/format';
import { Button } from '@/components/ui/Button';
import { WhatsAppButton } from '@/components/whatsapp/WhatsAppButton';
import { getCartWhatsAppLink } from '@/utils/whatsapp';

export default function Cart() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center">
        <ShoppingBag size={48} className="text-royal-200" />
        <h1 className="mt-4 font-display text-xl font-bold text-royal-900">Your cart is empty</h1>
        <p className="mt-1 text-sm text-royal-500">Looks like you haven't added anything yet.</p>
        <Link to="/shop" className="mt-5">
          <Button icon={<ArrowRight size={16} />} iconPosition="right">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-bold text-royal-900 sm:text-3xl">Your Cart</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <ul className="space-y-4 lg:col-span-2">
          {items.map((item) => {
            const image = item.product.images?.[0]?.image_url;
            const price = getEffectivePrice(item.product.normal_price, item.product.offer_price);
            return (
              <li key={item.id} className="flex gap-4 rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)]">
                <Link to={`/product/${item.product.slug}`} className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-royal-50">
                  {image && <img src={image} alt={item.product.name} className="h-full w-full object-cover" />}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.product.slug}`} className="text-sm font-semibold text-royal-900 hover:text-royal-700">
                    {item.product.name}
                  </Link>
                  {(item.size_label || item.color_name) && (
                    <p className="mt-0.5 text-xs text-royal-400">
                      {[item.size_label, item.color_name].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  <p className="mt-1.5 text-sm font-bold text-royal-800">{formatPrice(price)}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-full border border-royal-200 px-1.5 py-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-royal-700 hover:bg-royal-50"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-5 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-royal-700 hover:bg-royal-50"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="flex items-center gap-1 text-xs font-medium text-royal-400 hover:text-red-500"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
                <p className="shrink-0 text-sm font-bold text-royal-900">{formatPrice(price * item.quantity)}</p>
              </li>
            );
          })}
        </ul>

        <div className="h-fit rounded-2xl bg-white p-5 shadow-[var(--shadow-soft)] lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-bold text-royal-900">Order Summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-royal-600">
              <span>Subtotal</span>
              <span className="font-semibold text-royal-900">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-royal-400">Delivery fee calculated at checkout.</p>
          </div>
          <div className="mt-5 space-y-2.5">
            <Link to="/checkout">
              <Button fullWidth size="lg">
                Proceed to Checkout
              </Button>
            </Link>
            <WhatsAppButton href={getCartWhatsAppLink(items, subtotal)} label="Send Cart to WhatsApp" fullWidth />
            <Link to="/shop" className="block text-center text-sm font-medium text-royal-600 hover:text-royal-800 mt-2">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
