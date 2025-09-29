import { supabase } from './supabaseClient';
import { Product, Category, Order, OrderItem, Review } from '../types';

// Products Service
export const productsService = {
  // Get all products with filters
  async getProducts(filters?: {
    category?: string;
    isNew?: boolean;
    isBestSeller?: boolean;
    limit?: number;
  }) {
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.category) {
      query = query.eq('category_id', filters.category);
    }
    if (filters?.isNew) {
      query = query.eq('is_new', true);
    }
    if (filters?.isBestSeller) {
      query = query.eq('is_best_seller', true);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Product[];
  },

  // Get product by ID
  async getProductById(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Product;
  },

  // Create product (Admin only)
  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();
    if (error) throw error;
    return data as Product;
  },

  // Update product (Admin only)
  async updateProduct(id: string, updates: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Product;
  },

  // Delete product (Admin only)
  async deleteProduct(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// Categories Service
export const categoriesService = {
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    if (error) throw error;
    return data as Category[];
  },

  async getCategoryById(id: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Category;
  }
};

// Orders Service
export const ordersService = {
  async getOrders(userId?: string) {
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Order[];
  },

  async createOrder(orderData: {
    user_id: string;
    total_amount: number;
    items: Array<{
      product_id: string;
      quantity: number;
      price: number;
      size?: string;
      color?: string;
    }>;
  }) {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: orderData.user_id,
        total_amount: orderData.total_amount,
        status: 'pending',
        payment_status: 'pending'
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
      size: item.size,
      color: item.color
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return order as Order;
  }
};

// Reviews Service
export const reviewsService = {
  async getProductReviews(productId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles (name)
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Review[];
  },

  async createReview(review: {
    product_id: string;
    user_id: string;
    rating: number;
    comment?: string;
  }) {
    const { data, error } = await supabase
      .from('reviews')
      .insert([review])
      .select()
      .single();
    if (error) throw error;
    return data as Review;
  }
};

// Users Service (Admin only)
export const usersService = {
  async getUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async updateUserRole(userId: string, role: string) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};