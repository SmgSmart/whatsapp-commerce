import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Store, Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authClient } from '../../lib/auth-client';

export function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const [isSignUp, setIsSignUp] = useState(location.pathname === '/admin/signup');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // If already logged in, go to admin
    if (user) {
        navigate('/admin');
    }

    const handleManualAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isSignUp) {
                const { error: signUpError } = await authClient.signUp.email({
                    email,
                    password,
                    name,
                });
                if (signUpError) throw new Error(signUpError.message || 'Sign up failed');
                
                // AuthContext will catch the session update automatically
            } else {
                const { error: signInError } = await authClient.signIn.email({
                    email,
                    password,
                });
                if (signInError) throw new Error(signInError.message || 'Invalid email or password');
                
                // AuthContext will catch the session update automatically
            }
        } catch (err: any) {
            console.error('Authentication error:', err);
            setError(err.message || 'An error occurred during authentication.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-10 border border-gray-100">
                <div className="flex flex-col items-center justify-center mb-8 text-center">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200 rotate-3">
                        <Store className="w-8 h-8 text-white -rotate-3" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h1>
                    <p className="text-gray-500 mt-2 text-md">
                        {isSignUp ? 'Start building your WhatsApp store' : 'Manage your WhatsApp store with ease'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl font-medium text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleManualAuth} className="space-y-4 mb-6">
                    {isSignUp && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <UserIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required={isSignUp}
                                    placeholder="John Doe"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="you@example.com"
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={8}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-md shadow-blue-200 active:scale-[0.98] flex items-center justify-center disabled:opacity-70 disabled:active:scale-100 mt-2"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            isSignUp ? 'Create Account' : 'Sign In'
                        )}
                    </button>
                </form>

                <div className="relative flex items-center py-2 mb-6">
                    <div className="flex-grow border-t border-gray-100"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">Or continue with</span>
                    <div className="flex-grow border-t border-gray-100"></div>
                </div>

                <button
                    type="button"
                    onClick={async () => {
                        try {
                            const response = await fetch("https://ep-divine-grass-aqm5ypmq.neonauth.c-8.us-east-1.aws.neon.tech/neondb/auth/sign-in/social", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    provider: "google",
                                    callbackURL: window.location.origin + "/auth/success"
                                }),
                                credentials: "omit"
                            });
                            const data = await response.json();
                            if (data?.url) {
                                window.location.href = data.url;
                            } else {
                                console.error("No redirect URL returned:", data);
                            }
                        } catch (err) {
                            console.error("Google sign in failed:", err);
                        }
                    }}
                    className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3.5 rounded-xl border-2 border-gray-100 transition-all duration-200 flex items-center justify-center gap-3 shadow-sm hover:shadow-md active:scale-[0.98]"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                </button>

                <div className="mt-8 pt-6 border-t border-gray-50 text-center">
                    <p className="text-sm text-gray-500 mb-4">
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <button
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError('');
                            }}
                            className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                        >
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </button>
                    </p>
                    
                    <button
                        onClick={() => navigate('/')}
                        className="text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors inline-flex items-center gap-2 group"
                    >
                        <Store className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Return to Directory
                    </button>
                </div>
            </div>
        </div>
    );
}
