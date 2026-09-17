import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';
import { slugify } from '@/utils/format';

const PRODUCT_SELECT = `
  *,
  images:product_images(*),
  variants:product_variants(*, size:sizes(*), color:colors(*)),
  badges:product_badges(badge:badges(*)),
  category:categories!products_category_id_fkey(*)
`;

function normalizeProduct(row: any): Product {
  return {
    ...row,
    images: (row.images ?? []).sort((a: any, b: any) => a.display_order - b.display_order),
    variants: row.variants ?? [],
    badges: (row.badges ?? []).map((b: any) => b.badge).filter(Boolean),
  };
}

export async function fetchAllProductsAdmin(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(normalizeProduct);
}

export interface ProductFormInput {
  name: string;
  description: string;
  category_id: string | null;
  subcategory_id: string | null;
  brand: string;
  sku: string;
  condition: string;
  normal_price: number;
  offer_price: number | null;
  stock_quantity: number;
  track_inventory: boolean;
  is_sold_out: boolean;
  is_featured: boolean;
  is_available: boolean;
  tags: string[];
  seo_title: string;
  seo_description: string;
}

function sanitizeProductInput<T extends Partial<ProductFormInput>>(input: T): T {
  const textFields: (keyof ProductFormInput)[] = ['sku', 'brand', 'description', 'seo_title', 'seo_description'];
  const result: any = { ...input };
  for (const field of textFields) {
    if (field in input) {
      const value = (input as any)[field];
      result[field] = typeof value === 'string' && value.trim() ? value.trim() : null;
    }
  }
  return result;
}

export async function createProduct(input: ProductFormInput) {
  const slug = `${slugify(input.name)}-${Math.random().toString(36).slice(2, 7)}`;
  const { data, error } = await supabase
    .from('products')
    .insert({ ...sanitizeProductInput(input), slug })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id: string, input: Partial<ProductFormInput>) {
  const { error } = await supabase
    .from('products')
    .update(sanitizeProductInput(input))
    .eq('id', id);
  if (error) throw error;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function duplicateProduct(product: Product) {
  const slug = `${slugify(product.name)}-copy-${Math.random().toString(36).slice(2, 7)}`;
  const { images, variants, badges, category, id, created_at, updated_at, ...rest } = product as any;
  const { data, error } = await supabase
    .from('products')
    .insert({ ...rest, name: `${product.name} (Copy)`, slug, sku: null })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function addProductImage(productId: string, imageUrl: string, displayOrder = 0) {
  const { error } = await supabase
    .from('product_images')
    .insert({ product_id: productId, image_url: imageUrl, display_order: displayOrder });
  if (error) throw error;
}

export async function deleteProductImage(imageId: string) {
  const { error } = await supabase.from('product_images').delete().eq('id', imageId);
  if (error) throw error;
}

export async function uploadProductImage(file: File, productId: string): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `${productId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from('product-images').getPublicUrl(path);
  return data.publicUrl;
}

export async function setProductBadges(productId: string, badgeIds: string[]) {
  await supabase.from('product_badges').delete().eq('product_id', productId);
  if (badgeIds.length === 0) return;
  const { error } = await supabase
    .from('product_badges')
    .insert(badgeIds.map((badge_id) => ({ product_id: productId, badge_id })));
  if (error) throw error;
}

export async function adjustStock(productId: string, newQuantity: number) {
  const { error } = await supabase
    .from('products')
    .update({ stock_quantity: Math.max(0, newQuantity) })
    .eq('id', productId);
  if (error) throw error;
}
