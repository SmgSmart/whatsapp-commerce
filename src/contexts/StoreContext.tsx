import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { adminApi } from '../lib/api';
import type { BusinessInfo } from '../lib/types';
import { useAuth } from './AuthContext';

interface StoreContextType {
  store: BusinessInfo | null;
  stores: BusinessInfo[];
  loading: boolean;
  activeStoreId: string | null;
  setActiveStoreId: (id: string) => void;
  refetch: () => Promise<void>;
  isSubscriptionActive: boolean;
  daysLeftOfTrial: number;
  subscriptionStatus: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | null;
}

const StoreContext = createContext<StoreContextType>({
  store: null,
  stores: [],
  loading: true,
  activeStoreId: null,
  setActiveStoreId: () => {},
  refetch: async () => {},
  isSubscriptionActive: false,
  daysLeftOfTrial: 0,
  subscriptionStatus: null,
});

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [stores, setStores] = useState<BusinessInfo[]>([]);
  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);

  const fetchStores = useCallback(async () => {
    if (!user) {
      setStores([]);
      setActiveStoreId(null);
      setLoading(false);
      setLoadedUserId(null);
      return;
    }
    try {
      setLoading(true);
      const fetched = await adminApi.getMyStores();
      setStores(fetched);
      setLoadedUserId(user.id);
      // Always select the first store for this user.
      // Resetting when user changes is important to prevent
      // one user seeing another user's store.
      if (fetched.length > 0) {
        setActiveStoreId(prev => {
          const stillValid = prev && fetched.some(s => s.id === prev);
          return stillValid ? prev : fetched[0].id;
        });
      } else {
        setActiveStoreId(null);
      }
    } catch (err) {
      console.error('[StoreContext] Error fetching stores:', err);
      setStores([]);
      setActiveStoreId(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id]); // Re-run when user ID changes — not just when user obj reference changes

  // Whenever the logged-in user changes, reset store state immediately to avoid
  // flashing another user's store, then re-fetch for the new user.
  useEffect(() => {
    setStores([]);
    setActiveStoreId(null);
    setLoading(true);
    fetchStores();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const store = activeStoreId ? (stores.find(s => s.id === activeStoreId) ?? null) : (stores[0] ?? null);

  const isTrialActive = store?.trial_ends_at ? new Date(store.trial_ends_at) > new Date() : false;
  const isSubscriptionActive = store ? (store.subscription_status === 'active' || isTrialActive) : false;
  const daysLeftOfTrial = store?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(store.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;
  const subscriptionStatus = store?.subscription_status ?? null;

  const isContextLoading = loading || (user !== null && loadedUserId !== user?.id);

  return (
    <StoreContext.Provider
      value={{
        store,
        stores,
        loading: isContextLoading,
        activeStoreId,
        setActiveStoreId,
        refetch: fetchStores,
        isSubscriptionActive,
        daysLeftOfTrial,
        subscriptionStatus,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
