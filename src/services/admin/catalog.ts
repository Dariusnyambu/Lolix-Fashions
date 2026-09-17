import { supabase } from '@/lib/supabase';
import { slugify } from '@/utils/format';

// ---- Categories ----
export async function fetchAllCategoriesAdmin() {
  const { data, error } = await supabase.from('categories').select('*').order('display_order');
  if (error) throw error;
  return data ?? [];
}
export async function createCategory(name: string, imageUrl?: string) {
  const { error } = await supabase.from('categories').insert({ name, slug: slugify(name), image_url: imageUrl });
  if (error) throw error;
}
export async function updateCategory(id: string, updates: Record<string, any>) {
  const { error } = await supabase.from('categories').update(updates).eq('id', id);
  if (error) throw error;
}
export async function deleteCategory(id: string) {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchSubcategories(categoryId?: string) {
  let query = supabase.from('subcategories').select('*').order('display_order');
  if (categoryId) query = query.eq('category_id', categoryId);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}
export async function createSubcategory(categoryId: string, name: string) {
  const { error } = await supabase
    .from('subcategories')
    .insert({ category_id: categoryId, name, slug: slugify(name) });
  if (error) throw error;
}
export async function deleteSubcategory(id: string) {
  const { error } = await supabase.from('subcategories').delete().eq('id', id);
  if (error) throw error;
}

// ---- Badges ----
export async function fetchAllBadges() {
  const { data, error } = await supabase.from('badges').select('*').order('label');
  if (error) throw error;
  return data ?? [];
}
export async function createBadge(label: string, bg_color: string, text_color: string) {
  const { error } = await supabase.from('badges').insert({ label, bg_color, text_color });
  if (error) throw error;
}
export async function updateBadge(id: string, updates: Record<string, any>) {
  const { error } = await supabase.from('badges').update(updates).eq('id', id);
  if (error) throw error;
}
export async function deleteBadge(id: string) {
  const { error } = await supabase.from('badges').delete().eq('id', id);
  if (error) throw error;
}

// ---- Sizes ----
export async function fetchAllSizes() {
  const { data, error } = await supabase.from('sizes').select('*').order('size_group').order('display_order');
  if (error) throw error;
  return data ?? [];
}
export async function createSize(label: string, size_group: string) {
  const { error } = await supabase.from('sizes').insert({ label, size_group });
  if (error) throw error;
}
export async function deleteSize(id: string) {
  const { error } = await supabase.from('sizes').delete().eq('id', id);
  if (error) throw error;
}

// ---- Colors ----
export async function fetchAllColors() {
  const { data, error } = await supabase.from('colors').select('*').order('name');
  if (error) throw error;
  return data ?? [];
}
export async function createColor(name: string, hex_code: string) {
  const { error } = await supabase.from('colors').insert({ name, hex_code });
  if (error) throw error;
}
export async function deleteColor(id: string) {
  const { error } = await supabase.from('colors').delete().eq('id', id);
  if (error) throw error;
}

// ---- Delivery Methods ----
export async function fetchAllDeliveryMethodsAdmin() {
  const { data, error } = await supabase.from('delivery_methods').select('*').order('display_order');
  if (error) throw error;
  return data ?? [];
}
export async function createDeliveryMethod(name: string, price: number, description?: string) {
  const { error } = await supabase.from('delivery_methods').insert({ name, price, description });
  if (error) throw error;
}
export async function updateDeliveryMethod(id: string, updates: Record<string, any>) {
  const { error } = await supabase.from('delivery_methods').update(updates).eq('id', id);
  if (error) throw error;
}
export async function deleteDeliveryMethod(id: string) {
  const { error } = await supabase.from('delivery_methods').delete().eq('id', id);
  if (error) throw error;
}

// ---- Banners ----
export async function fetchAllBannersAdmin() {
  const { data, error } = await supabase.from('banners').select('*').order('display_order');
  if (error) throw error;
  return data ?? [];
}
export async function createBanner(input: Record<string, any>) {
  const { error } = await supabase.from('banners').insert(input);
  if (error) throw error;
}
export async function updateBanner(id: string, updates: Record<string, any>) {
  const { error } = await supabase.from('banners').update(updates).eq('id', id);
  if (error) throw error;
}
export async function deleteBanner(id: string) {
  const { error } = await supabase.from('banners').delete().eq('id', id);
  if (error) throw error;
}
export async function uploadBannerImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `banners/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('banners').upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from('banners').getPublicUrl(path);
  return data.publicUrl;
}

// ---- Offers ----
export async function fetchAllOffersAdmin() {
  const { data, error } = await supabase.from('offers').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
export async function createOffer(input: Record<string, any>) {
  const { error } = await supabase.from('offers').insert(input);
  if (error) throw error;
}
export async function updateOffer(id: string, updates: Record<string, any>) {
  const { error } = await supabase.from('offers').update(updates).eq('id', id);
  if (error) throw error;
}
export async function deleteOffer(id: string) {
  const { error } = await supabase.from('offers').delete().eq('id', id);
  if (error) throw error;
}

// ---- Settings ----
export async function updateSettings(updates: Record<string, any>) {
  const { error } = await supabase.from('settings').update(updates).eq('id', 1);
  if (error) throw error;
}

// ---- Reviews ----
export async function fetchAllReviewsAdmin() {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, product:products(name)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
export async function updateReviewStatus(id: string, status: string) {
  const { error } = await supabase.from('reviews').update({ status }).eq('id', id);
  if (error) throw error;
}
export async function deleteReview(id: string) {
  const { error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) throw error;
}
