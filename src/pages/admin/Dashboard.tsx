import { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { Package, Tags, Store } from 'lucide-react';

export function Dashboard() {
    const [stats, setStats] = useState({
        products: 0,
        categories: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            try {
                const data = await adminApi.getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error('Error loading stats:', error);
            } finally {
                setLoading(false);
            }
        }

        loadStats();
    }, []);

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
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
                <p className="text-gray-500 mt-1">Here is an overview of your store.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
                    <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center mr-4">
                        <Package className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Products</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.products}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
                    <div className="w-14 h-14 bg-green-50 rounded-lg flex items-center justify-center mr-4">
                        <Tags className="w-7 h-7 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Categories</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.categories}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
                    <div className="w-14 h-14 bg-purple-50 rounded-lg flex items-center justify-center mr-4">
                        <Store className="w-7 h-7 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Store Status</p>
                        <p className="text-2xl font-bold text-gray-900 line-clamp-1">Active</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
