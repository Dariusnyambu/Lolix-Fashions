import { Link } from 'react-router-dom';
import { Phone, MapPin } from 'lucide-react';
import { getGeneralWhatsAppLink } from '@/utils/whatsapp';

const QUICK_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Track Order', to: '/track-order' },
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Terms & Conditions', to: '/terms' },
];

export function Footer() {
  return (
    <footer className="hero-gradient text-white pb-24 lg:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className="font-display text-2xl font-bold">
              LOLIX <span className="text-gold-400">FASHIONS</span>
            </span>
            <p className="mt-3 text-sm text-royal-100 max-w-xs">
              Thrift clothes, shoes, suits and beddings. Elevate your style, the Lolix way.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://www.tiktok.com/@lolixfashions"
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20 transition-colors"
              >
                TikTok @lolixfashions
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gold-300 uppercase tracking-wide">Quick Links</h4>
            <ul className="mt-4 space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-royal-100 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gold-300 uppercase tracking-wide">Contact</h4>
            <ul className="mt-4 space-y-3 text-sm text-royal-100">
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-gold-400 shrink-0" />
                0724 361 307
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-gold-400 shrink-0" />
                Nairobi, Kenya
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gold-300 uppercase tracking-wide">Order Fast</h4>
            <p className="mt-4 text-sm text-royal-100">Chat with us directly for quick orders and style advice.</p>
            <a
              href={getGeneralWhatsAppLink()}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1fbd5a] transition-colors"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-royal-200">
          © {new Date().getFullYear()} Lolix Fashions. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
