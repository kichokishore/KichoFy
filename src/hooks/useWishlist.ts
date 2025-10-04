// src/hooks/useWishlist.ts
import { useState, useEffect } from 'react';
import { WishlistItem, Product } from '../types';
import { wishlistService } from '../services/wishlistService';
import { useApp } from '../contexts/AppContext';

export const useWishlist = () => {
  const { state } = useApp();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshWishlist = async () => {
    if (!state.user) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await wishlistService.getUserWishlist(state.user.id);
      if (response.success) {
        setWishlistItems(response.data || []);
      } else {
        setError(response.error || 'Failed to load wishlist');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId: string): Promise<boolean> => {
    if (!state.user) return false;

    setLoading(true);
    setError(null);

    try {
      const response = await wishlistService.addToWishlist(state.user.id, productId);
      if (response.success) {
        await refreshWishlist();
        return true;
      } else {
        setError(response.error || 'Failed to add to wishlist');
        return false;
      }
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (wishlistItemId: string): Promise<boolean> => {
    if (!state.user) return false;

    setLoading(true);
    setError(null);

    try {
      const response = await wishlistService.removeFromWishlist(wishlistItemId);
      if (response.success) {
        await refreshWishlist();
        return true;
      } else {
        setError(response.error || 'Failed to remove from wishlist');
        return false;
      }
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlistByProductId = async (productId: string): Promise<boolean> => {
    if (!state.user) return false;

    setLoading(true);
    setError(null);

    try {
      const response = await wishlistService.removeFromWishlistByProductId(state.user.id, productId);
      if (response.success) {
        await refreshWishlist();
        return true;
      } else {
        setError(response.error || 'Failed to remove from wishlist');
        return false;
      }
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlistItems.some(item => item.product_id === productId);
  };

  const toggleWishlist = async (productId: string): Promise<boolean> => {
    if (isInWishlist(productId)) {
      return await removeFromWishlistByProductId(productId);
    } else {
      return await addToWishlist(productId);
    }
  };

  const clearWishlist = async (): Promise<boolean> => {
    if (!state.user) return false;

    setLoading(true);
    setError(null);

    try {
      const response = await wishlistService.clearWishlist(state.user.id);
      if (response.success) {
        await refreshWishlist();
        return true;
      } else {
        setError(response.error || 'Failed to clear wishlist');
        return false;
      }
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (state.user) {
      refreshWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [state.user]);

  return {
    wishlistItems,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    removeFromWishlistByProductId,
    isInWishlist,
    toggleWishlist,
    clearWishlist,
    refreshWishlist
  };
};