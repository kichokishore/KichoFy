import { useState, useEffect } from 'react';
import { Product } from '../types';
import { productsService } from '../utils/databaseService';

export const useProducts = (filters?: {
  category?: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  limit?: number;
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productsService.getProducts(filters);
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters?.category, filters?.isNew, filters?.isBestSeller, filters?.limit]);

  return { products, loading, error };
};