import { NavLink } from 'react-router-dom';
import { Home, Grid3x3, ShoppingBag, User, LayoutGrid } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/cn';

const ITEMS = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'Shop', to: '/shop', icon: Grid3x3 },
  { label: 'Categories', to: '/categories', icon: LayoutGrid },
  { label: 'Cart', to: '/cart', icon: ShoppingBag, showBadge: true },
  { label: 'Account', to: '/account', icon: User },
];

export function MobileNav() {
  const { itemCount } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex lg:hidden border-t border-royal-100 bg-white/95 backdrop-blur-md px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(76,29,149,0.08)]">
      {ITEMS.map(({ label, to, icon: Icon, showBadge }) => (
        <NavLink
          key={label}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors relative',
              isActive ? 'text-royal-800' : 'text-royal-400'
            )
          }
        >
          {({ isActive }) => (
            <>
              <span className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
                {showBadge && itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 h-4 w-4 rounded-full gold-gradient text-[9px] font-bold text-royal-950 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </span>
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
