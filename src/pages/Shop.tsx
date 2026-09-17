import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import type { Category, Product } from '@/types';
import { fetchCategories } from '@/services/catalog';
import { fetchProducts, type ProductFilters } from '@/services/products';
import { ProductCard, ProductCardSkeleton } from '@/components/product/ProductCard';
import { cn } from '@/lib/cn';

const CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'thrift_premium', label: 'Thrift — Premium' },
  { value: 'thrift_standard', label: 'Thrift — Standard' },
];

const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');

  const categorySlug = searchParams.get('category') ?? undefined;
  const condition = searchParams.get('condition') ?? undefined;
  const onlyOffers = searchParams.get('offers') === 'true';
  const sort = (searchParams.get('sort') as ProductFilters['sort']) ?? 'newest';
  const search = searchParams.get('search') ?? undefined;

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchProducts({ categorySlug, condition, onlyOffers, sort, search, pageSize: 24 })
      .then(({ products, total }) => {
        if (cancelled) return;
        setProducts(products);
        setTotal(total);
      })
      .catch(console.error)
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [categorySlug, condition, onlyOffers, sort, search]);

  function setParam(key: string, value?: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  }

  const activeCategoryName = categories.find((c) => c.slug === categorySlug)?.name;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-royal-900 sm:text-3xl">
          {activeCategoryName || 'Shop All'}
        </h1>
        <p className="mt-1 text-sm text-royal-500">{loading ? 'Loading products…' : `${total} products`}</p>
      </div>

      {/* Search + sort bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setParam('search', searchInput || undefined);
          }}
          className="relative flex-1"
        >
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-royal-300" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-full border border-royal-100 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-royal-400"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => setParam('sort', e.target.value)}
            className="rounded-full border border-royal-100 bg-white px-3.5 py-2.5 text-sm text-royal-700 outline-none"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                Sort: {s.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setFiltersOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-royal-100 bg-white px-3.5 py-2.5 text-sm font-medium text-royal-700 lg:hidden"
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop filters sidebar */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <FilterPanel
            categories={categories}
            activeCategorySlug={categorySlug}
            activeCondition={condition}
            onlyOffers={onlyOffers}
            onCategory={(v) => setParam('category', v)}
            onCondition={(v) => setParam('condition', v)}
            onOffers={(v) => setParam('offers', v ? 'true' : undefined)}
          />
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
            {loading
              ? Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>

          {!loading && products.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center text-royal-400">
              <p className="text-sm">No products found. Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filters drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-royal-950/40" onClick={() => setFiltersOpen(false)} />
          <div className="relative ml-auto flex h-full w-80 max-w-[85vw] flex-col bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-royal-900">Filters</h2>
              <button onClick={() => setFiltersOpen(false)} className="rounded-full p-2 hover:bg-royal-50">
                <X size={18} />
              </button>
            </div>
            <FilterPanel
              categories={categories}
              activeCategorySlug={categorySlug}
              activeCondition={condition}
              onlyOffers={onlyOffers}
              onCategory={(v) => setParam('category', v)}
              onCondition={(v) => setParam('condition', v)}
              onOffers={(v) => setParam('offers', v ? 'true' : undefined)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface FilterPanelProps {
  categories: Category[];
  activeCategorySlug?: string;
  activeCondition?: string;
  onlyOffers: boolean;
  onCategory: (v?: string) => void;
  onCondition: (v?: string) => void;
  onOffers: (v: boolean) => void;
}

function FilterPanel({ categories, activeCategorySlug, activeCondition, onlyOffers, onCategory, onCondition, onOffers }: FilterPanelProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-bold text-royal-900">Category</h3>
        <div className="space-y-1.5">
          <FilterRow label="All" active={!activeCategorySlug} onClick={() => onCategory(undefined)} />
          {categories.map((c) => (
            <FilterRow key={c.id} label={c.name} active={activeCategorySlug === c.slug} onClick={() => onCategory(c.slug)} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold text-royal-900">Condition</h3>
        <div className="space-y-1.5">
          <FilterRow label="All" active={!activeCondition} onClick={() => onCondition(undefined)} />
          {CONDITIONS.map((c) => (
            <FilterRow key={c.value} label={c.label} active={activeCondition === c.value} onClick={() => onCondition(c.value)} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold text-royal-900">Availability</h3>
        <FilterRow label="On Offer Only" active={onlyOffers} onClick={() => onOffers(!onlyOffers)} />
      </div>
    </div>
  );
}

function FilterRow({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'block w-full rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors',
        active ? 'bg-royal-100 font-semibold text-royal-800' : 'text-royal-600 hover:bg-royal-50'
      )}
    >
      {label}
    </button>
  );
}
