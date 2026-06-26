import { useState } from 'react';
import { 
  Store, 
  Rocket, 
  ArrowRight, 
  MessageSquare, 
  Globe, 
  Upload, 
  Image as ImageIcon, 
  MapPin, 
  Facebook, 
  Instagram, 
  ArrowLeft, 
  Tag 
} from 'lucide-react';
import { adminApi } from '../../lib/api';
import { useStorage } from '../../hooks/useStorage';

export function Onboarding() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    slug: '',
    whatsappNumber: '',
    tagline: '',
    location: '',
    facebookUrl: '',
    instagramUrl: '',
    logoUrl: '',
    heroBannerUrl: '',
  });
  const [uploading, setUploading] = useState<{ logo: boolean; banner: boolean }>({
    logo: false,
    banner: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { uploadFile } = useStorage();

  const handleSlugChange = (name: string) => {
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setFormData({ ...formData, businessName: name, slug });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logoUrl' | 'heroBannerUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const storageKey = type === 'logoUrl' ? 'logo' : 'banner';
    setUploading(prev => ({ ...prev, [storageKey]: true }));
    setError(null);

    try {
      const url = await uploadFile(file, 'branding');
      if (url) {
        setFormData(prev => ({ ...prev, [type]: url }));
      }
    } catch (err: any) {
      console.error('[Onboarding Upload] Error:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(prev => ({ ...prev, [storageKey]: false }));
    }
  };

  // Ghana local phone validation: starts with 0 and exactly 10 digits
  const isWhatsappValid = /^[0][0-9]{9}$/.test(formData.whatsappNumber.trim());

  const isStep1Valid = formData.businessName.trim().length > 0 && 
                       formData.slug.trim().length > 0 && 
                       isWhatsappValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStep1Valid) {
      setStep(1);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await adminApi.createStore({
        business_name: formData.businessName,
        slug: formData.slug,
        whatsapp_number: formData.whatsappNumber,
        tagline: formData.tagline || null,
        location: formData.location || null,
        facebook_url: formData.facebookUrl || null,
        instagram_url: formData.instagramUrl || null,
        logo_url: formData.logoUrl || null,
        hero_banner_url: formData.heroBannerUrl || null,
      });
      
      // Onboarding complete — redirect straight to the store dashboard
      // Refresh page to let StoreProvider load the newly created store
      window.location.href = '/admin';
    } catch (err: any) {
      setError(err.message || 'Failed to create store');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-brand-steel/10 rounded-3xl shadow-2xl p-6 md:p-10 border border-brand-steel/15 backdrop-blur-md">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-brand-cream/10 p-2.5 rounded-xl">
            <Rocket className="w-6 h-6 text-brand-cream" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-brand-header">Let's build your store</h1>
            <p className="text-brand-slate mt-1 text-sm">Customize your premium WhatsApp storefront in seconds.</p>
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-brand-steel/10">
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step === 1 ? 'bg-brand-cream text-brand-dark' : 'bg-brand-cream/20 text-brand-cream'}`}>1</span>
            <span className={`text-xs font-bold uppercase tracking-wider ${step === 1 ? 'text-brand-header' : 'text-brand-slate'}`}>Basics</span>
          </div>
          <div className="flex-1 h-[2px] bg-brand-steel/15 mx-4 relative">
            <div className="absolute top-0 left-0 h-full bg-brand-cream transition-all duration-300" style={{ width: step === 1 ? '0%' : '100%' }}></div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step === 2 ? 'bg-brand-cream text-brand-dark' : 'bg-brand-cream/20 text-brand-cream'}`}>2</span>
            <span className={`text-xs font-bold uppercase tracking-wider ${step === 2 ? 'text-brand-header' : 'text-brand-slate'}`}>Branding & Socials</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 text-rose-400 rounded-2xl text-sm border border-rose-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* STEP 1: BASICS */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Business Name */}
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
                    className="w-full pl-12 pr-4 py-3 bg-brand-dark/45 border border-brand-steel/20 rounded-2xl focus:ring-2 focus:ring-brand-cream focus:border-transparent text-brand-header outline-none transition-all text-base"
                    placeholder="e.g. Ama's Boutique"
                  />
                </div>
              </div>

              {/* Store Slug / URL */}
              <div>
                <label className="block text-sm font-semibold text-brand-slate mb-2">
                  Your store URL slug
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

              {/* WhatsApp Number */}
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
                    className={`w-full pl-12 pr-4 py-3 bg-brand-dark/45 border rounded-2xl focus:ring-2 focus:ring-brand-cream focus:border-transparent text-brand-header outline-none transition-all text-base ${
                      formData.whatsappNumber.length > 0 && !isWhatsappValid 
                        ? 'border-rose-500/50' 
                        : 'border-brand-steel/20'
                    }`}
                    placeholder="e.g. 0244369749"
                  />
                  {formData.whatsappNumber.length > 0 && !isWhatsappValid && (
                    <p className="mt-1.5 text-xs text-rose-400">
                      Must start with 0 and be exactly 10 digits long (no country code).
                    </p>
                  )}
                  <p className="mt-2 text-xs text-brand-slate/60 italic">
                    Enter your local number starting with 0. Prepend 0, e.g. 0244369749.
                  </p>
                </div>
              </div>

              {/* Next Step Button */}
              <button
                type="button"
                disabled={!isStep1Valid}
                onClick={() => setStep(2)}
                className="w-full mt-2 bg-brand-cream hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-brand-dark font-bold py-4 rounded-2xl transition-all shadow-lg shadow-brand-cream/5 flex items-center justify-center gap-2 group hover:scale-[1.01] active:scale-[0.99]"
              >
                Continue to Branding
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {/* STEP 2: BRANDING & SOCIALS */}
          {step === 2 && (
            <div className="space-y-5">
              
              {/* Slogan & Location Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-brand-slate mb-1.5">
                    Tagline / Slogan
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-slate/60" />
                    <input
                      type="text"
                      value={formData.tagline}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-brand-dark/45 border border-brand-steel/20 rounded-xl text-brand-header outline-none focus:border-brand-cream transition-colors text-sm"
                      placeholder="e.g. Trendy looks for less"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-brand-slate mb-1.5">
                    Store Location / Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-slate/60" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-brand-dark/45 border border-brand-steel/20 rounded-xl text-brand-header outline-none focus:border-brand-cream transition-colors text-sm"
                      placeholder="e.g. East Legon, Accra"
                    />
                  </div>
                </div>
              </div>

              {/* Logo and Banner Upload Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Logo Upload */}
                <div className="bg-brand-steel/5 rounded-2xl border border-brand-steel/15 p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-semibold text-brand-slate mb-2">Store Logo</span>
                  {formData.logoUrl ? (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-brand-steel/30 mb-2 group">
                      <img src={formData.logoUrl} alt="Store logo" className="w-full h-full object-cover" />
                      <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-bold text-brand-cream cursor-pointer transition-opacity">
                        Replace
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, 'logoUrl')} />
                      </label>
                    </div>
                  ) : (
                    <label className="w-20 h-20 rounded-xl border border-dashed border-brand-steel/30 flex flex-col items-center justify-center cursor-pointer hover:border-brand-cream/40 transition-colors mb-2 bg-brand-dark/20">
                      {uploading.logo ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-brand-cream border-t-transparent"></div>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-brand-slate/75 mb-1" />
                          <span className="text-[10px] text-brand-slate/60">Upload</span>
                        </>
                      )}
                      <input type="file" accept="image/*" disabled={uploading.logo} className="hidden" onChange={(e) => handleUpload(e, 'logoUrl')} />
                    </label>
                  )}
                  <span className="text-[10px] text-brand-slate/50">Square PNG/JPG recommended</span>
                </div>

                {/* Banner Upload */}
                <div className="bg-brand-steel/5 rounded-2xl border border-brand-steel/15 p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-semibold text-brand-slate mb-2">Hero Banner</span>
                  {formData.heroBannerUrl ? (
                    <div className="relative w-full h-20 rounded-xl overflow-hidden border border-brand-steel/30 mb-2 group">
                      <img src={formData.heroBannerUrl} alt="Hero banner" className="w-full h-full object-cover" />
                      <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-bold text-brand-cream cursor-pointer transition-opacity">
                        Replace
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, 'heroBannerUrl')} />
                      </label>
                    </div>
                  ) : (
                    <label className="w-full h-20 rounded-xl border border-dashed border-brand-steel/30 flex flex-col items-center justify-center cursor-pointer hover:border-brand-cream/40 transition-colors mb-2 bg-brand-dark/20">
                      {uploading.banner ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-brand-cream border-t-transparent"></div>
                      ) : (
                        <>
                          <ImageIcon className="w-5 h-5 text-brand-slate/75 mb-1" />
                          <span className="text-[10px] text-brand-slate/60">Upload Banner</span>
                        </>
                      )}
                      <input type="file" accept="image/*" disabled={uploading.banner} className="hidden" onChange={(e) => handleUpload(e, 'heroBannerUrl')} />
                    </label>
                  )}
                  <span className="text-[10px] text-brand-slate/50">Landscape banner for home header</span>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="space-y-3">
                <span className="block text-xs font-bold text-brand-slate uppercase tracking-wider">Social Links (Optional)</span>
                
                <div className="relative">
                  <Facebook className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1877F2]/80" />
                  <input
                    type="url"
                    value={formData.facebookUrl}
                    onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-brand-dark/45 border border-brand-steel/20 rounded-xl text-brand-header outline-none focus:border-brand-cream transition-colors text-sm"
                    placeholder="https://facebook.com/amasboutique"
                  />
                </div>

                <div className="relative">
                  <Instagram className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E1306C]/80" />
                  <input
                    type="url"
                    value={formData.instagramUrl}
                    onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-brand-dark/45 border border-brand-steel/20 rounded-xl text-brand-header outline-none focus:border-brand-cream transition-colors text-sm"
                    placeholder="https://instagram.com/amasboutique"
                  />
                </div>
              </div>

              {/* Wizard Footer Controls */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 bg-brand-steel/15 hover:bg-brand-steel/25 text-brand-header font-bold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || uploading.logo || uploading.banner}
                  className="flex-[2] bg-brand-cream hover:bg-white text-brand-dark font-bold py-4 rounded-2xl transition-all shadow-lg shadow-brand-cream/5 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed text-sm hover:scale-[1.01] active:scale-[0.99]"
                >
                  {loading ? (
                    'Launching your store...'
                  ) : (
                    <>
                      Launch My Store
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  );
}
