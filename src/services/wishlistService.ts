// src/services/wishlistService.ts
import { supabase } from './supabaseService';
import { WishlistItem, ApiResponse } from '../types';

export const wishlistService = {
  // Get user's wishlist with product details
  async getUserWishlist(userId: string): Promise<ApiResponse<WishlistItem[]>> {
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          *,
          product:products (
            id,
            name,
            description,
            price,
            original_price,
            image_url,
            images,
            stock,
            rating,
            reviews,
            is_new,
            is_best_seller,
            sizes,
            colors,
            category_id
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return {
          data: null,
          success: false,
          error: error.message
        };
      }

      return {
        data: data as WishlistItem[],
        success: true
      };
    } catch (error: any) {
      return {
        data: null,
        success: false,
        error: error.message
      };
    }
  },

  // Add product to wishlist
  async addToWishlist(userId: string, productId: string): Promise<ApiResponse<WishlistItem>> {
    try {
      // Check if item already exists in wishlist
      const { data: existingItem, error: checkError } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        return {
          data: null,
          success: false,
          error: checkError.message
        };
      }

      if (existingItem) {
        return {
          data: null,
          success: false,
          error: 'Product already in wishlist'
        };
      }

      const { data, error } = await supabase
        .from('wishlist')
        .insert([
          {
            user_id: userId,
            product_id: productId
          }
        ])
        .select(`
          *,
          product:products (
            id,
            name,
            description,
            price,
            original_price,
            image_url,
            images,
            stock,
            rating,
            reviews,
            is_new,
            is_best_seller,
            sizes,
            colors,
            category_id
          )
        `)
        .single();

      if (error) {
        return {
          data: null,
          success: false,
          error: error.message
        };
      }

      return {
        data: data as WishlistItem,
        success: true,
        message: 'Product added to wishlist'
      };
    } catch (error: any) {
      return {
        data: null,
        success: false,
        error: error.message
      };
    }
  },

  // Remove item from wishlist by wishlist item ID
  async removeFromWishlist(wishlistItemId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', wishlistItemId);

      if (error) {
        return {
          data: null,
          success: false,
          error: error.message
        };
      }

      return {
        data: true,
        success: true,
        message: 'Product removed from wishlist'
      };
    } catch (error: any) {
      return {
        data: null,
        success: false,
        error: error.message
      };
    }
  },

  // Remove item from wishlist by product ID
  async removeFromWishlistByProductId(userId: string, productId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) {
        return {
          data: null,
          success: false,
          error: error.message
        };
      }

      return {
        data: true,
        success: true,
        message: 'Product removed from wishlist'
      };
    } catch (error: any) {
      return {
        data: null,
        success: false,
        error: error.message
      };
    }
  },

  // Clear entire wishlist for user
  async clearWishlist(userId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', userId);

      if (error) {
        return {
          data: null,
          success: false,
          error: error.message
        };
      }

      return {
        data: true,
        success: true,
        message: 'Wishlist cleared'
      };
    } catch (error: any) {
      return {
        data: null,
        success: false,
        error: error.message
      };
    }
  },

  // Check if product is in user's wishlist
  async isInWishlist(userId: string, productId: string): Promise<ApiResponse<boolean>> {
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') {
        return {
          data: null,
          success: false,
          error: error.message
        };
      }

      return {
        data: !!data,
        success: true
      };
    } catch (error: any) {
      return {
        data: null,
        success: false,
        error: error.message
      };
    }
  },

  // Get wishlist count for user
  async getWishlistCount(userId: string): Promise<ApiResponse<number>> {
    try {
      const { count, error } = await supabase
        .from('wishlist')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) {
        return {
          data: null,
          success: false,
          error: error.message
        };
      }

      return {
        data: count || 0,
        success: true
      };
    } catch (error: any) {
      return {
        data: null,
        success: false,
        error: error.message
      };
    }
  }
};