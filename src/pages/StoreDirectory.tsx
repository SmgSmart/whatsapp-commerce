import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, MapPin, ExternalLink } from 'lucide-react';
import { publicApi } from '../lib/api';
import type { BusinessInfo } from '../lib/types';

export function StoreDirectory() {
  const [stores, setStores] = useState<BusinessInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStores() {
      try {
        const data = await publicApi.getAllStores();
        setStores(data);
      } catch (error) {
        console.error('Failed to fetch stores:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStores();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Store Directory</h1>
                <p className="text-sm text-gray-500 hidden sm:block">
                  Verified local stores on WhatsApp
                </p>
              </div>
            </div>
            
            <Link
              to="/admin/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-sm hover:shadow-indigo-100"
            >
              <ShoppingBag className="w-5 h-5" />
              Create Your Store
            </Link>
          </div>
        </div>
      </div>

      {/* Store Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {stores.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No stores found</h3>
            <p className="text-gray-500">Check back later for new stores.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {stores.map((store) => (
              <Link
                key={store.slug}
                to={`/store/${store.slug}`}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col"
              >
                {/* Store Hero/Logo Area */}
                <div className="relative h-48 bg-gray-100">
                  {store.hero_banner_url ? (
                    <img
                      src={store.hero_banner_url}
                      alt={store.business_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
                      <ShoppingBag className="w-12 h-12 text-indigo-200" />
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 flex items-center gap-3">
                    <div className="w-16 h-16 bg-white rounded-xl shadow-lg p-1 overflow-hidden border border-white">
                      {store.logo_url ? (
                        <img
                          src={store.logo_url}
                          alt={store.business_name}
                          className="w-full h-full object-contain rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full bg-indigo-600 flex items-center justify-center rounded-lg">
                          <span className="text-white font-bold text-xl">
                            {store.business_name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Store Info */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {store.business_name}
                    </h2>
                    <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                  </div>
                  
                  {store.tagline && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 italic">
                      "{store.tagline}"
                    </p>
                  )}

                  <div className="mt-auto pt-4 border-t border-gray-50 flex items-center gap-2 text-gray-500 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{store.location || 'Online Store'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} WhatsApp E-commerce Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
