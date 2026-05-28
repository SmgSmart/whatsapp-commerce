import { useState, useRef, useEffect } from 'react';
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

    const [showOtp, setShowOtp] = useState(false);
    const [otp, setOtp] = useState('');
    // useRef updates synchronously — prevents the redirect guard from firing
    // during the render cycle immediately after signUp creates a session
    const awaitingOtp = useRef(false);

    // Only auto-redirect to admin if we are fully verified
    useEffect(() => {
        if (user) {
            if (user.emailVerified) {
                if (!awaitingOtp.current) {
                    navigate('/admin');
                }
            } else {
                // User has an unverified session (e.g., from signup or page refresh)
                // Fill in their email and display the OTP screen automatically.
                if (user.email) {
                    setEmail(user.email);
                }
                setShowOtp(true);
                awaitingOtp.current = true;
            }
        }
    }, [user, navigate]);

    const [resendCountdown, setResendCountdown] = useState(0);
    const [resendLoading, setResendLoading] = useState(false);

    useEffect(() => {
        if (resendCountdown <= 0) return;
        const timer = setTimeout(() => {
            setResendCountdown(prev => prev - 1);
        }, 1000);
        return () => clearTimeout(timer);
    }, [resendCountdown]);

    const handleResendOtp = async () => {
        if (resendCountdown > 0 || resendLoading) return;
        setError('');
        setResendLoading(true);
        try {
            await (authClient as any).sendVerificationOtp({ email, type: 'email-verification' });
            setResendCountdown(60);
        } catch (err: any) {
            console.error('Error resending OTP:', err);
            setError(err.message || 'Failed to resend verification code.');
        } finally {
            setResendLoading(false);
        }
    };

    const handleManualAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isSignUp) {
                // Set this synchronously BEFORE the API call to guarantee the redirect guard
                // is active when Neon sets the session cookie and updates the session store.
                awaitingOtp.current = true;

                const { error: signUpError } = await authClient.signUp.email({
                    email,
                    password,
                    name,
                });
                if (signUpError) {
                    awaitingOtp.current = false; // Reset if signup failed
                    throw new Error(signUpError.message || 'Sign up failed');
                }
                
                setShowOtp(true);
            } else {
                const { error: signInError } = await authClient.signIn.email({
                    email,
                    password,
                });
                
                if (signInError) {
                    // Check if it's an unverified email error
                    if (signInError.code === 'EMAIL_NOT_VERIFIED' || signInError.message?.toLowerCase().includes('not verified')) {
                        // Set the ref to block redirects
                        awaitingOtp.current = true;
                        // Resend the OTP to be safe
                        await (authClient as any).sendVerificationOtp({ email, type: 'email-verification' });
                        setShowOtp(true);
                        return;
                    }
                    throw new Error(signInError.message || 'Invalid email or password');
                }
                
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

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // The @neondatabase/auth types are outdated; verifyEmail({ email, otp }) works at runtime
            const { error: verifyError } = await (authClient as any).verifyEmail({ email, otp });
            if (verifyError) throw new Error(verifyError.message || 'Invalid verification code');

            // Clear the OTP guard so future redirects work normally
            awaitingOtp.current = false;
            // Success! Navigate to the "Account Ready" page
            navigate('/auth/success');
        } catch (err: any) {
            console.error('OTP Verification error:', err);
            setError(err.message || 'An error occurred while verifying the code.');
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
                        {showOtp ? 'Check your email' : isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h1>
                    <p className="text-gray-500 mt-2 text-md">
                        {showOtp ? `We sent a code to ${email}` : isSignUp ? 'Start building your WhatsApp store' : 'Manage your WhatsApp store with ease'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl font-medium text-center">
                        {error}
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {!showOtp ? (
                        <motion.form 
                            key="auth-form"
                            onSubmit={handleManualAuth} 
                            className="space-y-4 mb-6"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
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
                        </motion.form>
                    ) : (
                        <motion.form
                            key="otp-form"
                            onSubmit={handleVerifyOtp}
                            className="space-y-4 mb-6"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700 leading-relaxed text-center">
                                If you don't see the email, please check your <strong>Spam</strong> or <strong>Junk</strong> folder.
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 text-center">6-Digit Code</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    maxLength={6}
                                    placeholder="000000"
                                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 text-center text-3xl tracking-widest font-bold font-mono"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.length < 6}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-md shadow-blue-200 active:scale-[0.98] flex items-center justify-center disabled:opacity-70 disabled:active:scale-100 mt-4"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    'Verify Email'
                                )}
                            </button>
                            
                             <div className="text-center mt-4 flex flex-col items-center gap-3">
                                <button
                                    type="button"
                                    disabled={resendCountdown > 0 || resendLoading}
                                    onClick={handleResendOtp}
                                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:text-gray-400 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                                >
                                    {resendLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    {resendCountdown > 0 ? `Resend Code (${resendCountdown}s)` : 'Resend Code'}
                                </button>

                                <button
                                    type="button"
                                    onClick={async () => {
                                        awaitingOtp.current = false;
                                        setShowOtp(false);
                                        try {
                                            await authClient.signOut();
                                        } catch (e) {
                                            console.error('Error signing out on back:', e);
                                        }
                                    }}
                                    className="text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    Back to login
                                </button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                {!showOtp && (
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
                )}
            </motion.div>
        </div>
    );
}
