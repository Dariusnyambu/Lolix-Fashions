import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle } from 'lucide-react';
import type { Banner } from '@/types';
import { Button } from '@/components/ui/Button';
import { getGeneralWhatsAppLink } from '@/utils/whatsapp';
import { cn } from '@/lib/cn';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1600&auto=format&fit=crop';

export function Hero({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);
  const slides = banners.length > 0 ? banners : null;

  useEffect(() => {
    if (!slides || slides.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, [slides]);

  const active = slides?.[index];

  return (
    <section className="relative overflow-hidden hero-gradient">
      <div className="absolute inset-0 opacity-20 mix-blend-overlay">
        <img
          src={active?.image_url || FALLBACK_IMAGE}
          alt=""
          className="h-full w-full object-cover transition-opacity duration-700"
        />
      </div>
      <div className="relative mx-auto flex min-h-[520px] max-w-7xl flex-col items-start justify-center gap-5 px-4 py-20 sm:px-6 lg:px-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-400/20 px-3.5 py-1.5 text-xs font-semibold text-gold-300 ring-1 ring-gold-400/30">
          Trusted on TikTok · @lolixfashions
        </span>
        <h1 className="max-w-xl font-display text-4xl font-bold leading-[1.1] text-white sm:text-5xl lg:text-6xl text-balance">
          {active?.heading || 'Elevate Your Style with Lolix Fashions'}
        </h1>
        <p className="max-w-md text-base text-royal-100 sm:text-lg">
          {active?.subtitle || 'Thrift clothes, new & thrift shoes, suits and beddings — curated for your lifestyle.'}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <Link to={active?.cta_link || '/shop'}>
            <Button variant="gold" size="lg" icon={<ArrowRight size={18} />} iconPosition="right">
              {active?.cta_label || 'Shop Now'}
            </Button>
          </Link>
          <a href={getGeneralWhatsAppLink()} target="_blank" rel="noreferrer">
            <Button variant="whatsapp" size="lg" icon={<MessageCircle size={18} />}>
              Chat on WhatsApp
            </Button>
          </a>
        </div>

        {slides && slides.length > 1 && (
          <div className="mt-6 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === index ? 'w-8 bg-gold-400' : 'w-3 bg-white/30'
                )}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
