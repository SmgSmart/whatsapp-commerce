import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Rocket, ArrowRight, MessageSquare, Globe } from 'lucide-react';
import { adminApi } from '../../lib/api';

export function Onboarding() {
  const [formData, setFormData] = useState({
    businessName: '',
    slug: '',
    whatsappNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSlugChange = (name: string) => {
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setFormData({ ...formData, businessName: name, slug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      setLoading(true);
      await adminApi.createStore({
        business_name: formData.businessName,
        slug: formData.slug,
        whatsapp_number: formData.whatsappNumber,
      });
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Failed to create store');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-brand-steel/10 rounded-3xl shadow-2xl p-8 md:p-12 border border-brand-steel/15 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-brand-cream/10 p-2.5 rounded-xl">
            <Rocket className="w-6 h-6 text-brand-cream" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Let's build your store</h1>
            <p className="text-brand-slate mt-1">You're just 60 seconds away from your first sale.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 text-rose-400 rounded-xl text-sm border border-rose-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Business Name */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-brand-slate mb-2">
                What's your business called?
              </label>
              <div className="relative">
                <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-slate/60" />
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-brand-dark/45 border border-brand-steel/20 rounded-2xl focus:ring-2 focus:ring-brand-cream focus:border-transparent text-white outline-none transition-all text-lg"
                  placeholder="e.g. Ama's Boutique"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-slate mb-2">
                Your store URL
              </label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-slate/60" />
                <div className="flex items-center w-full pl-12 pr-4 py-3 bg-brand-dark/45 border border-brand-steel/20 rounded-2xl focus-within:ring-2 focus-within:ring-brand-cream focus-within:border-transparent transition-all">
                  <span className="text-brand-slate/70 text-sm mr-1">/store/</span>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="flex-1 bg-transparent outline-none text-brand-cream font-medium"
                    placeholder="amas-boutique"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-slate mb-2">
                WhatsApp Number (for orders)
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-slate/60" />
                <input
                  type="tel"
                  required
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-brand-dark/45 border border-brand-steel/20 rounded-2xl focus:ring-2 focus:ring-brand-cream focus:border-transparent text-white outline-none transition-all text-lg"
                  placeholder="233240000000"
                />
                <p className="mt-2 text-xs text-brand-slate/60 italic">
                  Include your country code (e.g. 233 for Ghana).
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !formData.businessName || !formData.whatsappNumber}
            className="w-full bg-brand-cream hover:bg-white text-brand-dark font-bold py-4 rounded-2xl transition-all shadow-lg shadow-brand-cream/5 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
          >
            {loading ? (
              'Creating your store...'
            ) : (
              <>
                Launch My Store
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
