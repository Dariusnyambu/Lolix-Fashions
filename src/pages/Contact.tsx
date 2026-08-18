import { Phone, MapPin } from 'lucide-react';
import { WhatsAppButton } from '@/components/whatsapp/WhatsAppButton';
import { getGeneralWhatsAppLink } from '@/utils/whatsapp';

export default function Contact() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-bold text-royal-900 sm:text-3xl">Get in Touch</h1>
      <p className="mt-3 text-royal-600">We usually reply fastest on WhatsApp.</p>
      <div className="mt-6 space-y-3 text-sm text-royal-700">
        <p className="flex items-center gap-2"><Phone size={16} className="text-royal-400" /> 0724 361 307</p>
        <p className="flex items-center gap-2"><MapPin size={16} className="text-royal-400" /> Nairobi, Kenya</p>
      </div>
      <div className="mt-6 max-w-xs">
        <WhatsAppButton href={getGeneralWhatsAppLink()} fullWidth size="lg" />
      </div>
    </div>
  );
}
