import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isStaff } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F3FA]">
        <Loader2 className="animate-spin text-royal-600" size={28} />
      </div>
    );
  }

  if (!user || !isStaff) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
