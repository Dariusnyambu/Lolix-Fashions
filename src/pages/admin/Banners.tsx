import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, ImagePlus } from 'lucide-react';
import { fetchAllBannersAdmin, createBanner, updateBanner, deleteBanner, uploadBannerImage } from '@/services/admin/catalog';
import { PageHeader, LoadingState, EmptyState, Field, TextInput, CheckboxLabel } from '@/components/admin/AdminUI';
import { Modal } from '@/components/admin/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/contexts/ToastContext';

const EMPTY = { heading: '', subtitle: '', cta_label: '', cta_link: '', image_url: '', is_active: true };

export default function AdminBanners() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  async function load() {
    setLoading(true);
    setBanners(await fetchAllBannersAdmin());
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

  function openEdit(b: any) {
    setEditing(b);
    setForm({
      heading: b.heading ?? '',
      subtitle: b.subtitle ?? '',
      cta_label: b.cta_label ?? '',
      cta_link: b.cta_link ?? '',
      image_url: b.image_url ?? '',
      is_active: b.is_active,
    });
    setModalOpen(true);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    try {
      const url = await uploadBannerImage(e.target.files[0]);
      setForm((prev) => ({ ...prev, image_url: url }));
    } catch (err) {
      console.error(err);
      showToast('Image upload failed — check your Storage bucket is set up', 'error');
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!form.image_url) {
      showToast('Please upload a banner image', 'error');
      return;
    }
    try {
      if (editing) {
        await updateBanner(editing.id, form);
        showToast('Banner updated');
      } else {
        await createBanner({ ...form, display_order: banners.length });
        showToast('Banner created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      console.error(err);
      showToast('Failed to save banner', 'error');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this banner?')) return;
    await deleteBanner(id);
    showToast('Banner deleted');
    load();
  }

  async function handleToggleActive(b: any) {
    await updateBanner(b.id, { is_active: !b.is_active });
    load();
  }

  return (
    <div>
      <PageHeader title="Homepage Banners" subtitle="Manage the hero carousel" action={<Button icon={<Plus size={16} />} onClick={openCreate}>Add Banner</Button>} />

      {loading ? (
        <LoadingState />
      ) : banners.length === 0 ? (
        <EmptyState label="No banners yet — the hero will show a default image" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {banners.map((b) => (
            <div key={b.id} className="overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-soft)]">
              <div className="aspect-[16/9] bg-royal-50">
                <img src={b.image_url} className="h-full w-full object-cover" />
              </div>
              <div className="p-4">
                <p className="font-semibold text-royal-900 line-clamp-1">{b.heading || 'Untitled'}</p>
                <p className="text-xs text-royal-400 line-clamp-1">{b.subtitle}</p>
                <div className="mt-3 flex items-center justify-between">
                  <CheckboxLabel checked={b.is_active} onChange={() => handleToggleActive(b)}>Active</CheckboxLabel>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(b)} className="rounded-lg p-2 text-royal-500 hover:bg-royal-50"><Pencil size={15} /></button>
                    <button onClick={() => handleDelete(b.id)} className="rounded-lg p-2 text-red-400 hover:bg-red-50"><Trash2 size={15} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Banner' : 'Add Banner'}>
        <div className="space-y-4">
          <div>
            <p className="mb-1.5 text-xs font-semibold text-royal-700">Banner Image</p>
            {form.image_url ? (
              <div className="mb-2 aspect-[16/9] overflow-hidden rounded-xl bg-royal-50">
                <img src={form.image_url} className="h-full w-full object-cover" />
              </div>
            ) : null}
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-royal-200 py-3 text-sm text-royal-400 hover:border-royal-400">
              <ImagePlus size={16} /> {uploading ? 'Uploading…' : form.image_url ? 'Replace image' : 'Upload image'}
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
          </div>
          <Field label="Heading"><TextInput value={form.heading} onChange={(e) => setForm({ ...form, heading: e.target.value })} placeholder="e.g. Elevate Your Style" /></Field>
          <Field label="Subtitle"><TextInput value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="CTA Label"><TextInput value={form.cta_label} onChange={(e) => setForm({ ...form, cta_label: e.target.value })} placeholder="Shop Now" /></Field>
            <Field label="CTA Link"><TextInput value={form.cta_link} onChange={(e) => setForm({ ...form, cta_link: e.target.value })} placeholder="/shop" /></Field>
          </div>
          <CheckboxLabel checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })}>Active</CheckboxLabel>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Save Changes' : 'Create Banner'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
