import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2, ShoppingBag, Truck, Banknote, Smartphone } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { fetchDeliveryMethods } from '@/services/catalog';
import { placeOrder, type PlaceOrderResult } from '@/services/checkout';
import type { DeliveryMethod, PaymentMethod } from '@/types';
import { formatPrice, getEffectivePrice } from '@/utils/format';
import { getCheckoutWhatsAppLink } from '@/utils/whatsapp';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; desc: string; icon: typeof Banknote }[] = [
  { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when your order arrives', icon: Banknote },
  { value: 'whatsapp', label: 'Order via WhatsApp', desc: "We'll confirm payment details on WhatsApp", icon: ShoppingBag },
  { value: 'mpesa', label: 'M-Pesa', desc: "STK push coming soon — we'll reach out to complete payment", icon: Smartphone },
];

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user, profile } = useAuth();

  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethod[]>([]);
  const [deliveryMethodId, setDeliveryMethodId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('whatsapp');

  const [customerName, setCustomerName] = useState(profile?.full_name ?? '');
  const [customerPhone, setCustomerPhone] = useState(profile?.phone ?? '');
  const [customerEmail, setCustomerEmail] = useState(user?.email ?? '');
  const [county, setCounty] = useState('');
  const [town, setTown] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PlaceOrderResult | null>(null);
  const [placedItems, setPlacedItems] = useState<typeof items>([]);

  useEffect(() => {
    fetchDeliveryMethods()
      .then((methods) => {
        setDeliveryMethods(methods);
        if (methods.length > 0) setDeliveryMethodId(methods[0].id);
      })
      .catch(console.error);
  }, []);

  const selectedDelivery = deliveryMethods.find((m) => m.id === deliveryMethodId);
  const deliveryFee = selectedDelivery?.price ?? 0;
  const total = subtotal + deliveryFee;

  async function handleSubmit() {
    setError(null);
    if (!customerName.trim() || !customerPhone.trim() || !county.trim() || !town.trim()) {
      setError('Please fill in your name, phone, county and town.');
      return;
    }
    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }
    setSubmitting(true);
    try {
      const order = await placeOrder(items, {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        county: county.trim(),
        town: town.trim(),
        deliveryLocation: deliveryLocation.trim() || undefined,
        deliveryInstructions: deliveryInstructions.trim() || undefined,
        deliveryMethodId: deliveryMethodId || undefined,
        paymentMethod,
      });
      setPlacedItems(items);
      setResult(order);
      clearCart();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Something went wrong placing your order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return <OrderConfirmation result={result} paymentMethod={paymentMethod} items={placedItems} />;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
        <ShoppingBag size={44} className="text-royal-200" />
        <h1 className="mt-4 font-display text-xl font-bold text-royal-900">Your cart is empty</h1>
        <p className="mt-1 text-sm text-royal-500">Add something to your cart before checking out.</p>
        <Link to="/shop" className="mt-5">
          <Button>Browse Shop</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-bold text-royal-900 sm:text-3xl">Checkout</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Customer details */}
          <section className="rounded-2xl bg-white p-5 shadow-[var(--shadow-soft)]">
            <h2 className="mb-4 text-sm font-bold text-royal-900">Customer Details</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Full name" className="rounded-lg border border-royal-100 px-3 py-2.5 text-sm outline-none focus:border-royal-400 sm:col-span-2" />
              <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Phone number" className="rounded-lg border border-royal-100 px-3 py-2.5 text-sm outline-none focus:border-royal-400" />
              <input value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="Email (optional)" className="rounded-lg border border-royal-100 px-3 py-2.5 text-sm outline-none focus:border-royal-400" />
              <input value={county} onChange={(e) => setCounty(e.target.value)} placeholder="County" className="rounded-lg border border-royal-100 px-3 py-2.5 text-sm outline-none focus:border-royal-400" />
              <input value={town} onChange={(e) => setTown(e.target.value)} placeholder="Town / City" className="rounded-lg border border-royal-100 px-3 py-2.5 text-sm outline-none focus:border-royal-400" />
              <input value={deliveryLocation} onChange={(e) => setDeliveryLocation(e.target.value)} placeholder="Delivery location / estate (optional)" className="rounded-lg border border-royal-100 px-3 py-2.5 text-sm outline-none focus:border-royal-400 sm:col-span-2" />
              <textarea value={deliveryInstructions} onChange={(e) => setDeliveryInstructions(e.target.value)} placeholder="Additional delivery instructions (optional)" rows={2} className="rounded-lg border border-royal-100 px-3 py-2.5 text-sm outline-none focus:border-royal-400 sm:col-span-2" />
            </div>
          </section>

          {/* Delivery method */}
          <section className="rounded-2xl bg-white p-5 shadow-[var(--shadow-soft)]">
            <h2 className="mb-4 flex items-center gap-1.5 text-sm font-bold text-royal-900">
              <Truck size={15} /> Delivery Method
            </h2>
            <div className="space-y-2">
              {deliveryMethods.map((m) => (
                <label
                  key={m.id}
                  className={cn(
                    'flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors',
                    deliveryMethodId === m.id ? 'border-royal-600 bg-royal-50' : 'border-royal-100'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <input type="radio" name="delivery" checked={deliveryMethodId === m.id} onChange={() => setDeliveryMethodId(m.id)} className="accent-royal-700" />
                    <div>
                      <p className="font-semibold text-royal-900">{m.name}</p>
                      {m.description && <p className="text-xs text-royal-400">{m.description}</p>}
                    </div>
                  </div>
                  <span className="font-bold text-royal-800">{m.price > 0 ? formatPrice(m.price) : 'Free'}</span>
                </label>
              ))}
              {deliveryMethods.length === 0 && <p className="text-sm text-royal-300">No delivery methods configured yet.</p>}
            </div>
          </section>

          {/* Payment method */}
          <section className="rounded-2xl bg-white p-5 shadow-[var(--shadow-soft)]">
            <h2 className="mb-4 text-sm font-bold text-royal-900">Payment Method</h2>
            <div className="space-y-2">
              {PAYMENT_OPTIONS.map(({ value, label, desc, icon: Icon }) => (
                <label
                  key={value}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors',
                    paymentMethod === value ? 'border-royal-600 bg-royal-50' : 'border-royal-100'
                  )}
                >
                  <input type="radio" name="payment" checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} className="accent-royal-700" />
                  <Icon size={17} className="text-royal-500" />
                  <div>
                    <p className="font-semibold text-royal-900">{label}</p>
                    <p className="text-xs text-royal-400">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Order summary */}
        <div className="h-fit rounded-2xl bg-white p-5 shadow-[var(--shadow-soft)] lg:sticky lg:top-24">
          <h2 className="mb-4 text-sm font-bold text-royal-900">Order Summary</h2>
          <ul className="max-h-64 space-y-2 overflow-y-auto text-sm">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between gap-2">
                <span className="text-royal-600 line-clamp-1">
                  {item.product.name} x{item.quantity}
                </span>
                <span className="shrink-0 font-medium text-royal-900">
                  {formatPrice(getEffectivePrice(item.product.normal_price, item.product.offer_price) * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1.5 border-t border-royal-100 pt-3 text-sm">
            <div className="flex justify-between text-royal-600">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-royal-600">
              <span>Delivery</span>
              <span>{deliveryFee > 0 ? formatPrice(deliveryFee) : 'Free'}</span>
            </div>
            <div className="flex justify-between border-t border-royal-100 pt-2 text-base font-bold text-royal-900">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          {error && (
            <p className="mt-3 flex items-start gap-1.5 text-xs font-medium text-red-500">
              <AlertCircle size={14} className="mt-0.5 shrink-0" /> {error}
            </p>
          )}

          <Button fullWidth size="lg" className="mt-4" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 size={18} className="animate-spin" /> : `Place Order — ${formatPrice(total)}`}
          </Button>
        </div>
      </div>
    </div>
  );
}

function OrderConfirmation({
  result,
  paymentMethod,
  items,
}: {
  result: PlaceOrderResult;
  paymentMethod: PaymentMethod;
  items: ReturnType<typeof useCart>['items'];
}) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
        <CheckCircle2 size={32} />
      </span>
      <h1 className="mt-5 font-display text-2xl font-bold text-royal-900">Order Placed!</h1>
      <p className="mt-2 text-sm text-royal-500">
        Your order <span className="font-bold text-royal-800">{result.order_number}</span> has been received.
      </p>
      <div className="mt-4 w-full rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)] text-sm">
        <div className="flex justify-between text-royal-600">
          <span>Total</span>
          <span className="font-bold text-royal-900">{formatPrice(result.total)}</span>
        </div>
      </div>

      {paymentMethod === 'whatsapp' && (
        <a href={getCheckoutWhatsAppLink(result.order_number, items, result.total)} target="_blank" rel="noreferrer" className="mt-5 w-full">
          <Button variant="whatsapp" fullWidth size="lg">
            Continue on WhatsApp
          </Button>
        </a>
      )}
      {paymentMethod === 'cod' && (
        <p className="mt-5 text-sm text-royal-500">We'll call you to confirm before delivery. Pay when your order arrives.</p>
      )}
      {paymentMethod === 'mpesa' && (
        <p className="mt-5 text-sm text-royal-500">M-Pesa STK push is being finalized — our team will contact you shortly to complete payment.</p>
      )}

      <Link to="/shop" className="mt-6 text-sm font-semibold text-royal-600 hover:text-royal-800">
        Continue Shopping
      </Link>
    </div>
  );
}
