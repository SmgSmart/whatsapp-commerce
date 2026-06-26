import { useState, useEffect } from 'react';
import { adminApi } from '../../lib/api';
import { Save, Upload } from 'lucide-react';
import { useStorage } from '../../hooks/useStorage';

export function BusinessSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState<{ logo: boolean; banner: boolean }>({ logo: false, banner: false });
    const { uploadFile } = useStorage();
    const [formData, setFormData] = useState({
        business_name: '',
        whatsapp_number: '',
        tagline: '',
        logo_url: '',
        hero_banner_url: '',
        location: '',
        facebook_url: '',
        instagram_url: '',
    });

    useEffect(() => {
        loadBusinessInfo();
    }, []);

    async function loadBusinessInfo() {
        try {
            const data = await adminApi.getBusinessInfo();

            if (data) {
                setFormData({
                    business_name: data.business_name || '',
                    whatsapp_number: data.whatsapp_number || '',
                    tagline: data.tagline || '',
                    logo_url: data.logo_url || '',
                    hero_banner_url: data.hero_banner_url || '',
                    location: data.location || '',
                    facebook_url: data.facebook_url || '',
                    instagram_url: data.instagram_url || '',
                });
            }
        } catch (error) {
            console.error('Error loading business info:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            await adminApi.saveBusinessInfo(formData);

            alert('Settings saved successfully!');
        } catch (error) {
            console.error('Error saving business info:', error);
            alert('Failed to save settings. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo_url' | 'hero_banner_url') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const storageKey = type === 'logo_url' ? 'logo' : 'banner';
        setUploading(prev => ({ ...prev, [storageKey]: true }));

        const url = await uploadFile(file, 'branding');
        if (url) {
            setFormData(prev => ({ ...prev, [type]: url }));
        }
        setUploading(prev => ({ ...prev, [storageKey]: false }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-dark">
                <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-brand-steel/20 border-b-brand-cream"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-brand-header">Store Settings</h1>
                <p className="text-brand-slate mt-1">Manage your business information and appearance</p>
            </div>

            <div className="bg-brand-steel/10 rounded-3xl border border-brand-steel/15 overflow-hidden backdrop-blur-md">
                <form onSubmit={handleSave} className="p-6 md:p-8">

                    <div className="space-y-8">
                        {/* Basic Info Section */}
                        <div>
                            <h2 className="text-lg font-bold text-brand-header mb-4 pb-2 border-b border-brand-steel/15">Basic Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-brand-slate mb-1.5">Business Name *</label>
                                    <input
                                        type="text"
                                        name="business_name"
                                        required
                                        value={formData.business_name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-brand-dark/45 border border-brand-steel/20 text-brand-header rounded-xl focus:ring-2 focus:ring-brand-cream focus:border-brand-cream outline-none"
                                        placeholder="My Awesome Store"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-brand-slate mb-1.5">WhatsApp Number *</label>
                                    <input
                                        type="text"
                                        name="whatsapp_number"
                                        required
                                        value={formData.whatsapp_number}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-brand-dark/45 border border-brand-steel/20 text-brand-header rounded-xl focus:ring-2 focus:ring-brand-cream focus:border-brand-cream outline-none"
                                        placeholder="+1234567890"
                                    />
                                    <p className="text-xs text-brand-slate/75 mt-1.5">Include country code. Used for receiving orders.</p>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-brand-slate mb-1.5">Tagline / Slogan</label>
                                    <input
                                        type="text"
                                        name="tagline"
                                        value={formData.tagline}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-brand-dark/45 border border-brand-steel/20 text-brand-header rounded-xl focus:ring-2 focus:ring-brand-cream focus:border-brand-cream outline-none"
                                        placeholder="The best products in town!"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Branding Section */}
                        <div>
                            <h2 className="text-lg font-bold text-brand-header mb-4 pb-2 border-b border-brand-steel/15">Branding</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-brand-slate mb-1.5">Store Logo</label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleUpload(e, 'logo_url')}
                                            className="hidden"
                                            id="logo-upload"
                                        />
                                        <label
                                            htmlFor="logo-upload"
                                            className="w-full px-4 py-3 bg-brand-steel/10 text-brand-cream rounded-xl hover:bg-brand-steel/20 cursor-pointer flex items-center justify-center gap-2 border-2 border-dashed border-brand-steel/20 font-bold transition-all"
                                        >
                                            <Upload size={20} />
                                            {uploading.logo ? 'Uploading...' : 'Upload Logo'}
                                        </label>
                                    </div>
                                    {formData.logo_url && (
                                        <div className="mt-4 w-20 h-20 rounded-xl border border-brand-steel/20 overflow-hidden bg-brand-dark/45 relative flex items-center justify-center">
                                            {uploading.logo && (
                                                <div className="absolute inset-0 bg-brand-dark/60 flex items-center justify-center z-10 backdrop-blur-[1px]">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-cream"></div>
                                                </div>
                                            )}
                                            <img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain p-1" />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-brand-slate mb-1.5">Hero Banner Image</label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleUpload(e, 'hero_banner_url')}
                                            className="hidden"
                                            id="banner-upload"
                                        />
                                        <label
                                            htmlFor="banner-upload"
                                            className="w-full px-4 py-3 bg-brand-steel/10 text-brand-cream rounded-xl hover:bg-brand-steel/20 cursor-pointer flex items-center justify-center gap-2 border-2 border-dashed border-brand-steel/20 font-bold transition-all"
                                        >
                                            <Upload size={20} />
                                            {uploading.banner ? 'Uploading...' : 'Upload Hero Banner'}
                                        </label>
                                    </div>
                                    <p className="text-xs text-brand-slate/75 mt-2">This image appears at the top of your store home page.</p>
                                    {formData.hero_banner_url && (
                                        <div className="mt-4 w-full h-36 rounded-xl border border-brand-steel/20 overflow-hidden bg-brand-dark/45 relative">
                                            {uploading.banner && (
                                                <div className="absolute inset-0 bg-brand-dark/60 flex items-center justify-center z-10 backdrop-blur-[1px]">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-cream"></div>
                                                </div>
                                            )}
                                            <img src={formData.hero_banner_url} alt="Banner" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Contact & Social Section */}
                        <div>
                            <h2 className="text-lg font-bold text-brand-header mb-4 pb-2 border-b border-brand-steel/15">Location & Social Links</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-brand-slate mb-1.5">Store Location</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-brand-dark/45 border border-brand-steel/20 text-brand-header rounded-xl focus:ring-2 focus:ring-brand-cream focus:border-brand-cream outline-none"
                                        placeholder="Accra, Ghana"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-brand-slate mb-1.5">Facebook Page URL</label>
                                    <input
                                        type="url"
                                        name="facebook_url"
                                        value={formData.facebook_url}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-brand-dark/45 border border-brand-steel/20 text-brand-header rounded-xl focus:ring-2 focus:ring-brand-cream focus:border-brand-cream outline-none"
                                        placeholder="https://facebook.com/yourstore"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-brand-slate mb-1.5">Instagram Profile URL</label>
                                    <input
                                        type="url"
                                        name="instagram_url"
                                        value={formData.instagram_url}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-brand-dark/45 border border-brand-steel/20 text-brand-header rounded-xl focus:ring-2 focus:ring-brand-cream focus:border-brand-cream outline-none"
                                        placeholder="https://instagram.com/yourstore"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-brand-steel/15 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-brand-cream hover:bg-white disabled:bg-brand-cream/50 text-brand-dark px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-brand-cream/5 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Save size={20} className="text-brand-dark" />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
