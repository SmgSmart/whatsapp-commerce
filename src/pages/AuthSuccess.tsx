import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Store, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { adminApi } from '../lib/api';

export function AuthSuccess() {
    const navigate = useNavigate();
    const { loading: authLoading } = useAuth();
    const [loadingStoreCheck, setLoadingStoreCheck] = useState(false);

    const handleContinue = async () => {
        try {
            setLoadingStoreCheck(true);
            const stores = await adminApi.getMyStores();
            if (stores && stores.length > 0) {
                // Existing user — navigate straight to admin dashboard
                navigate('/admin');
            } else {
                // New user — navigate to store onboarding/creation page
                navigate('/admin/onboarding');
            }
        } catch (err) {
            console.error('Failed to load user stores during redirect check:', err);
            // Fallback to /admin
            navigate('/admin');
        } finally {
            setLoadingStoreCheck(false);
        }
    };

    const isInteractionDisabled = authLoading || loadingStoreCheck;

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.05)] p-12 border border-gray-100 text-center">
                <div className="flex justify-center mb-8">
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center animate-bounce-subtle">
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </div>
                </div>

                <h1 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">
                    Account Ready!
                </h1>
                
                <p className="text-gray-500 text-lg mb-10 leading-relaxed">
                    Your account is verified. Click continue to enter your dashboard and start managing your store.
                </p>

                <div className="space-y-4">
                    <button
                        onClick={handleContinue}
                        disabled={isInteractionDisabled}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-5 rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-blue-200 active:scale-[0.98] disabled:cursor-not-allowed"
                    >
                        {isInteractionDisabled ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                Continue to Dashboard
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        disabled={isInteractionDisabled}
                        className="w-full bg-white hover:bg-gray-50 disabled:hover:bg-white text-gray-500 font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Store className="w-4 h-4" />
                        Back to Store
                    </button>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-50">
                    <p className="text-sm text-gray-400">
                        Welcome to the future of WhatsApp Commerce.
                    </p>
                </div>
            </div>
        </div>
    );
}

// Add some custom animation to the icon
const style = document.createElement('style');
style.textContent = `
    @keyframes bounce-subtle {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
    .animate-bounce-subtle {
        animation: bounce-subtle 3s ease-in-out infinite;
    }
`;
document.head.appendChild(style);
