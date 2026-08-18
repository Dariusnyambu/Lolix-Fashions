import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Search, Heart, ShoppingBag, Menu, X, User } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { cn } from '@/lib/cn';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'Thrift Clothes', to: '/shop?category=thrift-clothes' },
  { label: 'Shoes', to: '/shop?category=shoes' },
  { label: 'Suits', to: '/shop?category=suits' },
  { label: 'Beddings', to: '/shop?category=beddings' },
  { label: 'Offers', to: '/shop?offers=true' },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { itemCount, openCart } = useCart();
  const { productIds } = useWishlist();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-royal-100 bg-cream/95 backdrop-blur-md">
      {/* Top announcement bar */}
      <div className="purple-gradient text-center text-xs sm:text-sm text-white/95 py-1.5 px-4 font-medium">
        Follow us on TikTok <span className="font-bold text-gold-300">@lolixfashions</span> · Order via WhatsApp for fast delivery
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="font-display text-2xl font-bold tracking-tight text-royal-900">
            LOLIX <span className="text-gold-500">FASHIONS</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'px-3.5 py-2 text-sm font-medium rounded-full transition-colors',
                  isActive ? 'bg-royal-100 text-royal-800' : 'text-royal-700 hover:bg-royal-50'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            aria-label="Search"
            className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full text-royal-700 hover:bg-royal-50 transition-colors"
          >
            <Search size={20} />
          </button>
          <Link
            to="/account"
            aria-label="Account"
            className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full text-royal-700 hover:bg-royal-50 transition-colors"
          >
            <User size={20} />
          </Link>
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="relative hidden sm:flex h-10 w-10 items-center justify-center rounded-full text-royal-700 hover:bg-royal-50 transition-colors"
          >
            <Heart size={20} />
            {productIds.length > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full gold-gradient text-[10px] font-bold text-royal-950 flex items-center justify-center">
                {productIds.length}
              </span>
            )}
          </Link>
          <button
            aria-label="Cart"
            onClick={openCart}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-royal-700 hover:bg-royal-50 transition-colors"
          >
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full purple-gradient text-[10px] font-bold text-white flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
          <button
            aria-label="Menu"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex lg:hidden h-10 w-10 items-center justify-center rounded-full text-royal-700 hover:bg-royal-50 transition-colors"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <nav className="lg:hidden border-t border-royal-100 bg-cream px-4 py-3 animate-slide-up">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'px-4 py-2.5 text-sm font-medium rounded-xl transition-colors',
                    isActive ? 'bg-royal-100 text-royal-800' : 'text-royal-700 hover:bg-royal-50'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
