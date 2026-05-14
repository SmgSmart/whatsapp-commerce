import { useState, useEffect } from 'react';
import { publicApi } from '../lib/api';
import type { BusinessInfo } from '../lib/types';

export function useBusinessInfo(storeSlug?: string) {
  const [business, setBusiness] = useState<BusinessInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBusinessInfo();
  }, [storeSlug]);

  async function fetchBusinessInfo() {
    setLoading(true);
    setError(null);
    try {
      const data = await publicApi.getBusinessInfo(storeSlug);
      setBusiness(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load business info');
    } finally {
      setLoading(false);
    }
  }

  return { business, loading, error };
}
