import { Navigate, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { adminApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard,
    Package,
    Tags,
    Settings,
    LogOut,
    Store,
    Eye,
    UserCircle
} from 'lucide-react';

export function AdminLayout() {
    const { user, loading, signOut } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/admin/login', { replace: true });
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const [checkingStore, setCheckingStore] = useState(true);
    const [storeSlug, setStoreSlug] = useState<string | null>(null);

    useEffect(() => {
        const checkStoreStatus = async () => {
            if (!user) {
                setCheckingStore(false);
                return;
            }

            // Skip check if already on onboarding page
            if (location.pathname === '/admin/onboarding') {
                setCheckingStore(false);
                return;
            }

            try {
                const stores = await adminApi.getMyStores();
                if (!stores || stores.length === 0) {
                    console.log('No stores found, redirecting to onboarding...');
                    navigate('/admin/onboarding', { replace: true });
                } else {
                    setStoreSlug(stores[0].slug || null);
                }
            } catch (error: any) {
                console.error('Error checking store status:', error);
                // If it's a 401, let the Auth check handle it later
            } finally {
                setCheckingStore(false);
            }
        };

        checkStoreStatus();
    }, [user, location.pathname, navigate]);

    if (loading || checkingStore) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user || !user.emailVerified) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Products', href: '/admin/products', icon: Package },
        { name: 'Categories', href: '/admin/categories', icon: Tags },
        { name: 'Store Settings', href: '/admin/settings', icon: Settings },
        { name: 'Account', href: '/admin/account', icon: UserCircle },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
                <div className="h-16 flex items-center px-6 border-b border-gray-200">
                    <Store className="w-6 h-6 text-blue-600 mr-2" />
                    <span className="text-xl font-bold text-gray-900">Admin</span>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon
                                    className={`flex-shrink-0 -ml-1 mr-3 h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-400'
                                        }`}
                                />
                                <span className="truncate">{item.name}</span>
                            </Link>
                        );
                    })}

                    <div className="pt-4 mt-4 border-t border-gray-100">
                        <Link
                            to={storeSlug ? `/store/${storeSlug}` : '/'}
                            className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                        >
                            <Eye className="flex-shrink-0 -ml-1 mr-3 h-5 w-5 text-gray-400" />
                            <span>View Store</span>
                        </Link>
                    </div>
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                    >
                        <LogOut className="flex-shrink-0 -ml-1 mr-3 h-5 w-5 text-gray-400 group-hover:text-red-500" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-100 pb-[90px] md:pb-0">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-20">
                    <div className="flex items-center">
                        <Store className="w-6 h-6 text-blue-600 mr-2" />
                        <span className="text-lg font-bold">Admin</span>
                    </div>

                    <Link
                        to={storeSlug ? `/store/${storeSlug}` : '/'}
                        className="flex items-center gap-1.5 text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                        <Eye className="w-4 h-4" />
                        <span>View Store</span>
                    </Link>
                </div>

                <div className="flex-1 overflow-auto">
                    <Outlet />
                </div>

                {/* Mobile Navigation Bar */}
                <div
                    className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-between items-center px-2 pt-2 pb-6 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
                    style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
                >
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex flex-col items-center p-2 rounded-lg min-w-[64px] ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon className={`h-6 w-6 mb-1 ${isActive ? 'text-blue-600' : ''}`} />
                                <span className="text-[10px] font-medium text-center leading-none">{item.name}</span>
                            </Link>
                        );
                    })}
                    <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex flex-col items-center p-2 rounded-lg min-w-[64px] text-red-500 hover:text-red-700 cursor-pointer active:bg-red-50"
                    >
                        <LogOut className="h-6 w-6 mb-1 text-red-500" />
                        <span className="text-[10px] font-medium text-center leading-none">Sign Out</span>
                    </button>
                </div>
            </main>
        </div>
    );
}
