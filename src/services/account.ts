import { supabase } from '@/lib/supabase';

export async function fetchMyOrders(userId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function updateMyProfile(userId: string, updates: { full_name?: string; phone?: string }) {
  const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
  if (error) throw error;
}
