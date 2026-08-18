import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { MainLayout } from '@/layouts/MainLayout';
import { AdminRoute } from '@/admin/AdminRoute';
import Home from '@/pages/Home';
import Shop from '@/pages/Shop';
import ProductDetails from '@/pages/ProductDetails';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import TrackOrder from '@/pages/TrackOrder';
import Account from '@/pages/Account';
import Wishlist from '@/pages/Wishlist';
import Categories from '@/pages/Categories';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import NotFound from '@/pages/NotFound';

// Admin dashboard is code-split into its own chunk — it's a large,
// chart-heavy area that regular storefront visitors never load.
const AdminLayout = lazy(() => import('@/layouts/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const AdminLogin = lazy(() => import('@/pages/admin/Login'));
const AdminOverview = lazy(() => import('@/pages/admin/Overview'));
const AdminProducts = lazy(() => import('@/pages/admin/Products'));
const AdminCategories = lazy(() => import('@/pages/admin/Categories'));
const AdminOrders = lazy(() => import('@/pages/admin/Orders'));
const AdminCustomers = lazy(() => import('@/pages/admin/Customers'));
const AdminInventory = lazy(() => import('@/pages/admin/Inventory'));
const AdminOffers = lazy(() => import('@/pages/admin/Offers'));
const AdminBadges = lazy(() => import('@/pages/admin/Badges'));
const AdminSizes = lazy(() => import('@/pages/admin/Sizes'));
const AdminColors = lazy(() => import('@/pages/admin/Colors'));
const AdminDelivery = lazy(() => import('@/pages/admin/Delivery'));
const AdminBanners = lazy(() => import('@/pages/admin/Banners'));
const AdminReviews = lazy(() => import('@/pages/admin/Reviews'));
const AdminSettings = lazy(() => import('@/pages/admin/Settings'));

function AdminFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F3FA]">
      <Loader2 className="animate-spin text-royal-600" size={28} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <WishlistProvider>
            <BrowserRouter>
              <Routes>
                {/* Storefront */}
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:slug" element={<ProductDetails />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/track-order" element={<TrackOrder />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/privacy-policy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="*" element={<NotFound />} />
                </Route>

                {/* Admin */}
                <Route
                  path="/admin/login"
                  element={
                    <Suspense fallback={<AdminFallback />}>
                      <AdminLogin />
                    </Suspense>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <Suspense fallback={<AdminFallback />}>
                        <AdminLayout />
                      </Suspense>
                    </AdminRoute>
                  }
                >
                  <Route index element={<AdminOverview />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="inventory" element={<AdminInventory />} />
                  <Route path="offers" element={<AdminOffers />} />
                  <Route path="badges" element={<AdminBadges />} />
                  <Route path="sizes" element={<AdminSizes />} />
                  <Route path="colors" element={<AdminColors />} />
                  <Route path="delivery" element={<AdminDelivery />} />
                  <Route path="banners" element={<AdminBanners />} />
                  <Route path="reviews" element={<AdminReviews />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
