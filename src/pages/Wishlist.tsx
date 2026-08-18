import { Heart } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { ComingSoon } from '@/components/ui/ComingSoon';

export default function Wishlist() {
  const { productIds } = useWishlist();
  return (
    <ComingSoon
      icon={Heart}
      title={productIds.length > 0 ? `${productIds.length} Items Saved` : 'Your Wishlist is Empty'}
      description="Full wishlist product display connects to Supabase in the next stage — your saved items are safely stored on this device for now."
    />
  );
}
