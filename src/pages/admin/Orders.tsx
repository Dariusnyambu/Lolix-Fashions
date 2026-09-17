import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { fetchAllOrdersAdmin, updateOrderStatus, updatePaymentStatus } from '@/services/admin/orders';
import { formatOrderDate, formatPrice } from '@/utils/format';
import { PageHeader, LoadingState, EmptyState, Select } from '@/components/admin/AdminUI';
import { Modal } from '@/components/admin/Modal';
import { cn } from '@/lib/cn';
import type { Order, OrderStatus, PaymentStatus } from '@/types';
import { useToast } from '@/contexts/ToastContext';

const ORDER_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'processing', 'ready_for_delivery', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES: PaymentStatus[] = ['pending', 'awaiting_payment', 'paid', 'failed', 'refunded'];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gold-50 text-gold-700',
  confirmed: 'bg-blue-50 text-blue-700',
  processing: 'bg-royal-50 text-royal-700',
  ready_for_delivery: 'bg-purple-50 text-purple-700',
  shipped: 'bg-indigo-50 text-indigo-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);
  const { showToast } = useToast();

  async function load() {
    setLoading(true);
    const data = await fetchAllOrdersAdmin();
    setOrders(data as unknown as Order[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleStatusChange(order: Order, status: OrderStatus) {
    try {
      await updateOrderStatus(order.id, status);
      showToast('Order status updated');
      load();
      if (selected?.id === order.id) setSelected({ ...selected, order_status: status });
    } catch (err) {
      console.error(err);
      showToast('Failed to update order', 'error');
    }
  }

  async function handlePaymentChange(order: Order, status: PaymentStatus) {
    try {
      await updatePaymentStatus(order.id, status);
      showToast('Payment status updated');
      load();
      if (selected?.id === order.id) setSelected({ ...selected, payment_status: status });
    } catch (err) {
      console.error(err);
      showToast('Failed to update payment', 'error');
    }
  }

  const filtered = statusFilter ? orders.filter((o) => o.order_status === statusFilter) : orders;

  return (
    <div>
      <PageHeader title="Orders" subtitle={`${orders.length} total orders`} />

      <div className="mb-4">
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="max-w-xs bg-white">
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-soft)]">
        {loading ? (
          <LoadingState />
        ) : filtered.length === 0 ? (
          <EmptyState label="No orders found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-royal-50 text-left text-xs font-semibold uppercase tracking-wide text-royal-400">
                  <th className="px-4 py-3">Order #</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">View</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-b border-royal-50 last:border-0 hover:bg-royal-50/40">
                    <td className="px-4 py-3 font-medium text-royal-900">{o.order_number}</td>
                    <td className="px-4 py-3 text-royal-600">{o.customer_name}</td>
                    <td className="px-4 py-3 font-semibold text-royal-800">{formatPrice(o.total)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-royal-50 px-2 py-0.5 text-xs font-medium capitalize text-royal-600">
                        {o.payment_status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold capitalize', STATUS_COLORS[o.order_status])}>
                        {o.order_status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-royal-400">{formatOrderDate(o.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setSelected(o)} className="rounded-lg p-2 text-royal-500 hover:bg-royal-50">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected ? `Order ${selected.order_number}` : ''} maxWidth="max-w-xl">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-royal-400">Customer</p><p className="font-medium text-royal-900">{selected.customer_name}</p></div>
              <div><p className="text-royal-400">Phone</p><p className="font-medium text-royal-900">{selected.customer_phone}</p></div>
              <div><p className="text-royal-400">Delivery</p><p className="font-medium text-royal-900">{[selected.town, selected.county].filter(Boolean).join(', ') || '—'}</p></div>
              <div><p className="text-royal-400">Payment Method</p><p className="font-medium text-royal-900 capitalize">{selected.payment_method}</p></div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-royal-700">Items</p>
              <div className="space-y-2 rounded-xl bg-royal-50/50 p-3">
                {selected.items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-royal-700">{item.product_name} x{item.quantity} {item.size_label && `(${item.size_label})`}</span>
                    <span className="font-medium text-royal-900">{formatPrice(item.line_total)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between text-sm font-bold text-royal-900 border-t border-royal-100 pt-2">
                <span>Total</span>
                <span>{formatPrice(selected.total)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="mb-1.5 text-xs font-semibold text-royal-700">Order Status</p>
                <Select value={selected.order_status} onChange={(e) => handleStatusChange(selected, e.target.value as OrderStatus)}>
                  {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </Select>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-semibold text-royal-700">Payment Status</p>
                <Select value={selected.payment_status} onChange={(e) => handlePaymentChange(selected, e.target.value as PaymentStatus)}>
                  {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </Select>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
