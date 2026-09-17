import { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Loader2 } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F5F3FA]">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-royal-950/50" onClick={() => setMobileOpen(false)} />
          <div className="relative">
            <AdminSidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-royal-100 bg-white px-4 py-3 lg:hidden">
          <button onClick={() => setMobileOpen(true)} className="text-royal-700">
            <Menu size={22} />
          </button>
          <span className="font-display text-base font-bold text-royal-900">
            LOLIX <span className="text-gold-500">ADMIN</span>
          </span>
        </div>
        <main className="p-4 sm:p-6 lg:p-8">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-24">
                <Loader2 className="animate-spin text-royal-400" size={26} />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
