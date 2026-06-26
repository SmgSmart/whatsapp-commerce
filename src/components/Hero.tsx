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
      <div className="px-4 py-6 sm:px-6 sm:py-8 bg-gradient-to-b from-brand-steel/15 to-transparent border-b border-brand-steel/10">
        <h2 className="text-2xl sm:text-3xl font-bold text-brand-header mb-2">
          {business.business_name}
        </h2>
        {business.tagline && (
          <p className="text-brand-cream text-sm sm:text-base font-semibold mb-4">
            {business.tagline}
          </p>
        )}
        <p className="text-brand-slate text-sm sm:text-base leading-relaxed">
          Discover our quality products. Order now via WhatsApp for quick and easy service.
        </p>
      </div>
    </section>
  );
}
