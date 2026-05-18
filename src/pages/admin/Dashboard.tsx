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
            <div className="p-8">
                <div className="animate-pulse flex space-x-4">
                    <div className="h-32 bg-gray-200 rounded-xl w-1/4"></div>
                    <div className="h-32 bg-gray-200 rounded-xl w-1/4"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="mb-10">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
                <p className="text-gray-500 mt-2 text-lg font-medium">Manage and monitor your store performance</p>
            </div>

            {/* Store URL Card */}
            <div className="mb-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:opacity-10 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Store className="w-5 h-5 text-blue-200" />
                                <span className="text-blue-100 font-semibold tracking-wider text-sm uppercase">Your Live Store</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold mb-4">{store?.business_name}</h2>
                            
                            <div className="flex items-center bg-white/10 backdrop-blur-md rounded-2xl p-2 pl-4 border border-white/20 max-w-xl group/link hover:bg-white/20 transition-all cursor-pointer" onClick={copyToClipboard}>
                                <span className="text-sm md:text-base font-medium truncate mr-4 text-blue-50">{storeUrl}</span>
                                <button className="ml-auto bg-white text-blue-700 p-2.5 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all">
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <a 
                                href={storeUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-white text-blue-700 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-lg active:scale-95"
                            >
                                <ExternalLink className="w-5 h-5" />
                                View Store
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-gray-100 p-8 flex items-center hover:shadow-xl transition-shadow group">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform">
                        <Package className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Products</p>
                        <p className="text-3xl font-black text-gray-900">{stats.products}</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-gray-100 p-8 flex items-center hover:shadow-xl transition-shadow group">
                    <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform">
                        <Tags className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Categories</p>
                        <p className="text-3xl font-black text-gray-900">{stats.categories}</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-gray-100 p-8 flex items-center hover:shadow-xl transition-shadow group">
                    <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform">
                        <Store className="w-8 h-8 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Store Status</p>
                        <p className="text-3xl font-black text-gray-900">Active</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
