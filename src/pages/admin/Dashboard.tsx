import { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { Package, Tags, Store, ExternalLink, Copy, Check } from 'lucide-react';
import type { BusinessInfo } from '../../lib/types';

export function Dashboard() {
    const [stats, setStats] = useState({
        products: 0,
        categories: 0,
    });
    const [store, setStore] = useState<BusinessInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        async function loadData() {
            try {
                const [statsData, storeData] = await Promise.all([
                    adminApi.getDashboardStats(),
                    adminApi.getBusinessInfo()
                ]);
                setStats(statsData);
                setStore(storeData);
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    const storeUrl = store ? `${window.location.origin}/store/${store.slug}` : '';

    const copyToClipboard = () => {
        navigator.clipboard.writeText(storeUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
                <div className="animate-pulse space-y-6">
                    <div className="h-10 bg-brand-steel/10 rounded-lg w-1/4"></div>
                    <div className="h-56 sm:h-48 bg-brand-steel/10 rounded-3xl w-full"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        <div className="h-24 sm:h-32 bg-brand-steel/10 rounded-3xl"></div>
                        <div className="h-24 sm:h-32 bg-brand-steel/10 rounded-3xl"></div>
                        <div className="h-24 sm:h-32 bg-brand-steel/10 rounded-3xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto min-h-full">
            <div className="mb-6 sm:mb-8 md:mb-10">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Dashboard</h1>
                <p className="text-brand-slate mt-1.5 text-base sm:text-lg font-medium">Manage and monitor your store performance</p>
            </div>

            {/* Store URL Card */}
            <div className="mb-6 sm:mb-8 md:mb-10 bg-gradient-to-br from-[#4B6382]/20 via-[#071739]/80 to-[#4B6382]/10 rounded-3xl p-5 sm:p-6 md:p-8 text-white border border-brand-steel/20 shadow-2xl relative overflow-hidden group backdrop-blur-md">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cream opacity-5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:opacity-10 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <Store className="w-5 h-5 text-brand-cream" />
                                <span className="text-brand-cream/80 font-bold tracking-wider text-xs uppercase">Your Live Store</span>
                            </div>
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 text-white truncate">{store?.business_name}</h2>
                            
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-brand-dark/45 border border-brand-steel/20 rounded-2xl p-1.5 gap-2 max-w-xl group/link hover:bg-brand-dark/70 hover:border-brand-steel/30 transition-all">
                                <div className="flex-1 px-3 py-2 sm:py-0 min-w-0 overflow-hidden flex items-center cursor-pointer" onClick={copyToClipboard}>
                                    <span className="text-xs sm:text-sm font-medium truncate text-brand-slate group-hover/link:text-white transition-colors">{storeUrl}</span>
                                </div>
                                <button 
                                    onClick={copyToClipboard}
                                    className="bg-brand-cream text-brand-dark px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all text-xs sm:text-sm flex-shrink-0"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-3.5 h-3.5" />
                                            <span>Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3.5 h-3.5" />
                                            <span>Copy Link</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center lg:self-end w-full sm:w-auto">
                            <a 
                                href={storeUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto bg-brand-cream text-brand-dark px-5 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white transition-all shadow-lg shadow-brand-cream/10 active:scale-[0.98] text-sm sm:text-base"
                            >
                                <ExternalLink className="w-4 h-4" />
                                <span>View Live Store</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-brand-steel/10 rounded-3xl border border-brand-steel/15 p-5 sm:p-6 lg:p-8 flex items-center hover:border-brand-steel/30 transition-all group backdrop-blur-sm">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-brand-steel/20 rounded-2xl flex items-center justify-center mr-4 sm:mr-6 group-hover:scale-110 transition-transform flex-shrink-0">
                        <Package className="w-6 h-6 sm:w-8 sm:h-8 text-brand-cream" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-brand-slate uppercase tracking-wider mb-1 truncate">Total Products</p>
                        <p className="text-2xl sm:text-3xl font-black text-white">{stats.products}</p>
                    </div>
                </div>

                <div className="bg-brand-steel/10 rounded-3xl border border-brand-steel/15 p-5 sm:p-6 lg:p-8 flex items-center hover:border-brand-steel/30 transition-all group backdrop-blur-sm">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-brand-steel/20 rounded-2xl flex items-center justify-center mr-4 sm:mr-6 group-hover:scale-110 transition-transform flex-shrink-0">
                        <Tags className="w-6 h-6 sm:w-8 sm:h-8 text-brand-cream" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-brand-slate uppercase tracking-wider mb-1 truncate">Categories</p>
                        <p className="text-2xl sm:text-3xl font-black text-white">{stats.categories}</p>
                    </div>
                </div>

                <div className="bg-brand-steel/10 rounded-3xl border border-brand-steel/15 p-5 sm:p-6 lg:p-8 flex items-center hover:border-brand-steel/30 transition-all group backdrop-blur-sm">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-brand-steel/20 rounded-2xl flex items-center justify-center mr-4 sm:mr-6 group-hover:scale-110 transition-transform flex-shrink-0">
                        <Store className="w-6 h-6 sm:w-8 sm:h-8 text-brand-cream" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-brand-slate uppercase tracking-wider mb-1 truncate">Store Status</p>
                        <p className="text-2xl sm:text-3xl font-black text-emerald-400">Active</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
