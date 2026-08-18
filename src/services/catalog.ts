import { supabase } from '@/lib/supabase';
import type { Banner, Category, DeliveryMethod, Settings } from '@/types';

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchActiveBanners(): Promise<Banner[]> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .eq('is_active', true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order('display_order', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchSettings(): Promise<Settings | null> {
  const { data, error } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchDeliveryMethods(): Promise<DeliveryMethod[]> {
  const { data, error } = await supabase
    .from('delivery_methods')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  if (error) throw error;
  return data ?? [];
}
