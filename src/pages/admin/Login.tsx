import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Store, Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
                
                // Account created successfully! Redirect to the success intermediary page
                navigate('/auth/success');
            } else {
                const { error: signInError } = await authClient.signIn.email({
                    email,
                    password,
                });
                if (signInError) throw new Error(signInError.message || 'Invalid email or password');
                
                // AuthContext will catch the session update automatically
                // Navigate directly to admin
                navigate('/admin');
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
            <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full max-w-md bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-10 border border-gray-100"
            >
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
                    <AnimatePresence mode="popLayout">
                        {isSignUp && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                animate={{ opacity: 1, height: "auto", scale: 1 }}
                                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                            >
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 mt-1">Full Name</label>
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
                            </motion.div>
                        )}
                    </AnimatePresence>

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
            </motion.div>
        </div>
    );
}
