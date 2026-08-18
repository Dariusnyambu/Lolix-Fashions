import { PackageCheck } from 'lucide-react';
import { ComingSoon } from '@/components/ui/ComingSoon';

export default function Checkout() {
  return (
    <ComingSoon
      icon={PackageCheck}
      title="Checkout — Coming in Stage 2"
      description="Full checkout with delivery method selection, Cash on Delivery, WhatsApp orders and M-Pesa architecture lands in the next build stage. For now, send your cart straight to WhatsApp to place an order."
    />
  );
}
