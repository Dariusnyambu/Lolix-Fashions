import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ComingSoon({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-royal-50 text-royal-600">
        <Icon size={28} />
      </span>
      <h1 className="mt-5 font-display text-2xl font-bold text-royal-900">{title}</h1>
      <p className="mt-2 text-sm text-royal-500">{description}</p>
      <Link to="/shop" className="mt-6">
        <Button>Continue Shopping</Button>
      </Link>
    </div>
  );
}
