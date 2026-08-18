import { UserCircle } from 'lucide-react';
import { ComingSoon } from '@/components/ui/ComingSoon';

export default function Account() {
  return (
    <ComingSoon
      icon={UserCircle}
      title="Account — Coming in Stage 2"
      description="Customer registration, login and order history will be enabled with Supabase Authentication in the next stage."
    />
  );
}
