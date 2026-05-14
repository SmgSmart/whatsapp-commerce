import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { signIn } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await signIn(email, password);
            navigate('/admin');
        } catch (err: any) {
            setError(err.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
                <div className="flex flex-col items-center justify-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <Store className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-500 mt-2">Sign in to manage your store</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="admin@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Don't have a store yet?{' '}
                        <a 
                            href={import.meta.env.VITE_NEON_AUTH_URL} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:text-blue-500"
                        >
                            Sign up now
                        </a>
                    </p>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                        <Store className="w-4 h-4" />
                        Back to Store
                    </button>
                </div>
            </div>
        </div>
    );
}
