import { useState, useEffect } from 'react';
import { useStore } from '../../contexts/StoreContext';
import { adminApi } from '../../lib/api';
import { CreditCard, CheckCircle, AlertTriangle, Calendar, Clock, Sparkles } from 'lucide-react';

export function Billing() {
  const { store, refetch } = useStore();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    subscription_status: string | null;
    trial_ends_at: string | null;
    paystack_subscription_code: string | null;
    paystack_customer_code: string | null;
    is_active: boolean;
    days_left: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [verifyRef, setVerifyRef] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    loadBillingStatus();
  }, [store?.id]);

  async function loadBillingStatus() {
    try {
      setLoading(true);
      const data = await adminApi.getBillingStatus();
      setStatus(data);
    } catch (err: any) {
      console.error('[Billing] Error loading status:', err);
      setError('Failed to load billing status.');
    } finally {
      setLoading(false);
    }
  }

  const loadPaystackScript = () => {
    return new Promise<boolean>((resolve) => {
      if ((window as any).PaystackPop) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v2/inline.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async () => {
    setError(null);
    setInfo(null);
    setSubmitting(true);

    try {
      // 1. Initialize subscription on backend
      const data = await adminApi.subscribe();

      if (data.authorization_url && !data.access_code) {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
          || (window.navigator as any).standalone 
          || document.referrer.includes('android-app://');

        if (isStandalone) {
          // In standalone app mode, redirect directly to prevent popup blocking
          window.location.href = data.authorization_url;
        } else {
          // Standard browser: try opening a new tab
          const opened = window.open(data.authorization_url, '_blank');
          if (!opened) {
            // Popup blocker active, fallback to direct redirect
            window.location.href = data.authorization_url;
          } else {
            setInfo('Redirected to the hosted subscription payment page in a new tab. Please complete the subscription payment there. Once paid, refresh this page to update your status.');
          }
        }
        setSubmitting(false);
        return;
      }

      console.log('[Paystack Setup] Resuming transaction with access_code:', data.access_code);

      // 2. Load Paystack Inline script (only needed if using popup/inline flow)
      const scriptLoaded = await loadPaystackScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Paystack payment gateway. Please check your internet connection.');
      }

      // 3. Open Paystack Inline Pop V2
      const popup = new (window as any).PaystackPop();
      popup.resumeTransaction(data.access_code, {
        onSuccess: async (response: any) => {
          console.log('[Paystack Success]', response);
          // Wait 2 seconds for webhook processing, then refetch
          setTimeout(async () => {
            await refetch();
            await loadBillingStatus();
            window.location.reload();
          }, 2000);
        },
        onCancel: () => {
          setSubmitting(false);
        }
      });
    } catch (err: any) {
      console.error('[Billing] Subscription error:', err);
      setError(err.message || 'An error occurred while setting up subscription.');
      setSubmitting(false);
    }
  };

  const handleVerifyReference = async () => {
    if (!verifyRef.trim()) return;
    setError(null);
    setInfo(null);
    setVerifying(true);

    try {
      const res = await adminApi.verifySubscription(verifyRef.trim());
      if (res.success) {
        setInfo(res.message || 'Payment verified successfully! Your subscription is now active.');
        setVerifyRef('');
        const data = await adminApi.getBillingStatus();
        setStatus(data);
        await refetch();
      } else {
        setError(res.message || 'Failed to verify payment. Please check your reference and try again.');
      }
    } catch (err: any) {
      console.error('[Billing Verify] Error:', err);
      setError(err.message || 'Failed to verify payment reference. Please ensure it is a valid reference.');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-brand-steel/20 border-b-brand-cream"></div>
      </div>
    );
  }

  const isExpired = status ? !status.is_active : false;
  const isTrial = status?.subscription_status === 'trialing';

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-brand-header tracking-tight font-display">Billing & Plan</h1>
        <p className="text-brand-slate mt-2">Manage your premium SaaS store subscription</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-200">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
          <div>
            <h4 className="font-bold text-brand-header">Action Required</h4>
            <p className="text-sm mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {info && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3 text-emerald-200">
          <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
          <div>
            <h4 className="font-bold text-brand-header">Payment Redirected</h4>
            <p className="text-sm mt-0.5">{info}</p>
          </div>
        </div>
      )}

      {/* Main Billing Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Plan Details Card */}
        <div className="md:col-span-2 bg-brand-steel/10 rounded-3xl border border-brand-steel/15 p-6 md:p-8 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="px-3 py-1 text-xs font-bold bg-brand-cream/10 text-brand-cream border border-brand-cream/20 rounded-full uppercase tracking-wider">
                  {isTrial ? 'Trial Version' : 'Professional Plan'}
                </span>
                <h2 className="text-2xl font-bold text-brand-header mt-3">WhatsApp Premium Merchant</h2>
              </div>
              <div className="text-right">
                <span className="text-3xl font-extrabold text-brand-cream font-display">GHS 200</span>
                <span className="text-brand-slate text-sm"> / month</span>
              </div>
            </div>

            <p className="text-brand-slate mb-8 leading-relaxed">
              Unlock unlimited products, automated WhatsApp catalog sync, direct checkout routing, and customized layout styling.
            </p>

            <div className="space-y-3.5 mb-8">
              {[
                'Unlimited products and categories',
                'Instantly route orders to WhatsApp',
                'Full store customizations and logos',
                'Advanced customer checkout flows',
                'Secure payment routing via Paystack',
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-brand-gray">
                  <CheckCircle className="w-4 h-4 text-brand-cream shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            {status?.subscription_status === 'active' ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-300">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Your subscription is active and in good standing.</p>
                  {status.paystack_subscription_code && (
                    <p className="text-xs text-emerald-400/70 mt-0.5">Code: {status.paystack_subscription_code}</p>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={handleSubscribe}
                disabled={submitting}
                className="w-full py-4 bg-gradient-to-r from-brand-cream to-brand-cream/90 hover:from-brand-cream/95 hover:to-brand-cream text-brand-dark font-extrabold rounded-2xl transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-cream/10"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-brand-dark border-t-transparent"></div>
                    <span>Initializing Security Gateway...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Activate Subscription (GHS 200 / Month)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Subscription Status Details */}
        <div className="bg-brand-steel/10 rounded-3xl border border-brand-steel/15 p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-brand-header mb-6">Status Overview</h3>

            <div className="space-y-6">
              {/* Account Status Detail */}
              <div>
                <span className="text-xs text-brand-slate block font-semibold uppercase tracking-wider">Account Status</span>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${status?.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                  <span className="font-bold text-brand-header capitalize">
                    {status?.subscription_status === 'trialing' ? 'Free Trial' : status?.subscription_status || 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Time Remaining */}
              {status?.trial_ends_at && (
                <div>
                  <span className="text-xs text-brand-slate block font-semibold uppercase tracking-wider">
                    {isExpired ? 'Trial Expired' : 'Trial Period Remaining'}
                  </span>
                  <div className="flex items-center gap-2.5 mt-2">
                    <Clock className={`w-5 h-5 ${isExpired ? 'text-red-400' : 'text-brand-cream'}`} />
                    <span className="font-extrabold text-brand-header text-lg font-display">
                      {status.days_left} {status.days_left === 1 ? 'day' : 'days'} left
                    </span>
                  </div>
                </div>
              )}

              {/* Renewal Date */}
              {status?.trial_ends_at && (
                <div>
                  <span className="text-xs text-brand-slate block font-semibold uppercase tracking-wider">
                    {isExpired ? 'Ended On' : 'Trial Ends On'}
                  </span>
                  <div className="flex items-center gap-2.5 mt-2 text-brand-gray">
                    <Calendar className="w-5 h-5 text-brand-steel" />
                    <span className="text-sm font-semibold">
                      {new Date(status.trial_ends_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {isExpired && (
            <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-2.5 text-amber-200">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs leading-normal">
                Subscriptions are billed in local GHS currency. Make a payment today to unlock editing your products and storefront features instantly.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Verify Transaction Reference Fallback */}
      {status?.subscription_status !== 'active' && (
        <div className="mt-8 bg-brand-steel/10 rounded-3xl border border-brand-steel/15 p-6 backdrop-blur-md">
          <h3 className="text-lg font-bold text-brand-header mb-2">Already paid?</h3>
          <p className="text-sm text-brand-slate mb-4">
            If you have completed your payment on Paystack but your subscription status hasn't updated, please enter your transaction reference below to verify it manually.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="e.g., T123456789012345"
              value={verifyRef}
              onChange={(e) => setVerifyRef(e.target.value)}
              className="flex-1 bg-brand-dark/45 border border-brand-steel/20 rounded-2xl px-4 py-3 text-brand-header text-sm placeholder:text-brand-slate/50 focus:outline-none focus:border-brand-cream/40"
            />
            <button
              onClick={handleVerifyReference}
              disabled={verifying || !verifyRef.trim()}
              className="px-6 py-3 bg-brand-cream/10 border border-brand-cream/20 hover:bg-brand-cream/20 text-brand-cream font-bold rounded-2xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {verifying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand-cream border-t-transparent"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                'Verify Payment'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
