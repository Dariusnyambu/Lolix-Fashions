import { supabase } from '@/lib/supabase';
import type { OrderStatus } from '@/types';

export async function fetchAllOrdersAdmin() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchOrderById(id: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*), delivery_method:delivery_methods(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateOrderStatus(id: string, order_status: OrderStatus) {
  const { error } = await supabase.from('orders').update({ order_status }).eq('id', id);
  if (error) throw error;
}

export async function updatePaymentStatus(id: string, payment_status: string) {
  const { error } = await supabase.from('orders').update({ payment_status }).eq('id', id);
  if (error) throw error;
}

export async function fetchAllCustomersAdmin() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'customer')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchCustomerOrders(userId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchDashboardStats() {
  const [{ count: totalOrders }, { count: pendingOrders }, { count: totalProducts }, { count: totalCustomers }] =
    await Promise.all([
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('order_status', 'pending'),
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    ]);

  const { data: orders } = await supabase
    .from('orders')
    .select('total, created_at, order_status')
    .order('created_at', { ascending: false })
    .limit(500);

  const totalSales = (orders ?? []).reduce((sum, o) => sum + Number(o.total), 0);
  const today = new Date().toDateString();
  const todaySales = (orders ?? [])
    .filter((o) => new Date(o.created_at).toDateString() === today)
    .reduce((sum, o) => sum + Number(o.total), 0);

  const thisMonth = new Date().getMonth();
  const monthSales = (orders ?? [])
    .filter((o) => new Date(o.created_at).getMonth() === thisMonth)
    .reduce((sum, o) => sum + Number(o.total), 0);

  const completedOrders = (orders ?? []).filter((o) => o.order_status === 'delivered').length;

  const { count: lowStockCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .lte('stock_quantity', 5)
    .gt('stock_quantity', 0);

  const { count: outOfStockCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .lte('stock_quantity', 0);

  return {
    totalSales,
    todaySales,
    monthSales,
    totalOrders: totalOrders ?? 0,
    pendingOrders: pendingOrders ?? 0,
    completedOrders,
    totalCustomers: totalCustomers ?? 0,
    totalProducts: totalProducts ?? 0,
    lowStockCount: lowStockCount ?? 0,
    outOfStockCount: outOfStockCount ?? 0,
    salesHistory: orders ?? [],
  };
}
