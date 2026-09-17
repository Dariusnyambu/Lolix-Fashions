import { useEffect, useState } from 'react';
import type { Banner, Category, Product } from '@/types';
import { fetchActiveBanners, fetchCategories } from '@/services/catalog';
import { fetchFeaturedProducts, fetchNewArrivals, fetchOfferProducts } from '@/services/products';
import { Hero } from '@/components/home/Hero';
import { FeaturedCategories } from '@/components/home/FeaturedCategories';
import { ProductSection } from '@/components/home/ProductSection';
import { WhyShopWithUs } from '@/components/home/WhyShopWithUs';
import { TikTokSection } from '@/components/home/TikTokSection';

export default function Home() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [b, c, f, n, o] = await Promise.all([
          fetchActiveBanners(),
          fetchCategories(),
          fetchFeaturedProducts(8),
          fetchNewArrivals(8),
          fetchOfferProducts(8),
        ]);
        if (cancelled) return;
        setBanners(b);
        setCategories(c);
        setFeatured(f);
        setNewArrivals(n);
        setOffers(o);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load homepage data', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <Hero banners={banners} />
      <FeaturedCategories categories={categories} />
      <ProductSection title="Featured Products" subtitle="Hand-picked favorites just for you" products={featured} loading={loading} viewAllLink="/shop" />
      <ProductSection title="New Arrivals" subtitle="Fresh drops, straight to your feed" products={newArrivals} loading={loading} viewAllLink="/shop?sort=newest" />
      <ProductSection title="Special Offers" subtitle="Limited-time deals you don't want to miss" products={offers} loading={loading} viewAllLink="/shop?offers=true" tint="gold" />
      <WhyShopWithUs />
      <TikTokSection />
    </div>
  );
}
