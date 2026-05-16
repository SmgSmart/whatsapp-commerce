import { useNavigate } from 'react-router-dom';
import { Store } from 'lucide-react';
import { AuthView } from '@neondatabase/auth-ui';
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

                <AuthView 
                    callbackURL={window.location.origin + "/auth/success"}
                    redirectTo={window.location.origin + "/auth/success"}
                />

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
