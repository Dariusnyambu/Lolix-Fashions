import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, LogOut, Package, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchMyOrders, updateMyProfile } from '@/services/account';
import { formatOrderDate, formatPrice } from '@/utils/format';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

export default function Account() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-royal-400" size={26} />
      </div>
    );
  }

  if (!user) return <AuthForm />;
  return <AccountDashboard />;
}

function AuthForm() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);
    if (mode === 'signin') {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    } else {
      const { error } = await signUp(email, password, fullName, phone || undefined);
      if (error) setError(error);
      else setInfo('Account created! Check your email to confirm, then sign in.');
    }
    setSubmitting(false);
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-14 sm:px-6">
      <div className="rounded-2xl bg-white p-7 shadow-[var(--shadow-soft)]">
        <div className="mb-6 flex rounded-full bg-royal-50 p-1">
          <button
            onClick={() => { setMode('signin'); setError(null); setInfo(null); }}
            className={cn('flex-1 rounded-full py-2 text-sm font-semibold transition-colors', mode === 'signin' ? 'bg-white text-royal-800 shadow-sm' : 'text-royal-400')}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('signup'); setError(null); setInfo(null); }}
            className={cn('flex-1 rounded-full py-2 text-sm font-semibold transition-colors', mode === 'signup' ? 'bg-white text-royal-800 shadow-sm' : 'text-royal-400')}
          >
            Create Account
          </button>
        </div>

        <h1 className="font-display text-xl font-bold text-royal-900">
          {mode === 'signin' ? 'Welcome back' : 'Join Lolix Fashions'}
        </h1>
        <p className="mt-1 text-sm text-royal-400">
          {mode === 'signin' ? 'Sign in to view your orders and wishlist' : 'Create an account to track orders and save favorites'}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === 'signup' && (
            <>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-royal-300" />
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full name"
                  className="w-full rounded-xl border border-royal-100 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-royal-400"
                />
              </div>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-royal-300" />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone (optional)"
                  className="w-full rounded-xl border border-royal-100 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-royal-400"
                />
              </div>
            </>
          )}
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-royal-300" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-xl border border-royal-100 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-royal-400"
            />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-royal-300" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-xl border border-royal-100 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-royal-400"
            />
          </div>

          {error && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-red-500">
              <AlertCircle size={14} /> {error}
            </p>
          )}
          {info && <p className="text-xs font-medium text-green-600">{info}</p>}

          <Button type="submit" fullWidth size="lg" disabled={submitting}>
            {submitting ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>
      </div>
    </div>
  );
}

function AccountDashboard() {
  const { user, profile, signOut } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchMyOrders(user.id).then(setOrders).catch(console.error).finally(() => setLoadingOrders(false));
  }, [user]);

  useEffect(() => {
    setFullName(profile?.full_name ?? '');
    setPhone(profile?.phone ?? '');
  }, [profile]);

  async function handleSaveProfile() {
    if (!user) return;
    await updateMyProfile(user.id, { full_name: fullName, phone });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-royal-900">My Account</h1>
        <button onClick={() => signOut()} className="flex items-center gap-1.5 text-sm font-medium text-royal-500 hover:text-red-500">
          <LogOut size={15} /> Sign Out
        </button>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-[var(--shadow-soft)]">
        <h2 className="mb-4 text-sm font-bold text-royal-900">Profile</h2>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-royal-600">Full Name</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-lg border border-royal-100 px-3 py-2 text-sm outline-none focus:border-royal-400" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-royal-600">Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg border border-royal-100 px-3 py-2 text-sm outline-none focus:border-royal-400" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-royal-600">Email</label>
            <input value={user?.email ?? ''} disabled className="w-full rounded-lg border border-royal-100 bg-royal-50 px-3 py-2 text-sm text-royal-400" />
          </div>
          <Button size="sm" onClick={handleSaveProfile}>{saved ? 'Saved ✓' : 'Save Changes'}</Button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-[var(--shadow-soft)]">
        <h2 className="mb-4 flex items-center gap-1.5 text-sm font-bold text-royal-900">
          <Package size={15} /> Order History
        </h2>
        {loadingOrders ? (
          <Loader2 className="animate-spin text-royal-300" size={20} />
        ) : orders.length === 0 ? (
          <div className="py-6 text-center text-sm text-royal-300">
            No orders yet.{' '}
            <Link to="/shop" className="font-semibold text-royal-600 hover:underline">
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-xl bg-royal-50/50 px-3 py-2.5 text-sm">
                <div>
                  <p className="font-semibold text-royal-900">{o.order_number}</p>
                  <p className="text-xs text-royal-400">{formatOrderDate(o.created_at)} · {o.order_status.replace(/_/g, ' ')}</p>
                </div>
                <span className="font-bold text-royal-800">{formatPrice(o.total)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
