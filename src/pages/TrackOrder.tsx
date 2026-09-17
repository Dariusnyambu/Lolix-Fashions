import { Search } from 'lucide-react';
import { ComingSoon } from '@/components/ui/ComingSoon';

export default function TrackOrder() {
  return (
    <ComingSoon
      icon={Search}
      title="Track Order — Coming in Stage 2"
      description="Order tracking by order number will be available once the order management system is connected."
    />
  );
}
