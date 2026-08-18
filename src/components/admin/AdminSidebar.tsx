import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Boxes,
  Tag,
  Award,
  Ruler,
  Palette,
  Truck,
  Image,
  Star,
  Settings as SettingsIcon,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/cn';

const NAV_SECTIONS: { label: string; items: { to: string; label: string; icon: typeof LayoutDashboard; end?: boolean }[] }[] = [
  {
    label: 'Overview',
    items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Catalog',
    items: [
      { to: '/admin/products', label: 'Products', icon: Package },
      { to: '/admin/categories', label: 'Categories', icon: FolderTree },
      { to: '/admin/inventory', label: 'Inventory', icon: Boxes },
      { to: '/admin/offers', label: 'Offers', icon: Tag },
      { to: '/admin/badges', label: 'Badges', icon: Award },
      { to: '/admin/sizes', label: 'Sizes', icon: Ruler },
      { to: '/admin/colors', label: 'Colors', icon: Palette },
    ],
  },
  {
    label: 'Sales',
    items: [
      { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
      { to: '/admin/customers', label: 'Customers', icon: Users },
      { to: '/admin/delivery', label: 'Delivery', icon: Truck },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/banners', label: 'Banners', icon: Image },
      { to: '/admin/reviews', label: 'Reviews', icon: Star },
    ],
  },
  {
    label: 'System',
    items: [{ to: '/admin/settings', label: 'Settings', icon: SettingsIcon }],
  },
];

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate('/admin/login');
  }

  return (
    <div className="flex h-full w-64 flex-col bg-royal-950 text-white">
      <div className="flex items-center justify-between px-5 py-5">
        <span className="font-display text-lg font-bold">
          LOLIX <span className="text-gold-400">ADMIN</span>
        </span>
        <button onClick={onNavigate} className="lg:hidden text-royal-300 hover:text-white">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-5">
            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-royal-400">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive ? 'bg-royal-700 text-white' : 'text-royal-200 hover:bg-royal-900'
                    )
                  }
                >
                  <Icon size={17} />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-royal-800 p-4">
        <div className="mb-3 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full gold-gradient text-sm font-bold text-royal-950">
            {(profile?.full_name || 'A').charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{profile?.full_name || 'Admin'}</p>
            <p className="text-xs text-royal-400 capitalize">{profile?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-royal-200 hover:bg-royal-900"
        >
          <LogOut size={16} /> Log Out
        </button>
      </div>
    </div>
  );
}
