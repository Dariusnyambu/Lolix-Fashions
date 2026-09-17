import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { fetchAllSizes, createSize, deleteSize } from '@/services/admin/catalog';
import { PageHeader, LoadingState, EmptyState, Field, TextInput, Select } from '@/components/admin/AdminUI';
import { Modal } from '@/components/admin/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/contexts/ToastContext';

const GROUP_LABELS: Record<string, string> = { clothing: 'Clothing', shoes: 'Shoes', bedding: 'Bedding' };

export default function AdminSizes() {
  const [sizes, setSizes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [group, setGroup] = useState('clothing');
  const { showToast } = useToast();

  async function load() {
    setLoading(true);
    setSizes(await fetchAllSizes());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate() {
    if (!label.trim()) return;
    try {
      await createSize(label.trim(), group);
      showToast('Size added');
      setLabel('');
      setModalOpen(false);
      load();
    } catch (err) {
      console.error(err);
      showToast('Failed to add size', 'error');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this size?')) return;
    await deleteSize(id);
    showToast('Size deleted');
    load();
  }

  const grouped = sizes.reduce<Record<string, any[]>>((acc, s) => {
    (acc[s.size_group] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader title="Sizes" subtitle="Manage size options across product categories" action={<Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>Add Size</Button>} />

      {loading ? (
        <LoadingState />
      ) : sizes.length === 0 ? (
        <EmptyState label="No sizes yet" />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([g, list]) => (
            <div key={g} className="rounded-2xl bg-white p-5 shadow-[var(--shadow-soft)]">
              <h3 className="mb-3 text-sm font-bold text-royal-900">{GROUP_LABELS[g] ?? g}</h3>
              <div className="flex flex-wrap gap-2">
                {list.map((s) => (
                  <span key={s.id} className="flex items-center gap-1.5 rounded-full border border-royal-100 px-3 py-1 text-sm font-medium text-royal-700">
                    {s.label}
                    <button onClick={() => handleDelete(s.id)} className="text-royal-300 hover:text-red-500">
                      <Trash2 size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Size">
        <div className="space-y-4">
          <Field label="Label"><TextInput value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. M or 42" /></Field>
          <Field label="Size Group">
            <Select value={group} onChange={(e) => setGroup(e.target.value)}>
              <option value="clothing">Clothing</option>
              <option value="shoes">Shoes</option>
              <option value="bedding">Bedding</option>
            </Select>
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Add</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
