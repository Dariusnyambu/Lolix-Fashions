import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { formatPrice, getEffectivePrice } from '@/utils/format';
import { Button } from '@/components/ui/Button';
import { WhatsAppButton } from '@/components/whatsapp/WhatsAppButton';
import { getCartWhatsAppLink } from '@/utils/whatsapp';

export function CartDrawer() {
  const { items, isCartOpen, closeCart, removeItem, updateQuantity, subtotal } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-royal-950/40 backdrop-blur-sm animate-fade-in" onClick={closeCart} />
      <div className="relative flex h-full w-full max-w-md flex-col bg-cream shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between border-b border-royal-100 px-5 py-4">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-royal-900">
            <ShoppingBag size={20} /> Your Cart ({items.length})
          </h2>
          <button onClick={closeCart} className="rounded-full p-2 hover:bg-royal-50 text-royal-600">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-royal-400">
              <ShoppingBag size={40} />
              <p className="text-sm">Your cart is empty</p>
              <Link to="/shop" onClick={closeCart}>
                <Button size="sm">Start Shopping</Button>
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => {
                const image = item.product.images?.[0]?.image_url;
                const price = getEffectivePrice(item.product.normal_price, item.product.offer_price);
                return (
                  <li key={item.id} className="flex gap-3 rounded-2xl bg-white p-3 shadow-[var(--shadow-soft)]">
                    <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-royal-50">
                      {image && <img src={image} alt={item.product.name} className="h-full w-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-semibold text-royal-900">{item.product.name}</p>
                      {(item.size_label || item.color_name) && (
                        <p className="text-xs text-royal-400 mt-0.5">
                          {[item.size_label, item.color_name].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      <p className="mt-1 text-sm font-bold text-royal-800">{formatPrice(price)}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-royal-200 text-royal-700 hover:bg-royal-50"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-5 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-royal-200 text-royal-700 hover:bg-royal-50"
                        >
                          <Plus size={13} />
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="ml-auto flex h-7 w-7 items-center justify-center rounded-full text-royal-400 hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-royal-100 bg-white px-5 py-4 space-y-3">
            <div className="flex items-center justify-between text-sm text-royal-600">
              <span>Subtotal</span>
              <span className="font-bold text-royal-900">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-royal-400">Delivery fee calculated at checkout.</p>
            <Link to="/checkout" onClick={closeCart}>
              <Button fullWidth size="lg">
                Proceed to Checkout
              </Button>
            </Link>
            <WhatsAppButton href={getCartWhatsAppLink(items, subtotal)} label="Send Cart to WhatsApp" fullWidth />
          </div>
        )}
      </div>
    </div>
  );
}
