// src/services/cartService.ts
import { supabase, BaseService } from './supabaseService';

export interface CartItem {
  id?: string;
  user_id: string;
  product_id: string;
  quantity: number;
  size?: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

// CartService class extending BaseService
export class CartService extends BaseService {
  constructor() {
    super('cart_items');
  }

  async getCartItems(userId: string): Promise<CartItem[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        products (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async addToCart(item: Omit<CartItem, 'id' | 'created_at' | 'updated_at'>): Promise<CartItem> {
    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', item.user_id)
      .eq('product_id', item.product_id)
      .eq('size', item.size || '')
      .eq('color', item.color || '')
      .single();

    if (existingItem) {
      // Update quantity if item exists
      return this.updateCartItem(existingItem.id, {
        quantity: existingItem.quantity + item.quantity
      });
    } else {
      // Create new cart item
      return this.create(item);
    }
  }

  async updateCartItem(itemId: string, updates: Partial<CartItem>): Promise<CartItem> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async removeFromCart(itemId: string): Promise<void> {
    await this.delete(itemId);
  }

  async clearCart(userId: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  }

  async getCartItemCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;
    return count || 0;
  }
}

// Create and export a singleton instance
export const cartService = new CartService();

// Alternative: Export individual functions (if you prefer functional approach)
export const cartServiceFunctions = {
  async getCartItems(userId: string) {
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        products (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async addToCart(item: Omit<CartItem, 'id' | 'created_at' | 'updated_at'>) {
    const service = new CartService();
    return service.addToCart(item);
  },

  async updateCartItem(itemId: string, updates: Partial<CartItem>) {
    const service = new CartService();
    return service.updateCartItem(itemId, updates);
  },

  async removeFromCart(itemId: string) {
    const service = new CartService();
    return service.removeFromCart(itemId);
  },

  async clearCart(userId: string) {
    const service = new CartService();
    return service.clearCart(userId);
  },

  async getCartItemCount(userId: string) {
    const service = new CartService();
    return service.getCartItemCount(userId);
  }
};

export default cartService;