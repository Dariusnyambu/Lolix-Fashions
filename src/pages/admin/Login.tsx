import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

export default function AdminLogin() {
  const { user, profile, loading, isStaff, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already logged in as staff — go straight to dashboard
  if (!loading && user && isStaff) {
    return <Navigate to="/admin" replace />;
  }

  // Logged in but not staff — block access
  if (!loading && user && profile && !isStaff) {
    return (
      <div className="flex min-h-screen items-center justify-center hero-gradient px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl">
          <AlertCircle size={32} className="mx-auto text-red-500" />
          <h1 className="mt-3 text-lg font-bold text-royal-900">Access Denied</h1>
          <p className="mt-1 text-sm text-royal-500">
            This account doesn't have admin or staff permissions.
          </p>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) {
      setError(error);
    } else {
      navigate('/admin');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center hero-gradient px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <span className="font-display text-2xl font-bold text-royal-900">
            LOLIX <span className="text-gold-500">ADMIN</span>
          </span>
          <p className="mt-1 text-sm text-royal-400">Sign in to manage your store</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-royal-700">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-royal-300" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lolixfashions.com"
                className="w-full rounded-xl border border-royal-100 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-royal-400"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-royal-700">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-royal-300" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-royal-100 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-royal-400"
              />
            </div>
          </div>

          {error && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-red-500">
              <AlertCircle size={14} /> {error}
            </p>
          )}

          <Button type="submit" fullWidth size="lg" disabled={submitting} icon={submitting ? <Loader2 size={18} className="animate-spin" /> : undefined}>
            {submitting ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
}
