import { MessageCircle, ShoppingCart } from 'lucide-react';
import type { BusinessInfo } from '../lib/types';

interface NavbarProps {
  business: BusinessInfo | null;
  cartItemsCount: number;
  onCartClick: () => void;
}

export function Navbar({ business, cartItemsCount, onCartClick }: NavbarProps) {
  if (!business) return null;

  const handleWhatsAppClick = () => {
    const whatsappUrl = `https://wa.me/${business.whatsapp_number.replace(/[^0-9]/g, '')}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <nav className="sticky top-0 z-50 bg-brand-dark/85 backdrop-blur-md border-b border-brand-steel/20 shadow-lg shadow-brand-dark/40">
      <div className="w-full px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {business.logo_url && (
              <img
                src={business.logo_url}
                alt="Business logo"
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-brand-steel/30"
              />
            )}
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-white truncate">
                {business.business_name}
              </h1>
              {business.tagline && (
                <p className="text-xs text-brand-slate truncate">
                  {business.tagline}
                </p>
              )}
            </div>
          </div>
          <div className="flex-shrink-0 flex items-center gap-2">
            <button
              onClick={onCartClick}
              className="relative flex items-center justify-center w-10 h-10 text-brand-cream hover:bg-brand-steel/20 rounded-lg transition-colors"
            >
              <ShoppingCart size={22} />
              {cartItemsCount > 0 && (
                <span className="absolute top-0 right-0 bg-brand-cream text-brand-dark text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                  {cartItemsCount > 99 ? '99+' : cartItemsCount}
                </span>
              )}
            </button>
            <button
              onClick={handleWhatsAppClick}
              className="flex-shrink-0 flex items-center gap-2 bg-gradient-to-r from-brand-bronze to-brand-cream hover:opacity-90 text-brand-dark px-3 py-2 rounded-lg font-bold text-sm transition-opacity"
            >
              <MessageCircle size={18} />
              <span className="hidden xs:inline">Chat</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
