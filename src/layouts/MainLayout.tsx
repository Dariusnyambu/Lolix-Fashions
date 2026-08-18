import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { FloatingWhatsApp } from '@/components/whatsapp/FloatingWhatsApp';
import { CartDrawer } from '@/components/cart/CartDrawer';

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
      <FloatingWhatsApp />
      <CartDrawer />
    </div>
  );
}
