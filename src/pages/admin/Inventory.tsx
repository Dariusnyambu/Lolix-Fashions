import { useEffect, useState } from 'react';
import { Minus, Plus, AlertTriangle } from 'lucide-react';
import { fetchAllProductsAdmin, adjustStock } from '@/services/admin/products';
import type { Product } from '@/types';
import { PageHeader, LoadingState, EmptyState, Select } from '@/components/admin/AdminUI';
import { useToast } from '@/contexts/ToastContext';
import { cn } from '@/lib/cn';

type FilterMode = 'all' | 'low' | 'out';

export default function AdminInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterMode>('all');
  const { showToast } = useToast();

  async function load() {
    setLoading(true);
    const data = await fetchAllProductsAdmin();
    setProducts(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdjust(product: Product, delta: number) {
    const newQty = Math.max(0, product.stock_quantity + delta);
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, stock_quantity: newQty } : p)));
    try {
      await adjustStock(product.id, newQty);
    } catch (err) {
      console.error(err);
      showToast('Failed to update stock', 'error');
      load();
    }
  }

  const filtered = products.filter((p) => {
    if (filter === 'low') return p.stock_quantity > 0 && p.stock_quantity <= 5;
    if (filter === 'out') return p.stock_quantity <= 0;
    return true;
  });

  const lowCount = products.filter((p) => p.stock_quantity > 0 && p.stock_quantity <= 5).length;
  const outCount = products.filter((p) => p.stock_quantity <= 0).length;

  return (
    <div>
      <PageHeader title="Inventory Management" subtitle="Track and adjust stock levels" />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Select value={filter} onChange={(e) => setFilter(e.target.value as FilterMode)} className="max-w-xs bg-white">
          <option value="all">All Products ({products.length})</option>
          <option value="low">Low Stock ({lowCount})</option>
          <option value="out">Out of Stock ({outCount})</option>
        </Select>
        {(lowCount > 0 || outCount > 0) && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-gold-700">
            <AlertTriangle size={14} /> {lowCount} low, {outCount} out of stock
          </span>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-soft)]">
        {loading ? (
          <LoadingState />
        ) : filtered.length === 0 ? (
          <EmptyState label="No products in this view" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-royal-50 text-left text-xs font-semibold uppercase tracking-wide text-royal-400">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Adjust</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-royal-50 last:border-0 hover:bg-royal-50/40">
                  <td className="px-4 py-3 font-medium text-royal-900">{p.name}</td>
                  <td className="px-4 py-3 text-royal-400">{p.sku || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={cn('font-semibold', p.stock_quantity <= 0 ? 'text-red-500' : p.stock_quantity <= 5 ? 'text-gold-600' : 'text-royal-700')}>
                      {p.stock_quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleAdjust(p, -1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-royal-200 text-royal-600 hover:bg-royal-50">
                        <Minus size={13} />
                      </button>
                      <button onClick={() => handleAdjust(p, 1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-royal-200 text-royal-600 hover:bg-royal-50">
                        <Plus size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
