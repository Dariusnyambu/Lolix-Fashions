import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

interface WhatsAppButtonProps {
  href: string;
  label?: string;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function WhatsAppButton({ href, label = 'Order via WhatsApp', fullWidth, size = 'md', className }: WhatsAppButtonProps) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={cn(fullWidth && 'w-full block', className)}>
      <Button variant="whatsapp" size={size} icon={<MessageCircle size={18} />} fullWidth={fullWidth}>
        {label}
      </Button>
    </a>
  );
}
