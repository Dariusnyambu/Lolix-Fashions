import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { fetchAllColors, createColor, deleteColor } from '@/services/admin/catalog';
import { PageHeader, LoadingState, EmptyState, Field, TextInput } from '@/components/admin/AdminUI';
import { Modal } from '@/components/admin/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/contexts/ToastContext';

export default function AdminColors() {
  const [colors, setColors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [hex, setHex] = useState('#5B21B6');
  const { showToast } = useToast();

  async function load() {
    setLoading(true);
    setColors(await fetchAllColors());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate() {
    if (!name.trim()) return;
    try {
      await createColor(name.trim(), hex);
      showToast('Color added');
      setName('');
      setModalOpen(false);
      load();
    } catch (err) {
      console.error(err);
      showToast('Failed to add color', 'error');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this color?')) return;
    await deleteColor(id);
    showToast('Color deleted');
    load();
  }

  return (
    <div>
      <PageHeader title="Colors" subtitle="Manage color options for products" action={<Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>Add Color</Button>} />

      {loading ? (
        <LoadingState />
      ) : colors.length === 0 ? (
        <EmptyState label="No colors yet" />
      ) : (
        <div className="flex flex-wrap gap-3">
          {colors.map((c) => (
            <div key={c.id} className="flex items-center gap-2 rounded-full bg-white py-1.5 pl-2 pr-3 shadow-[var(--shadow-soft)]">
              <span className="h-6 w-6 rounded-full border border-royal-100" style={{ backgroundColor: c.hex_code }} />
              <span className="text-sm font-medium text-royal-700">{c.name}</span>
              <button onClick={() => handleDelete(c.id)} className="text-royal-300 hover:text-red-500">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Color">
        <div className="space-y-4">
          <Field label="Name"><TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Maroon" /></Field>
          <Field label="Color"><input type="color" value={hex} onChange={(e) => setHex(e.target.value)} className="h-10 w-full rounded-lg border border-royal-100" /></Field>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Add</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
