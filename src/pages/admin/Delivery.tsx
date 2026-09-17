import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { fetchAllDeliveryMethodsAdmin, createDeliveryMethod, updateDeliveryMethod, deleteDeliveryMethod } from '@/services/admin/catalog';
import { formatPrice } from '@/utils/format';
import { PageHeader, LoadingState, EmptyState, Field, TextInput, CheckboxLabel } from '@/components/admin/AdminUI';
import { Modal } from '@/components/admin/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/contexts/ToastContext';

export default function AdminDelivery() {
  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState('');
  const { showToast } = useToast();

  async function load() {
    setLoading(true);
    setMethods(await fetchAllDeliveryMethodsAdmin());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setName('');
    setPrice(0);
    setDescription('');
    setModalOpen(true);
  }

  function openEdit(m: any) {
    setEditing(m);
    setName(m.name);
    setPrice(m.price);
    setDescription(m.description ?? '');
    setModalOpen(true);
  }

  async function handleSave() {
    if (!name.trim()) return;
    try {
      if (editing) {
        await updateDeliveryMethod(editing.id, { name, price, description });
        showToast('Delivery method updated');
      } else {
        await createDeliveryMethod(name.trim(), price, description);
        showToast('Delivery method created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      console.error(err);
      showToast('Failed to save delivery method', 'error');
    }
  }

  async function handleToggleActive(m: any) {
    await updateDeliveryMethod(m.id, { is_active: !m.is_active });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this delivery method?')) return;
    await deleteDeliveryMethod(id);
    showToast('Delivery method deleted');
    load();
  }

  return (
    <div>
      <PageHeader title="Delivery Methods" subtitle="Manage delivery options and pricing" action={<Button icon={<Plus size={16} />} onClick={openCreate}>Add Method</Button>} />

      <div className="overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-soft)]">
        {loading ? (
          <LoadingState />
        ) : methods.length === 0 ? (
          <EmptyState label="No delivery methods yet" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-royal-50 text-left text-xs font-semibold uppercase tracking-wide text-royal-400">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {methods.map((m) => (
                <tr key={m.id} className="border-b border-royal-50 last:border-0 hover:bg-royal-50/40">
                  <td className="px-4 py-3 font-medium text-royal-900">{m.name}</td>
                  <td className="px-4 py-3 text-royal-500">{m.description || '—'}</td>
                  <td className="px-4 py-3 font-semibold text-royal-800">{formatPrice(m.price)}</td>
                  <td className="px-4 py-3"><CheckboxLabel checked={m.is_active} onChange={() => handleToggleActive(m)}>{''}</CheckboxLabel></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(m)} className="rounded-lg p-2 text-royal-500 hover:bg-royal-50"><Pencil size={15} /></button>
                      <button onClick={() => handleDelete(m.id)} className="rounded-lg p-2 text-red-400 hover:bg-red-50"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Delivery Method' : 'Add Delivery Method'}>
        <div className="space-y-4">
          <Field label="Name"><TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Nairobi Delivery" /></Field>
          <Field label="Description"><TextInput value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. 1-2 business days" /></Field>
          <Field label="Price (KSh)"><TextInput type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} /></Field>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Save Changes' : 'Create'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
