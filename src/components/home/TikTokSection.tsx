import { Music2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function TikTokSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-royal-950 px-6 py-12 text-center sm:px-12">
        <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-gold-500/20 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-royal-500/30 blur-3xl" />
        <div className="relative flex flex-col items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full gold-gradient text-royal-950">
            <Music2 size={26} />
          </span>
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">Follow Lolix Fashions on TikTok</h2>
          <p className="max-w-md text-sm text-royal-200">
            New drops, styling tips and behind-the-scenes — join the community styling Kenya, one fit at a time.
          </p>
          <a href="https://www.tiktok.com/@lolixfashions" target="_blank" rel="noreferrer">
            <Button variant="gold" size="lg" icon={<ArrowRight size={18} />} iconPosition="right">
              @lolixfashions
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
