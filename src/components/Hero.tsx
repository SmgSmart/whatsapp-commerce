import type { BusinessInfo } from '../lib/types';

interface HeroProps {
  business: BusinessInfo | null;
}

export function Hero({ business }: HeroProps) {
  if (!business) return null;

  return (
    <section className="w-full">
      {business.hero_banner_url && (
        <div className="relative h-48 sm:h-64 w-full overflow-hidden bg-gray-200">
          <img
            src={business.hero_banner_url}
            alt="Hero banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      )}
      <div className="px-4 py-6 sm:px-6 sm:py-8 bg-gradient-to-b from-blue-50 to-white">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {business.business_name}
        </h2>
        {business.tagline && (
          <p className="text-gray-600 text-sm sm:text-base mb-4">
            {business.tagline}
          </p>
        )}
        <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
          Discover our quality products. Order now via WhatsApp for quick and easy service.
        </p>
      </div>
    </section>
  );
}
