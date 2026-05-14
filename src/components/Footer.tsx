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
    <footer className="bg-gray-900 text-white py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <a
              href={`https://wa.me/${business.whatsapp_number.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-green-400 hover:text-green-300 transition-colors mb-3"
            >
              <MessageCircle size={20} />
              <span>{business.whatsapp_number}</span>
            </a>

            {business.location && (
              <div className="flex items-start gap-3 text-gray-300">
                <MapPin size={20} className="flex-shrink-0 mt-0.5" />
                <span>{business.location}</span>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Follow Us</h3>
            <div className="flex gap-4">
              {business.facebook_url && (
                <button
                  onClick={() => handleSocialClick(business.facebook_url)}
                  className="p-3 bg-gray-800 hover:bg-blue-600 rounded-full transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </button>
              )}
              {business.instagram_url && (
                <button
                  onClick={() => handleSocialClick(business.instagram_url)}
                  className="p-3 bg-gray-800 hover:bg-pink-600 rounded-full transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <p className="text-gray-400 text-center text-sm">
            © 2024 {business.business_name}. All rights reserved.
          </p>
          <p className="text-gray-500 text-center text-xs mt-2">
            Powered by Ghana Shop
          </p>
        </div>
      </div>
    </footer>
  );
}
