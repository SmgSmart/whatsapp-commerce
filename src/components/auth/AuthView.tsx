import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function AuthView() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleGoogleSignIn();
  };

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-bronze to-brand-cream rounded-2xl shadow-lg shadow-brand-cream/15 mb-4">
            <Store className="w-8 h-8 text-brand-dark" />
          </div>
          <h1 className="text-3xl font-bold text-white">
            {isSignUp ? 'Create your store' : 'Welcome back'}
          </h1>
          <p className="text-brand-slate mt-2">
            {isSignUp 
              ? 'Join hundreds of sellers on WhatsApp' 
              : 'Sign in to manage your products'}
          </p>
        </div>

        <div className="bg-[#071739]/60 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-brand-steel/20">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Social Login */}
            <div className="grid grid-cols-1 gap-4 mb-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="flex items-center justify-center gap-3 w-full px-4 py-3 border border-brand-steel/30 bg-brand-dark rounded-xl hover:bg-brand-steel/20 transition-all font-semibold text-white shadow-sm disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-brand-steel/15"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#071739] px-3 text-brand-slate font-medium tracking-wider">
                  Or continue with email
                </span>
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-semibold text-brand-slate mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-slate/60" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-brand-dark border border-brand-steel/40 text-white placeholder-brand-slate/40 rounded-xl focus:ring-2 focus:ring-brand-cream focus:border-transparent outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-brand-slate mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-slate/60" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-brand-dark border border-brand-steel/40 text-white placeholder-brand-slate/40 rounded-xl focus:ring-2 focus:ring-brand-cream focus:border-transparent outline-none transition-all"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-slate mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-slate/60" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-brand-dark border border-brand-steel/40 text-white placeholder-brand-slate/40 rounded-xl focus:ring-2 focus:ring-brand-cream focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-brand-bronze to-brand-cream text-brand-dark font-black py-3 rounded-xl transition-all flex items-center justify-center gap-2 group shadow-md"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-brand-steel/15 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-brand-cream font-semibold hover:underline transition-colors"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Create one"}
            </button>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="mt-8 text-brand-slate hover:text-brand-cream font-medium flex items-center justify-center gap-2 mx-auto transition-colors"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          Back to Directory
        </button>
      </div>
    </div>
  );
}
