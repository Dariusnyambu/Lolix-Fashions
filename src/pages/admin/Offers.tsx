import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { fetchAllOffersAdmin, createOffer, updateOffer, deleteOffer } from '@/services/admin/catalog';
import { PageHeader, LoadingState, EmptyState, Field, TextInput, TextArea, Select, CheckboxLabel } from '@/components/admin/AdminUI';
import { Modal } from '@/components/admin/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/contexts/ToastContext';
import { cn } from '@/lib/cn';

const EMPTY = {
  title: '',
  description: '',
  discount_type: 'percentage',
  discount_value: 0,
  starts_at: new Date().toISOString().slice(0, 10),
  ends_at: '',
  is_active: true,
};

export default function AdminOffers() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState(EMPTY);
  const { showToast } = useToast();

  async function load() {
    setLoading(true);
    setOffers(await fetchAllOffersAdmin());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setModalOpen(true);
  }

  function openEdit(o: any) {
    setEditing(o);
    setForm({
      title: o.title,
      description: o.description ?? '',
      discount_type: o.discount_type,
      discount_value: o.discount_value,
      starts_at: o.starts_at?.slice(0, 10) ?? '',
      ends_at: o.ends_at?.slice(0, 10) ?? '',
      is_active: o.is_active,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    const payload = { ...form, ends_at: form.ends_at || null };
    try {
      if (editing) {
        await updateOffer(editing.id, payload);
        showToast('Offer updated');
      } else {
        await createOffer(payload);
        showToast('Offer created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      console.error(err);
      showToast('Failed to save offer', 'error');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this offer?')) return;
    await deleteOffer(id);
    showToast('Offer deleted');
    load();
  }

  const now = new Date();

  return (
    <div>
      <PageHeader title="Offers" subtitle="Time-limited discounts and promotions" action={<Button icon={<Plus size={16} />} onClick={openCreate}>Add Offer</Button>} />

      <div className="overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-soft)]">
        {loading ? (
          <LoadingState />
        ) : offers.length === 0 ? (
          <EmptyState label="No offers yet" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-royal-50 text-left text-xs font-semibold uppercase tracking-wide text-royal-400">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((o) => {
                const isLive = o.is_active && new Date(o.starts_at) <= now && (!o.ends_at || new Date(o.ends_at) >= now);
                return (
                  <tr key={o.id} className="border-b border-royal-50 last:border-0 hover:bg-royal-50/40">
                    <td className="px-4 py-3 font-medium text-royal-900">{o.title}</td>
                    <td className="px-4 py-3 text-royal-700">
                      {o.discount_type === 'percentage' ? `${o.discount_value}%` : `KSh ${o.discount_value}`}
                    </td>
                    <td className="px-4 py-3 text-royal-400 text-xs">
                      {o.starts_at?.slice(0, 10)} {o.ends_at ? `→ ${o.ends_at.slice(0, 10)}` : '(ongoing)'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', isLive ? 'bg-green-50 text-green-700' : 'bg-royal-50 text-royal-400')}>
                        {isLive ? 'Live' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(o)} className="rounded-lg p-2 text-royal-500 hover:bg-royal-50"><Pencil size={15} /></button>
                        <button onClick={() => handleDelete(o.id)} className="rounded-lg p-2 text-red-400 hover:bg-red-50"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Offer' : 'Add Offer'}>
        <div className="space-y-4">
          <Field label="Offer Title"><TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Mid-Year Sale" /></Field>
          <Field label="Description"><TextArea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Discount Type">
              <Select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })}>
                <option value="percentage">Percentage</option>
                <option value="fixed_amount">Fixed Amount</option>
              </Select>
            </Field>
            <Field label={form.discount_type === 'percentage' ? 'Discount %' : 'Discount (KSh)'}>
              <TextInput type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Date"><TextInput type="date" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} /></Field>
            <Field label="End Date (optional)"><TextInput type="date" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} /></Field>
          </div>
          <CheckboxLabel checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })}>Active</CheckboxLabel>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Save Changes' : 'Create Offer'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
