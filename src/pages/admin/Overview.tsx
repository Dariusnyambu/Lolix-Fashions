import { useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, Users, Package, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { fetchDashboardStats } from '@/services/admin/orders';
import { formatPrice } from '@/utils/format';
import { PageHeader, StatCard, LoadingState } from '@/components/admin/AdminUI';

interface Stats {
  totalSales: number;
  todaySales: number;
  monthSales: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  salesHistory: { total: number; created_at: string; order_status: string }[];
}

const PIE_COLORS = ['#6D28D9', '#D4AF37', '#B8942A', '#8b4dff', '#4C1D95'];

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats()
      .then((s) => setStats(s as Stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (!stats) return null;

  // Build last-14-day sales trend
  const days: { date: string; sales: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });
    const dayTotal = stats.salesHistory
      .filter((o) => new Date(o.created_at).toDateString() === d.toDateString())
      .reduce((sum, o) => sum + Number(o.total), 0);
    days.push({ date: label, sales: dayTotal });
  }

  const statusCounts: Record<string, number> = {};
  stats.salesHistory.forEach((o) => {
    statusCounts[o.order_status] = (statusCounts[o.order_status] ?? 0) + 1;
  });
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <PageHeader title="Dashboard Overview" subtitle="Your store's performance at a glance" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Sales" value={formatPrice(stats.totalSales)} icon={DollarSign} tint="gold" />
        <StatCard label="Today's Sales" value={formatPrice(stats.todaySales)} icon={TrendingUp} />
        <StatCard label="Monthly Sales" value={formatPrice(stats.monthSales)} icon={DollarSign} />
        <StatCard label="Total Orders" value={stats.totalOrders} icon={ShoppingCart} />
        <StatCard label="Pending Orders" value={stats.pendingOrders} icon={Clock} />
        <StatCard label="Completed Orders" value={stats.completedOrders} icon={Package} />
        <StatCard label="Total Customers" value={stats.totalCustomers} icon={Users} />
        <StatCard label="Total Products" value={stats.totalProducts} icon={Package} tint="gold" />
      </div>

      {(stats.lowStockCount > 0 || stats.outOfStockCount > 0) && (
        <div className="mt-4 flex flex-wrap gap-3">
          {stats.lowStockCount > 0 && (
            <div className="flex items-center gap-2 rounded-xl bg-gold-50 px-4 py-2.5 text-sm font-medium text-gold-800">
              <AlertTriangle size={16} /> {stats.lowStockCount} products low on stock
            </div>
          )}
          {stats.outOfStockCount > 0 && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
              <AlertTriangle size={16} /> {stats.outOfStockCount} products out of stock
            </div>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-[var(--shadow-soft)] lg:col-span-2">
          <h3 className="mb-4 text-sm font-bold text-royal-900">Sales Over Time (Last 14 Days)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={days}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6D28D9" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#6D28D9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#c1adff" />
              <YAxis tick={{ fontSize: 11 }} stroke="#c1adff" width={40} />
              <Tooltip formatter={(v) => formatPrice(Number(v))} />
              <Area type="monotone" dataKey="sales" stroke="#6D28D9" strokeWidth={2} fill="url(#salesGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-[var(--shadow-soft)]">
          <h3 className="mb-4 text-sm font-bold text-royal-900">Orders by Status</h3>
          {statusData.length === 0 ? (
            <p className="py-10 text-center text-sm text-royal-300">No orders yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="mt-2 space-y-1.5">
            {statusData.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 capitalize text-royal-600">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  {s.name.replace(/_/g, ' ')}
                </span>
                <span className="font-semibold text-royal-900">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
