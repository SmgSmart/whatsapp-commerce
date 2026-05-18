import { useNavigate } from 'react-router-dom';
import { Store } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Login() {
    const navigate = useNavigate();
    const { user } = useAuth();

    // If already logged in, go to admin
    if (user) {
        navigate('/admin');
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-10 border border-gray-100">
                <div className="flex flex-col items-center justify-center mb-10 text-center">
                    <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200 rotate-3">
                        <Store className="w-10 h-10 text-white -rotate-3" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h1>
                    <p className="text-gray-500 mt-3 text-lg">Manage your WhatsApp store with ease</p>
                </div>

                <button
                    onClick={() => {
                        const neonUrl = "https://ep-divine-grass-aqm5ypmq.neonauth.c-8.us-east-1.aws.neon.tech/neondb/auth/sign-in/social?provider=google&callbackURL=" + encodeURIComponent(window.location.origin + "/auth/success");
                        window.location.href = neonUrl;
                    }}
                    className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 rounded-xl border-2 border-gray-100 transition-all duration-200 flex items-center justify-center gap-3 shadow-sm hover:shadow-md active:scale-[0.98]"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                </button>

                <div className="mt-10 pt-8 border-t border-gray-50 flex items-center justify-center gap-8">
                    <button
                        onClick={() => navigate('/')}
                        className="text-sm font-semibold text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-2 group"
                    >
                        <Store className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Live Store
                    </button>
                </div>
            </div>
        </div>
    );
}
