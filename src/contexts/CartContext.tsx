import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CartItem, Product, ProductVariant } from '@/types';
import { getEffectivePrice } from '@/utils/format';

const STORAGE_KEY = 'lolix_cart_v1';
const DEFAULT_DELIVERY_FEE = 0; // resolved from delivery_methods at checkout

interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product, opts?: { variant?: ProductVariant; sizeLabel?: string; colorName?: string; quantity?: number }) => void;
  removeItem: (cartItemKey: string) => void;
  updateQuantity: (cartItemKey: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function cartItemKey(item: Pick<CartItem, 'product' | 'variant'>): string {
  return `${item.product.id}::${item.variant?.id ?? 'no-variant'}`;
}

interface StoredCartItem {
  product: Product;
  variant?: ProductVariant | null;
  size_label?: string | null;
  color_name?: string | null;
  quantity: number;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed: StoredCartItem[] = JSON.parse(raw);
      return parsed as CartItem[];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem: CartContextValue['addItem'] = (product, opts = {}) => {
    const { variant, sizeLabel, colorName, quantity = 1 } = opts;
    setItems((prev) => {
      const key = cartItemKey({ product, variant: variant ?? null });
      const existingIndex = prev.findIndex((i) => cartItemKey(i) === key);
      const maxStock = variant?.stock_quantity ?? product.stock_quantity;

      if (existingIndex >= 0) {
        const next = [...prev];
        const newQty = Math.min(next[existingIndex].quantity + quantity, Math.max(maxStock, 1));
        next[existingIndex] = { ...next[existingIndex], quantity: newQty };
        return next;
      }

      const newItem: CartItem = {
        id: key,
        product,
        variant: variant ?? null,
        size_label: sizeLabel ?? null,
        color_name: colorName ?? null,
        quantity: Math.min(quantity, Math.max(maxStock, 1)),
      };
      return [...prev, newItem];
    });
    setCartOpen(true);
  };

  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((i) => i.id !== key));
  };

  const updateQuantity = (key: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.id !== key) return i;
          const maxStock = i.variant?.stock_quantity ?? i.product.stock_quantity;
          const clamped = Math.max(1, Math.min(quantity, Math.max(maxStock, 1)));
          return { ...i, quantity: clamped };
        })
        .filter((i) => i.quantity > 0)
    );
  };

  const clearCart = () => setItems([]);

  const subtotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        const price = getEffectivePrice(item.product.normal_price, item.product.offer_price);
        return sum + price * item.quantity;
      }, 0),
    [items]
  );

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  const value: CartContextValue = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    itemCount,
    isCartOpen,
    openCart: () => setCartOpen(true),
    closeCart: () => setCartOpen(false),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}

export { DEFAULT_DELIVERY_FEE };
