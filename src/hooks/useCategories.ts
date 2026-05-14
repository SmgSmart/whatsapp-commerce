import { useState, useEffect } from 'react';
import { publicApi } from '../lib/api';
import type { Category } from '../lib/types';

export function useCategories(storeSlug?: string) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, [storeSlug]);

  async function fetchCategories() {
    setLoading(true);
    setError(null);
    try {
      const data = await publicApi.getCategories(storeSlug);
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }

  return { categories, loading, error };
}
