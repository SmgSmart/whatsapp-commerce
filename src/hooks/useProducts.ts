import { useState, useEffect } from 'react';
import { publicApi } from '../lib/api';
import type { Product } from '../lib/types';

export function useProducts(categoryId?: string, storeSlug?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [categoryId, storeSlug]);

  async function fetchProducts() {
    setLoading(true);
    setError(null);
    try {
      const data = await publicApi.getProducts(storeSlug, categoryId);
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  return { products, loading, error };
}
