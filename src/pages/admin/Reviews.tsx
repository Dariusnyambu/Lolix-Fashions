import { useEffect, useState } from 'react';
import { Star, Check, EyeOff, Trash2 } from 'lucide-react';
import { fetchAllReviewsAdmin, updateReviewStatus, deleteReview } from '@/services/admin/catalog';
import { formatOrderDate } from '@/utils/format';
import { PageHeader, LoadingState, EmptyState } from '@/components/admin/AdminUI';
import { useToast } from '@/contexts/ToastContext';
import { cn } from '@/lib/cn';

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  async function load() {
    setLoading(true);
    setReviews(await fetchAllReviewsAdmin());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleStatus(id: string, status: string) {
    await updateReviewStatus(id, status);
    showToast(`Review ${status}`);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this review?')) return;
    await deleteReview(id);
    showToast('Review deleted');
    load();
  }

  return (
    <div>
      <PageHeader title="Reviews" subtitle="Moderate customer product reviews" />

      <div className="overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-soft)]">
        {loading ? (
          <LoadingState />
        ) : reviews.length === 0 ? (
          <EmptyState label="No reviews yet" />
        ) : (
          <div className="divide-y divide-royal-50">
            {reviews.map((r) => (
              <div key={r.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-royal-900">{r.customer_name}</span>
                    <span className="flex items-center gap-0.5 text-gold-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} fill={i < r.rating ? 'currentColor' : 'none'} />
                      ))}
                    </span>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize',
                        r.status === 'approved' ? 'bg-green-50 text-green-700' : r.status === 'hidden' ? 'bg-royal-50 text-royal-400' : 'bg-gold-50 text-gold-700'
                      )}
                    >
                      {r.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-royal-400">{r.product?.name} · {formatOrderDate(r.created_at)}</p>
                  {r.comment && <p className="mt-1.5 text-sm text-royal-600">{r.comment}</p>}
                </div>
                <div className="flex gap-1">
                  {r.status !== 'approved' && (
                    <button onClick={() => handleStatus(r.id, 'approved')} className="rounded-lg p-2 text-green-500 hover:bg-green-50" title="Approve"><Check size={15} /></button>
                  )}
                  {r.status !== 'hidden' && (
                    <button onClick={() => handleStatus(r.id, 'hidden')} className="rounded-lg p-2 text-royal-400 hover:bg-royal-50" title="Hide"><EyeOff size={15} /></button>
                  )}
                  <button onClick={() => handleDelete(r.id)} className="rounded-lg p-2 text-red-400 hover:bg-red-50" title="Delete"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
