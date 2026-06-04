import { MessageCircle, MapPin, Facebook, Instagram } from 'lucide-react';
import type { BusinessInfo } from '../lib/types';

interface FooterProps {
  business: BusinessInfo | null;
}

export function Footer({ business }: FooterProps) {
  if (!business) return null;

  const handleSocialClick = (url: string | null) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <footer className="bg-[#071739]/95 text-brand-gray border-t border-brand-steel/20 py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Contact Us</h3>
            <a
              href={`https://wa.me/${business.whatsapp_number.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-brand-cream hover:underline transition-all mb-3"
            >
              <MessageCircle size={20} />
              <span className="font-semibold">{business.whatsapp_number}</span>
            </a>

            {business.location && (
              <div className="flex items-start gap-3 text-brand-slate">
                <MapPin size={20} className="flex-shrink-0 mt-0.5 text-brand-bronze" />
                <span>{business.location}</span>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-4">Follow Us</h3>
            <div className="flex gap-4">
              {business.facebook_url && (
                <button
                  onClick={() => handleSocialClick(business.facebook_url)}
                  className="p-3 bg-brand-steel/25 text-white hover:bg-brand-cream hover:text-brand-dark rounded-full transition-all"
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </button>
              )}
              {business.instagram_url && (
                <button
                  onClick={() => handleSocialClick(business.instagram_url)}
                  className="p-3 bg-brand-steel/25 text-white hover:bg-brand-cream hover:text-brand-dark rounded-full transition-all"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-brand-steel/15 pt-8">
          <p className="text-brand-slate text-center text-sm">
            © {new Date().getFullYear()} {business.business_name}. All rights reserved.
          </p>
          <p className="text-brand-slate/50 text-center text-xs mt-2">
            Powered by Cartsy
          </p>
        </div>
      </div>
    </footer>
  );
}
