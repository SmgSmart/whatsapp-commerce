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
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="w-full px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {business.logo_url && (
              <img
                src={business.logo_url}
                alt="Business logo"
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">
                {business.business_name}
              </h1>
              {business.tagline && (
                <p className="text-xs text-gray-600 truncate">
                  {business.tagline}
                </p>
              )}
            </div>
          </div>
          <div className="flex-shrink-0 flex items-center gap-2">
            <button
              onClick={onCartClick}
              className="relative flex items-center justify-center w-10 h-10 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <ShoppingCart size={22} />
              {cartItemsCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemsCount > 99 ? '99+' : cartItemsCount}
                </span>
              )}
            </button>
            <button
              onClick={handleWhatsAppClick}
              className="flex-shrink-0 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg font-medium text-sm transition-colors"
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
