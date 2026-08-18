import { Gem, Wallet, MousePointerClick, MessageCircleHeart, Truck } from 'lucide-react';

const REASONS = [
  { icon: Gem, title: 'Quality Products', desc: 'Every piece hand-picked and checked for quality before it reaches you.' },
  { icon: Wallet, title: 'Affordable Prices', desc: 'Premium style without the premium price tag.' },
  { icon: MousePointerClick, title: 'Easy Ordering', desc: 'Shop on the website or order directly via WhatsApp in seconds.' },
  { icon: MessageCircleHeart, title: 'WhatsApp Support', desc: 'Real humans, real fast replies — whenever you need us.' },
  { icon: Truck, title: 'Convenient Delivery', desc: 'Nairobi and countrywide delivery options that fit your schedule.' },
];

export function WhyShopWithUs() {
  return (
    <section className="purple-gradient">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="mb-10 text-center font-display text-2xl font-bold text-white sm:text-3xl">
          Why Shop With Lolix Fashions
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-5">
          {REASONS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col items-center gap-3 rounded-2xl bg-white/10 p-5 text-center backdrop-blur-sm ring-1 ring-white/10 transition-colors hover:bg-white/15"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full gold-gradient text-royal-950">
                <Icon size={22} />
              </span>
              <h3 className="text-sm font-bold text-white">{title}</h3>
              <p className="text-xs text-royal-100 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
