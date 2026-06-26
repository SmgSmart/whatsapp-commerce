import { Navigate, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useStore } from '../../contexts/StoreContext';
import { ThemeToggle } from '../ThemeToggle';
import {
    LayoutDashboard,
    Package,
    Tags,
    Settings,
    LogOut,
    Store,
    Eye,
    UserCircle,
    CreditCard,
    ShieldAlert
} from 'lucide-react';

export function AdminLayout() {
    const { user, loading: authLoading, signOut } = useAuth();
    const { store, stores, loading: storeLoading, isSubscriptionActive, daysLeftOfTrial, subscriptionStatus } = useStore();
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

    // Redirect to onboarding if the authenticated user has no stores yet
    useEffect(() => {
        if (!user || authLoading || storeLoading) return;
        if (location.pathname === '/admin/onboarding') return;

        if (stores.length === 0) {
            navigate('/admin/onboarding', { replace: true });
        }
    }, [user, authLoading, storeLoading, stores.length, location.pathname, navigate]);

    const loading = authLoading || storeLoading;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-dark">
                <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-brand-steel/20 border-b-brand-cream"></div>
                </div>
            </div>
        );
    }

    if (!user || !user.emailVerified) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    const storeSlug = store?.slug ?? null;

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Products', href: '/admin/products', icon: Package },
        { name: 'Categories', href: '/admin/categories', icon: Tags },
        { name: 'Store Settings', href: '/admin/settings', icon: Settings },
        { name: 'Billing & Plan', href: '/admin/billing', icon: CreditCard },
        { name: 'Account', href: '/admin/account', icon: UserCircle },
    ];

    const showPaywall = !isSubscriptionActive && 
                        location.pathname !== '/admin/billing' && 
                        location.pathname !== '/admin/onboarding' && 
                        stores.length > 0;

    return (
        <div className="min-h-screen bg-brand-dark flex text-brand-gray">
            {/* Sidebar */}
            <aside className="w-64 bg-brand-dark/95 border-r border-brand-steel/20 flex flex-col hidden md:flex backdrop-blur-md">
                <div className="h-16 flex items-center px-6 border-b border-brand-steel/15 bg-brand-dark/20">
                    <Store className="w-6 h-6 text-brand-cream mr-2" />
                    <span className="text-xl font-bold text-brand-header">Admin</span>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center justify-between px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors ${isActive
                                    ? 'bg-brand-cream text-brand-dark shadow-sm shadow-brand-cream/10'
                                    : 'text-brand-slate hover:bg-brand-steel/20 hover:text-brand-header'
                                    }`}
                            >
                                <div className="flex items-center truncate">
                                    <item.icon
                                        className={`flex-shrink-0 -ml-1 mr-3 h-5 w-5 ${isActive ? 'text-brand-dark' : 'text-brand-slate'
                                            }`}
                                    />
                                    <span className="truncate">{item.name}</span>
                                </div>
                                {item.name === 'Billing & Plan' && subscriptionStatus === 'trialing' && daysLeftOfTrial > 0 && (
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive
                                        ? 'bg-brand-dark/20 text-brand-dark'
                                        : 'bg-brand-cream/10 text-brand-cream border border-brand-cream/20'
                                        }`}>
                                        {daysLeftOfTrial}d left
                                    </span>
                                )}
                            </Link>
                        );
                    })}

                    <div className="pt-4 mt-4 border-t border-brand-steel/15">
                        <Link
                            to={storeSlug ? `/store/${storeSlug}` : '/'}
                            className="flex items-center px-3 py-2.5 text-sm font-semibold rounded-lg text-brand-slate hover:bg-brand-steel/20 hover:text-brand-header transition-colors"
                        >
                            <Eye className="flex-shrink-0 -ml-1 mr-3 h-5 w-5 text-brand-slate" />
                            <span>View Store</span>
                        </Link>
                    </div>
                </nav>

                <div className="p-4 border-t border-brand-steel/15 flex items-center justify-between gap-4">
                    <ThemeToggle />
                    <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex items-center justify-center flex-1 px-3 py-2 text-sm font-semibold text-brand-slate rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer"
                    >
                        <LogOut className="flex-shrink-0 -ml-1 mr-3 h-5 w-5 text-brand-slate hover:text-red-400" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-brand-dark pb-[90px] md:pb-0">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between bg-brand-dark/95 border-b border-brand-steel/20 px-4 py-3 sticky top-0 z-20 backdrop-blur-md">
                    <div className="flex items-center">
                        <Store className="w-6 h-6 text-brand-cream mr-2" />
                        <span className="text-lg font-bold text-brand-header">Admin</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <Link
                            to={storeSlug ? `/store/${storeSlug}` : '/'}
                            className="flex items-center gap-1.5 text-sm font-semibold text-brand-header bg-brand-steel/25 px-3 py-1.5 rounded-full border border-brand-steel/30 hover:bg-brand-steel/40 transition-colors"
                        >
                            <Eye className="w-4 h-4 text-brand-cream" />
                            <span>View Store</span>
                        </Link>
                    </div>
                </div>

                <div className="flex-1 overflow-auto bg-brand-dark">
                    {showPaywall ? (
                        <div className="min-h-[80vh] flex items-center justify-center p-6 md:p-8">
                            <div className="bg-brand-steel/10 rounded-3xl border border-brand-steel/15 p-8 max-w-lg w-full text-center backdrop-blur-md shadow-2xl">
                                <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <ShieldAlert className="w-8 h-8" />
                                </div>
                                <h2 className="text-2xl font-extrabold text-brand-header tracking-tight font-display mb-3">Subscription Required</h2>
                                <p className="text-brand-slate text-sm leading-relaxed mb-8">
                                    Your store's trial or premium subscription has ended. To continue managing products, viewing orders, and accepting WhatsApp checkout routes, please update your billing.
                                </p>
                                <button
                                    onClick={() => navigate('/admin/billing')}
                                    className="w-full py-4 bg-gradient-to-r from-brand-cream to-brand-cream/90 hover:from-brand-cream/95 hover:to-brand-cream text-brand-dark font-extrabold rounded-2xl transition duration-200 shadow-lg shadow-brand-cream/10"
                                >
                                    Activate Professional Plan
                                </button>
                            </div>
                        </div>
                    ) : (
                        <Outlet />
                    )}
                </div>

                {/* Mobile Navigation Bar */}
                <div
                    className="md:hidden fixed bottom-0 left-0 right-0 bg-brand-dark/95 border-t border-brand-steel/20 flex justify-between items-center px-2 pt-2 pb-6 z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.4)] backdrop-blur-md"
                    style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
                >
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex flex-col items-center p-2 rounded-lg min-w-[64px] ${isActive ? 'text-brand-cream font-bold' : 'text-brand-slate hover:text-brand-header'
                                    }`}
                            >
                                <item.icon className={`h-6 w-6 mb-1 ${isActive ? 'text-brand-cream' : ''}`} />
                                <span className="text-[10px] font-semibold text-center leading-none">{item.name}</span>
                            </Link>
                        );
                    })}
                    <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex flex-col items-center p-2 rounded-lg min-w-[64px] text-red-400 hover:text-red-300 cursor-pointer active:bg-red-500/10"
                    >
                        <LogOut className="h-6 w-6 mb-1 text-red-400" />
                        <span className="text-[10px] font-semibold text-center leading-none">Sign Out</span>
                    </button>
                </div>
            </main>
        </div>
    );
}
