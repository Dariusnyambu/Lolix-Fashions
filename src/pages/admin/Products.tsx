import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Copy, Search, ImagePlus, X } from 'lucide-react';
import type { Badge as BadgeType, Category, Product } from '@/types';
import {
  fetchAllProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  duplicateProduct,
  uploadProductImage,
  addProductImage,
  deleteProductImage,
  setProductBadges,
  type ProductFormInput,
} from '@/services/admin/products';
import { fetchAllCategoriesAdmin, fetchAllBadges, fetchSubcategories } from '@/services/admin/catalog';
import { formatPrice } from '@/utils/format';
import { PageHeader, LoadingState, EmptyState, Field, TextInput, TextArea, Select, CheckboxLabel } from '@/components/admin/AdminUI';
import { Modal } from '@/components/admin/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/contexts/ToastContext';
import { cn } from '@/lib/cn';

const EMPTY_FORM: ProductFormInput = {
  name: '',
  description: '',
  category_id: null,
  subcategory_id: null,
  brand: '',
  sku: '',
  condition: 'thrift_standard',
  normal_price: 0,
  offer_price: null,
  stock_quantity: 0,
  track_inventory: true,
  is_sold_out: false,
  is_featured: false,
  is_available: true,
  tags: [],
  seo_title: '',
  seo_description: '',
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [allBadges, setAllBadges] = useState<BadgeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormInput>(EMPTY_FORM);
  const [selectedBadgeIds, setSelectedBadgeIds] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { showToast } = useToast();

  async function loadAll() {
    setLoading(true);
    try {
      const [p, c, b] = await Promise.all([fetchAllProductsAdmin(), fetchAllCategoriesAdmin(), fetchAllBadges()]);
      setProducts(p);
      setCategories(c);
      setAllBadges(b);
    } catch (err) {
      console.error(err);
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (form.category_id) {
      fetchSubcategories(form.category_id).then(setSubcategories).catch(console.error);
    } else {
      setSubcategories([]);
    }
  }, [form.category_id]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setSelectedBadgeIds([]);
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description ?? '',
      category_id: product.category_id,
      subcategory_id: product.subcategory_id,
      brand: product.brand ?? '',
      sku: product.sku ?? '',
      condition: product.condition,
      normal_price: product.normal_price,
      offer_price: product.offer_price,
      stock_quantity: product.stock_quantity,
      track_inventory: product.track_inventory,
      is_sold_out: product.is_sold_out,
      is_featured: product.is_featured,
      is_available: product.is_available,
      tags: product.tags ?? [],
      seo_title: product.seo_title ?? '',
      seo_description: product.seo_description ?? '',
    });
    setSelectedBadgeIds(product.badges?.map((b) => b.id) ?? []);
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim() || form.normal_price <= 0) {
      showToast('Product name and a valid price are required', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateProduct(editing.id, form);
        await setProductBadges(editing.id, selectedBadgeIds);
        showToast('Product updated');
        setModalOpen(false);
        loadAll();
      } else {
        const created = await createProduct(form);
        await setProductBadges(created.id, selectedBadgeIds);
        showToast('Product created — add photos below, then close when done');
        const refreshed = await fetchAllProductsAdmin();
        setProducts(refreshed);
        const full = refreshed.find((p) => p.id === created.id) ?? null;
        setEditing(full);
        // keep modal open so images can be added right away
      }
    } catch (err: any) {
      console.error(err);
      showToast(err?.message || 'Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(product.id);
      showToast('Product deleted');
      loadAll();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete product', 'error');
    }
  }

  async function handleDuplicate(product: Product) {
    try {
      await duplicateProduct(product);
      showToast('Product duplicated');
      loadAll();
    } catch (err) {
      console.error(err);
      showToast('Failed to duplicate product', 'error');
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!editing || !e.target.files?.[0]) return;
    setUploading(true);
    try {
      const url = await uploadProductImage(e.target.files[0], editing.id);
      await addProductImage(editing.id, url, editing.images?.length ?? 0);
      showToast('Image uploaded');
      const refreshed = await fetchAllProductsAdmin();
      setProducts(refreshed);
      setEditing(refreshed.find((p) => p.id === editing.id) ?? editing);
    } catch (err) {
      console.error(err);
      showToast('Image upload failed — check your Storage bucket is set up', 'error');
    } finally {
      setUploading(false);
    }
  }

  async function handleImageDelete(imageId: string, imageUrl: string) {
    try {
      await deleteProductImage(imageId, imageUrl);
      if (editing) {
        const refreshed = await fetchAllProductsAdmin();
        setProducts(refreshed);
        setEditing(refreshed.find((p) => p.id === editing.id) ?? null);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${products.length} total products`}
        action={
          <Button icon={<Plus size={16} />} onClick={openCreate}>
            Add Product
          </Button>
        }
      />

      <div className="mb-4 relative max-w-sm">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-royal-300" />
        <TextInput
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-white"
        />
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-soft)]">
        {loading ? (
          <LoadingState />
        ) : filtered.length === 0 ? (
          <EmptyState label="No products found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-royal-50 text-left text-xs font-semibold uppercase tracking-wide text-royal-400">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-royal-50 last:border-0 hover:bg-royal-50/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-royal-50">
                          {p.images?.[0] && <img src={p.images[0].image_url} className="h-full w-full object-cover" />}
                        </div>
                        <span className="font-medium text-royal-900 line-clamp-1">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-royal-500">{p.category?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-royal-700">
                      {formatPrice(p.offer_price ?? p.normal_price)}
                      {p.offer_price && <span className="ml-1 text-xs text-royal-300 line-through">{formatPrice(p.normal_price)}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('font-medium', p.stock_quantity <= 0 ? 'text-red-500' : p.stock_quantity <= 5 ? 'text-gold-600' : 'text-royal-700')}>
                        {p.stock_quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', p.is_available ? 'bg-green-50 text-green-700' : 'bg-royal-50 text-royal-400')}>
                        {p.is_available ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(p)} className="rounded-lg p-2 text-royal-500 hover:bg-royal-50" title="Edit">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDuplicate(p)} className="rounded-lg p-2 text-royal-500 hover:bg-royal-50" title="Duplicate">
                          <Copy size={15} />
                        </button>
                        <button onClick={() => handleDelete(p)} className="rounded-lg p-2 text-red-400 hover:bg-red-50" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          loadAll();
        }}
        title={editing ? 'Edit Product' : 'Add Product'}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <Field label="Product Name">
            <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Vintage Denim Jacket" />
          </Field>

          <Field label="Description">
            <TextArea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <Select value={form.category_id ?? ''} onChange={(e) => setForm({ ...form, category_id: e.target.value || null, subcategory_id: null })}>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Subcategory">
              <Select value={form.subcategory_id ?? ''} onChange={(e) => setForm({ ...form, subcategory_id: e.target.value || null })} disabled={subcategories.length === 0}>
                <option value="">Select subcategory</option>
                {subcategories.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Brand">
              <TextInput value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            </Field>
            <Field label="SKU">
              <TextInput value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            </Field>
          </div>

          <Field label="Condition">
            <Select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
              <option value="new">New</option>
              <option value="thrift_premium">Thrift — Premium</option>
              <option value="thrift_standard">Thrift — Standard</option>
            </Select>
          </Field>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Normal Price (KSh)">
              <TextInput type="number" value={form.normal_price} onChange={(e) => setForm({ ...form, normal_price: Number(e.target.value) })} />
            </Field>
            <Field label="Offer Price (KSh)">
              <TextInput type="number" value={form.offer_price ?? ''} onChange={(e) => setForm({ ...form, offer_price: e.target.value ? Number(e.target.value) : null })} placeholder="Optional" />
            </Field>
            <Field label="Stock Quantity">
              <TextInput type="number" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: Number(e.target.value) })} />
            </Field>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-royal-700">Badges</p>
            <div className="flex flex-wrap gap-2">
              {allBadges.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBadgeIds((prev) => prev.includes(b.id) ? prev.filter((id) => id !== b.id) : [...prev, b.id])}
                  className={cn('rounded-full px-3 py-1 text-xs font-bold uppercase transition-opacity', !selectedBadgeIds.includes(b.id) && 'opacity-40')}
                  style={{ backgroundColor: b.bg_color, color: b.text_color }}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <CheckboxLabel checked={form.track_inventory} onChange={(e) => setForm({ ...form, track_inventory: e.target.checked })}>Track Inventory</CheckboxLabel>
            <CheckboxLabel checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}>Featured</CheckboxLabel>
            <CheckboxLabel checked={form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.checked })}>Available</CheckboxLabel>
            <CheckboxLabel checked={form.is_sold_out} onChange={(e) => setForm({ ...form, is_sold_out: e.target.checked })}>Mark Sold Out</CheckboxLabel>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="SEO Title">
              <TextInput value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} />
            </Field>
            <Field label="SEO Description">
              <TextInput value={form.seo_description} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} />
            </Field>
          </div>

          {!editing && (
            <p className="rounded-lg bg-royal-50 px-3 py-2 text-xs text-royal-500">
              Save the product first — you'll be able to upload photos right here immediately after.
            </p>
          )}

          {editing && (
            <div>
              <p className="mb-2 text-xs font-semibold text-royal-700">Product Images</p>
              <div className="flex flex-wrap gap-2">
                {editing.images?.map((img) => (
                  <div key={img.id} className="relative h-16 w-16 overflow-hidden rounded-lg">
                    <img src={img.image_url} className="h-full w-full object-cover" />
                    <button onClick={() => handleImageDelete(img.id, img.image_url)} className="absolute right-0.5 top-0.5 rounded-full bg-royal-950/70 p-0.5 text-white">
                      <X size={10} />
                    </button>
                  </div>
                ))}
                <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-royal-200 text-royal-300 hover:border-royal-400">
                  {uploading ? '…' : <ImagePlus size={18} />}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => { setModalOpen(false); loadAll(); }}>{editing ? 'Done' : 'Cancel'}</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Product'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
