import { useEffect, useState } from 'react';
import { fetchAllCustomersAdmin, fetchCustomerOrders } from '@/services/admin/orders';
import { formatOrderDate, formatPrice } from '@/utils/format';
import { PageHeader, LoadingState, EmptyState } from '@/components/admin/AdminUI';
import { Modal } from '@/components/admin/Modal';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchAllCustomersAdmin().then(setCustomers).finally(() => setLoading(false));
  }, []);

  async function openCustomer(c: any) {
    setSelected(c);
    const data = await fetchCustomerOrders(c.id);
    setOrders(data);
  }

  return (
    <div>
      <PageHeader title="Customers" subtitle={`${customers.length} registered customers`} />

      <div className="overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-soft)]">
        {loading ? (
          <LoadingState />
        ) : customers.length === 0 ? (
          <EmptyState label="No customers yet" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-royal-50 text-left text-xs font-semibold uppercase tracking-wide text-royal-400">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} onClick={() => openCustomer(c)} className="cursor-pointer border-b border-royal-50 last:border-0 hover:bg-royal-50/40">
                  <td className="px-4 py-3 font-medium text-royal-900">{c.full_name || 'Unnamed'}</td>
                  <td className="px-4 py-3 text-royal-600">{c.phone || '—'}</td>
                  <td className="px-4 py-3 text-royal-400">{formatOrderDate(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.full_name || 'Customer'}>
        {selected && (
          <div>
            <p className="text-sm text-royal-500 mb-4">{orders.length} previous orders</p>
            <div className="space-y-2">
              {orders.map((o) => (
                <div key={o.id} className="flex justify-between rounded-xl bg-royal-50/50 px-3 py-2 text-sm">
                  <span className="text-royal-700">{o.order_number}</span>
                  <span className="font-semibold text-royal-900">{formatPrice(o.total)}</span>
                </div>
              ))}
              {orders.length === 0 && <p className="text-sm text-royal-300">No orders yet</p>}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
