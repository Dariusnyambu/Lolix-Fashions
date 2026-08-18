import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { fetchAllBadges, createBadge, deleteBadge } from '@/services/admin/catalog';
import { PageHeader, LoadingState, EmptyState, Field, TextInput } from '@/components/admin/AdminUI';
import { Modal } from '@/components/admin/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/contexts/ToastContext';

export default function AdminBadges() {
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [bgColor, setBgColor] = useState('#5B21B6');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const { showToast } = useToast();

  async function load() {
    setLoading(true);
    setBadges(await fetchAllBadges());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate() {
    if (!label.trim()) return;
    try {
      await createBadge(label.trim().toUpperCase(), bgColor, textColor);
      showToast('Badge created');
      setLabel('');
      setModalOpen(false);
      load();
    } catch (err) {
      console.error(err);
      showToast('Failed to create badge', 'error');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this badge?')) return;
    await deleteBadge(id);
    showToast('Badge deleted');
    load();
  }

  return (
    <div>
      <PageHeader title="Badges" subtitle="NEW, SALE, HOT, TRENDING and more" action={<Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>Add Badge</Button>} />

      {loading ? (
        <LoadingState />
      ) : badges.length === 0 ? (
        <EmptyState label="No badges yet" />
      ) : (
        <div className="flex flex-wrap gap-3">
          {badges.map((b) => (
            <div key={b.id} className="flex items-center gap-2 rounded-full bg-white py-1.5 pl-4 pr-2 shadow-[var(--shadow-soft)]">
              <span className="rounded-full px-2.5 py-1 text-xs font-bold uppercase" style={{ backgroundColor: b.bg_color, color: b.text_color }}>
                {b.label}
              </span>
              <button onClick={() => handleDelete(b.id)} className="rounded-full p-1.5 text-royal-300 hover:bg-red-50 hover:text-red-500">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Badge">
        <div className="space-y-4">
          <Field label="Label"><TextInput value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. TRENDING" /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Background Color"><input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-10 w-full rounded-lg border border-royal-100" /></Field>
            <Field label="Text Color"><input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="h-10 w-full rounded-lg border border-royal-100" /></Field>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
