import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authClient } from '../lib/auth-client';
import { adminApi } from '../lib/api';

export function AuthCallback() {
  const [status, setStatus] = useState('Completing sign in...');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      // Session verifier is processed automatically by the Neon Auth SDK

      // Give the session a moment to establish (important for new users)
      await new Promise(resolve => setTimeout(resolve, 1500));

      try {
        setStatus('Verifying your account...');
        const { data: session } = await authClient.getSession();

        if (!session?.user) {
          setStatus('Session not found. Redirecting to login...');
          setTimeout(() => navigate('/admin/login'), 2000);
          return;
        }

        setStatus('Loading your store...');
        try {
          const stores = await adminApi.getMyStores();
          if (stores && stores.length > 0) {
            // Returning user — go to dashboard
            navigate('/admin', { replace: true });
          } else {
            // New user — go to onboarding
            navigate('/admin/onboarding', { replace: true });
          }
        } catch {
          // If store fetch fails, go to dashboard anyway
          navigate('/admin', { replace: true });
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setStatus('Something went wrong. Redirecting to login...');
        setTimeout(() => navigate('/admin/login'), 2000);
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <p className="text-gray-700 font-semibold text-lg">{status}</p>
        <p className="text-gray-400 text-sm mt-2">Please wait, don't close this page.</p>
      </div>
    </div>
  );
}
