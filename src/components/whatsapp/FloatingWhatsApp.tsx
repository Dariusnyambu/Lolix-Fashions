import { MessageCircle } from 'lucide-react';
import { getGeneralWhatsAppLink } from '@/utils/whatsapp';

export function FloatingWhatsApp() {
  return (
    <a
      href={getGeneralWhatsAppLink()}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Lolix Fashions on WhatsApp"
      className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_rgba(37,211,102,0.45)] transition-transform hover:scale-105 active:scale-95 lg:bottom-6"
    >
      <MessageCircle size={26} fill="white" className="text-[#25D366]" />
    </a>
  );
}
