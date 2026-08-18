import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';

const PRODUCT_SELECT = `
  *,
  images:product_images(*),
  variants:product_variants(*, size:sizes(*), color:colors(*)),
  badges:product_badges(badge:badges(*)),
  category:categories(*)
`;

// Supabase returns joined many-to-many badges nested as { badge: Badge }[]; flatten them.
function normalizeProduct(row: any): Product {
  return {
    ...row,
    images: (row.images ?? []).sort((a: any, b: any) => a.display_order - b.display_order),
    variants: row.variants ?? [],
    badges: (row.badges ?? []).map((b: any) => b.badge).filter(Boolean),
  };
}

export interface ProductFilters {
  categorySlug?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  onlyFeatured?: boolean;
  onlyOffers?: boolean;
  sort?: 'newest' | 'price_asc' | 'price_desc';
  page?: number;
  pageSize?: number;
}

export async function fetchProducts(filters: ProductFilters = {}) {
  const {
    categorySlug,
    search,
    minPrice,
    maxPrice,
    condition,
    onlyFeatured,
    onlyOffers,
    sort = 'newest',
    page = 1,
    pageSize = 24,
  } = filters;

  let query = supabase
    .from('products')
    .select(PRODUCT_SELECT, { count: 'exact' })
    .eq('is_available', true);

  if (categorySlug) {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .maybeSingle();
    if (category) query = query.eq('category_id', category.id);
  }
  if (search) query = query.ilike('name', `%${search}%`);
  if (minPrice != null) query = query.gte('normal_price', minPrice);
  if (maxPrice != null) query = query.lte('normal_price', maxPrice);
  if (condition) query = query.eq('condition', condition);
  if (onlyFeatured) query = query.eq('is_featured', true);
  if (onlyOffers) query = query.not('offer_price', 'is', null);

  if (sort === 'price_asc') query = query.order('normal_price', { ascending: true });
  else if (sort === 'price_desc') query = query.order('normal_price', { ascending: false });
  else query = query.order('created_at', { ascending: false });

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;
  return { products: (data ?? []).map(normalizeProduct), total: count ?? 0 };
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data ? normalizeProduct(data) : null;
}

export async function fetchFeaturedProducts(limit = 8): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_available', true)
    .eq('is_featured', true)
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(normalizeProduct);
}

export async function fetchNewArrivals(limit = 8): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_available', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(normalizeProduct);
}

export async function fetchOfferProducts(limit = 8): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_available', true)
    .not('offer_price', 'is', null)
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(normalizeProduct);
}
