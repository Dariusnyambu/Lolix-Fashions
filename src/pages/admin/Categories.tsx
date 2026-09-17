import { useEffect, useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import {
  fetchAllCategoriesAdmin,
  createCategory,
  deleteCategory,
  updateCategory,
  fetchSubcategories,
  createSubcategory,
  deleteSubcategory,
} from '@/services/admin/catalog';
import { PageHeader, LoadingState, EmptyState, TextInput, Field, CheckboxLabel } from '@/components/admin/AdminUI';
import { Modal } from '@/components/admin/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/contexts/ToastContext';

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [subMap, setSubMap] = useState<Record<string, any[]>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [subInputs, setSubInputs] = useState<Record<string, string>>({});
  const { showToast } = useToast();

  async function load() {
    setLoading(true);
    const cats = await fetchAllCategoriesAdmin();
    setCategories(cats);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleExpand(catId: string) {
    if (expanded === catId) {
      setExpanded(null);
      return;
    }
    setExpanded(catId);
    if (!subMap[catId]) {
      const subs = await fetchSubcategories(catId);
      setSubMap((prev) => ({ ...prev, [catId]: subs }));
    }
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    try {
      await createCategory(newName.trim());
      showToast('Category created');
      setNewName('');
      setModalOpen(false);
      load();
    } catch (err: any) {
      console.error(err);
      showToast(err?.message || 'Failed to create category', 'error');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this category? Products in it will be uncategorized.')) return;
    await deleteCategory(id);
    showToast('Category deleted');
    load();
  }

  async function handleToggleActive(cat: any) {
    await updateCategory(cat.id, { is_active: !cat.is_active });
    load();
  }

  async function handleAddSub(catId: string) {
    const name = subInputs[catId]?.trim();
    if (!name) return;
    await createSubcategory(catId, name);
    const subs = await fetchSubcategories(catId);
    setSubMap((prev) => ({ ...prev, [catId]: subs }));
    setSubInputs((prev) => ({ ...prev, [catId]: '' }));
  }

  async function handleDeleteSub(catId: string, subId: string) {
    await deleteSubcategory(subId);
    const subs = await fetchSubcategories(catId);
    setSubMap((prev) => ({ ...prev, [catId]: subs }));
  }

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle="Manage categories and subcategories"
        action={<Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>Add Category</Button>}
      />

      <div className="rounded-2xl bg-white shadow-[var(--shadow-soft)]">
        {loading ? (
          <LoadingState />
        ) : categories.length === 0 ? (
          <EmptyState label="No categories yet" />
        ) : (
          <div className="divide-y divide-royal-50">
            {categories.map((cat) => (
              <div key={cat.id}>
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <button onClick={() => toggleExpand(cat.id)} className="text-royal-400">
                    {expanded === cat.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  <span className="flex-1 font-medium text-royal-900">{cat.name}</span>
                  <CheckboxLabel checked={cat.is_active} onChange={() => handleToggleActive(cat)}>Active</CheckboxLabel>
                  <button onClick={() => handleDelete(cat.id)} className="rounded-lg p-2 text-red-400 hover:bg-red-50">
                    <Trash2 size={15} />
                  </button>
                </div>
                {expanded === cat.id && (
                  <div className="bg-royal-50/40 px-4 py-3 pl-11">
                    <div className="mb-2 flex flex-wrap gap-2">
                      {(subMap[cat.id] ?? []).map((sub) => (
                        <span key={sub.id} className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-royal-700 shadow-sm">
                          {sub.name}
                          <button onClick={() => handleDeleteSub(cat.id, sub.id)} className="text-royal-300 hover:text-red-500">
                            <Trash2 size={11} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex max-w-xs gap-2">
                      <TextInput
                        placeholder="New subcategory"
                        value={subInputs[cat.id] ?? ''}
                        onChange={(e) => setSubInputs((prev) => ({ ...prev, [cat.id]: e.target.value }))}
                        className="bg-white"
                      />
                      <Button size="sm" onClick={() => handleAddSub(cat.id)}>Add</Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Category">
        <Field label="Category Name">
          <TextInput value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Accessories" />
        </Field>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate}>Create</Button>
        </div>
      </Modal>
    </div>
  );
}
