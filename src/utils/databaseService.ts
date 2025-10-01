import { supabase } from './supabaseClient';
import { Product, Category, Order, OrderItem, Review, User } from '../types';

// Products Service
export const productsService = {
  // Get all products with filters
  async getProducts(filters?: {
    category?: string;
    isNew?: boolean;
    isBestSeller?: boolean;
    limit?: number;
  }) {
    try {
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
      return data as Product[] || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  // Get product by ID
  async getProductById(id: string) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Product;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Create product (Admin only)
  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();
      if (error) throw error;
      return data as Product;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Update product (Admin only)
  async updateProduct(id: string, updates: Partial<Product>) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Product;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Delete product (Admin only)
  async deleteProduct(id: string) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Bulk update products
  async bulkUpdateProducts(updates: Array<{ id: string; updates: Partial<Product> }>) {
    try {
      const updatePromises = updates.map(({ id, updates }) =>
        supabase
          .from('products')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
      );

      const results = await Promise.all(updatePromises);
      const errors = results.filter(result => result.error);

      if (errors.length > 0) {
        throw new Error(`Failed to update ${errors.length} products`);
      }
    } catch (error) {
      console.error('Error bulk updating products:', error);
      throw error;
    }
  }
};

// Categories Service
export const categoriesService = {
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Category[] || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  async getCategoryById(id: string) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Category;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  },

  async createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([category])
        .select()
        .single();
      if (error) throw error;
      return data as Category;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  async updateCategory(id: string, updates: Partial<Category>) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Category;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  async deleteCategory(id: string) {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
};

// Orders Service
export const ordersService = {
  // Get all orders (for admin) - Now gets ALL orders due to RLS policies
  async getOrders(userId?: string) {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              id,
              name,
              description,
              price,
              original_price,
              category_id,
              subcategory,
              stock,
              image_url,
              images,
              sizes,
              colors,
              tags,
              rating,
              reviews,
              is_new,
              is_best_seller,
              created_at,
              updated_at
            )
          ),
          profiles!user_id (
            id,
            name,
            email,
            phone,
            mobile_number,
            address_line1,
            address_line2,
            city,
            state,
            country,
            pincode,
            role,
            created_at,
            updated_at,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      // Only filter by user if userId is provided (for customer view)
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      return data as Order[] || [];
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      return [];
    }
  },

  // Get orders for a specific user
  async getUserOrders(userId: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              id,
              name,
              description,
              price,
              original_price,
              category_id,
              subcategory,
              stock,
              image_url,
              images,
              sizes,
              colors,
              tags,
              rating,
              reviews,
              is_new,
              is_best_seller,
              created_at,
              updated_at
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[] || [];
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
  },

  // Get a single order by ID
  async getOrder(orderId: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              id,
              name,
              description,
              price,
              original_price,
              category_id,
              subcategory,
              stock,
              image_url,
              images,
              sizes,
              colors,
              tags,
              rating,
              reviews,
              is_new,
              is_best_seller,
              created_at,
              updated_at
            )
          ),
          profiles!user_id (
            id,
            name,
            email,
            phone,
            mobile_number,
            address_line1,
            address_line2,
            city,
            state,
            country,
            pincode,
            role,
            created_at,
            updated_at,
            avatar_url
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data as Order;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  // Create a new order
  async createOrder(orderData: {
    user_id: string;
    total_amount: number;
    status?: string;
    payment_status?: string;
    items: Array<{
      product_id: string;
      quantity: number;
      price: number;
      size?: string;
      color?: string;
    }>;
  }) {
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: orderData.user_id,
          total_amount: orderData.total_amount,
          status: orderData.status || 'pending',
          payment_status: orderData.payment_status || 'pending'
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

      // Return the complete order with items and product details
      return this.getOrder(order.id);
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data as Order;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Update payment status
  async updatePaymentStatus(orderId: string, paymentStatus: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          payment_status: paymentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data as Order;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  },

  // Update order details (admin only)
  async updateOrder(orderId: string, updates: Partial<Order>) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data as Order;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  },

  // Delete order (admin only)
  async deleteOrder(orderId: string) {
    try {
      // First delete order items
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      // Then delete the order
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;

      return { success: true, message: 'Order deleted successfully' };
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  },

  // Get orders by status
  async getOrdersByStatus(status: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              id,
              name,
              description,
              price,
              original_price,
              category_id,
              subcategory,
              stock,
              image_url,
              images,
              sizes,
              colors,
              tags,
              rating,
              reviews,
              is_new,
              is_best_seller,
              created_at,
              updated_at
            )
          ),
          profiles!user_id (
            id,
            name,
            email,
            phone,
            mobile_number,
            address_line1,
            address_line2,
            city,
            state,
            country,
            pincode,
            role,
            created_at,
            updated_at,
            avatar_url
          )
        `)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[] || [];
    } catch (error) {
      console.error('Error fetching orders by status:', error);
      return [];
    }
  },

  // Get orders by payment status
  async getOrdersByPaymentStatus(paymentStatus: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              id,
              name,
              description,
              price,
              original_price,
              category_id,
              subcategory,
              stock,
              image_url,
              images,
              sizes,
              colors,
              tags,
              rating,
              reviews,
              is_new,
              is_best_seller,
              created_at,
              updated_at
            )
          ),
          profiles!user_id (
            id,
            name,
            email,
            phone,
            mobile_number,
            address_line1,
            address_line2,
            city,
            state,
            country,
            pincode,
            role,
            created_at,
            updated_at,
            avatar_url
          )
        `)
        .eq('payment_status', paymentStatus)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[] || [];
    } catch (error) {
      console.error('Error fetching orders by payment status:', error);
      return [];
    }
  },

  // Get recent orders (for dashboard)
  async getRecentOrders(limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              id,
              name,
              image_url
            )
          ),
          profiles!user_id (
            id,
            name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Order[] || [];
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      return [];
    }
  },

  // Get order statistics
  async getOrderStats() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('status, total_amount');

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        totalRevenue: data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0,
        byStatus: {} as Record<string, number>
      };

      data?.forEach(order => {
        stats.byStatus[order.status] = (stats.byStatus[order.status] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error fetching order stats:', error);
      return {
        total: 0,
        totalRevenue: 0,
        byStatus: {}
      };
    }
  },

  // Search orders by various criteria
  async searchOrders(searchTerm: string, filters: {
    status?: string;
    paymentStatus?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}) {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              id,
              name,
              description,
              price,
              image_url
            )
          ),
          profiles!user_id (
            id,
            name,
            email,
            phone
          )
        `)
        .or(`id.ilike.%${searchTerm}%,profiles.name.ilike.%${searchTerm}%,profiles.email.ilike.%${searchTerm}%`);

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.paymentStatus) {
        query = query.eq('payment_status', filters.paymentStatus);
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return data as Order[] || [];
    } catch (error) {
      console.error('Error searching orders:', error);
      return [];
    }
  }
};

// Reviews Service
export const reviewsService = {
  async getProductReviews(productId: string) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles (
            id,
            name,
            email,
            avatar_url
          )
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Review[] || [];
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  },

  async createReview(review: {
    product_id: string;
    user_id: string;
    rating: number;
    comment?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([review])
        .select()
        .single();
      if (error) throw error;
      return data as Review;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },

  async updateReview(reviewId: string, updates: Partial<Review>) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', reviewId)
        .select()
        .single();
      if (error) throw error;
      return data as Review;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  },

  async deleteReview(reviewId: string) {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }
};

// Users Service (Admin only)
export const usersService = {
  async getUsers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      return data as User[] || [];
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return [];
    }
  },

  async getUserById(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data as User;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  async updateUserRole(userId: string, role: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          role,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },

  async updateUser(userId: string, updates: Partial<User>) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data as User;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  async deleteUser(userId: string) {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  async searchUsers(searchTerm: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,mobile_number.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as User[] || [];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }
};

// Admin Analytics Service - Updated to work with your exact schema
export const analyticsService = {
  async getDashboardStats(timeRange: 'day' | 'week' | 'month' | 'year' = 'month') {
    try {
      // Get total products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, stock, created_at');

      // Get total users
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, created_at');

      // Get total orders and revenue
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, total_amount, status, created_at');

      // Get average rating
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating');

      // Handle errors individually
      if (productsError) {
        console.error('Products error:', productsError);
        throw productsError;
      }
      if (usersError) {
        console.error('Users error:', usersError);
        throw usersError;
      }
      if (ordersError) {
        console.error('Orders error:', ordersError);
        throw ordersError;
      }

      const totalProducts = products?.length || 0;
      const totalUsers = users?.length || 0;
      const totalOrders = orders?.length || 0;

      // Calculate total revenue from completed orders
      const totalRevenue = orders
        ?.filter(order => order.status === 'completed')
        ?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      // Calculate average rating (handle case where reviews table might not exist or be empty)
      let averageRating = 0;
      if (reviews && reviews.length > 0 && !reviewsError) {
        averageRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length;
      }

      // Calculate monthly growth (simplified)
      const now = new Date();
      const currentMonthOrders = orders?.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear();
      }).length || 0;

      const previousMonthOrders = orders?.filter(order => {
        const orderDate = new Date(order.created_at);
        const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        return orderDate.getMonth() === prevMonth &&
          orderDate.getFullYear() === prevYear;
      }).length || 0;

      const monthlyGrowth = previousMonthOrders > 0
        ? Math.round(((currentMonthOrders - previousMonthOrders) / previousMonthOrders) * 100)
        : currentMonthOrders > 0 ? 100 : 0;

      // Low stock products
      const lowStockProducts = products?.filter(product => product.stock <= 10).length || 0;

      // Active users (users who placed orders in last 30 days)
      const activeUsers = await this.getActiveUsersCount();

      return {
        totalProducts,
        totalUsers,
        totalOrders,
        totalRevenue,
        averageRating: parseFloat(averageRating.toFixed(1)),
        monthlyGrowth,
        lowStockProducts,
        activeUsers,
        newCustomers: users?.filter(user => {
          const userCreated = new Date(user.created_at);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return userCreated > thirtyDaysAgo;
        }).length || 0
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return fallback data
      return {
        totalProducts: 0,
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        averageRating: 0,
        monthlyGrowth: 0,
        lowStockProducts: 0,
        activeUsers: 0,
        newCustomers: 0
      };
    }
  },

  async getActiveUsersCount() {
    try {
      // Get users who have placed orders in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: activeOrders, error } = await supabase
        .from('orders')
        .select('user_id')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (error) throw error;

      // Get unique user IDs
      const activeUserIds = [...new Set(activeOrders?.map(order => order.user_id) || [])];
      return activeUserIds.length;
    } catch (error) {
      console.error('Error calculating active users:', error);
      return 0;
    }
  },

  async getLowStockProducts(threshold: number = 10) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .lte('stock', threshold)
        .order('stock', { ascending: true });

      if (error) throw error;
      return data as Product[] || [];
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      return [];
    }
  },

  async getRecentOrders(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (*)
          ),
          profiles!user_id (
            id,
            name,
            email,
            phone,
            mobile_number,
            role,
            created_at
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Order[] || [];
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      return [];
    }
  },

  async getTopProducts(limit = 10) {
    try {
      // Get products with most order items
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          product_id,
          products (*),
          quantity
        `)
        .order('quantity', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Aggregate quantities and return unique products
      const productMap = new Map();
      data?.forEach(item => {
        if (item.products) {
          const existing = productMap.get(item.product_id);
          if (existing) {
            existing.totalQuantity += item.quantity;
          } else {
            productMap.set(item.product_id, {
              ...item.products,
              totalQuantity: item.quantity
            });
          }
        }
      });

      return Array.from(productMap.values()).sort((a, b) => b.totalQuantity - a.totalQuantity);
    } catch (error) {
      console.error('Error fetching top products:', error);
      return [];
    }
  },

  async getSalesData(timeRange: 'day' | 'week' | 'month' | 'year' = 'month') {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('total_amount, created_at, status')
        .eq('status', 'completed')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group sales by time period
      const salesData = orders?.reduce((acc: any, order) => {
        const date = new Date(order.created_at);
        let key: string;

        switch (timeRange) {
          case 'day':
            key = date.toISOString().split('T')[0];
            break;
          case 'week':
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            key = weekStart.toISOString().split('T')[0];
            break;
          case 'month':
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            break;
          case 'year':
            key = String(date.getFullYear());
            break;
        }

        if (!acc[key]) {
          acc[key] = 0;
        }
        acc[key] += order.total_amount;
        return acc;
      }, {});

      return salesData || {};
    } catch (error) {
      console.error('Error fetching sales data:', error);
      return {};
    }
  }
};

// Settings Service
export const settingsService = {
  async getStoreSettings() {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }
      return data || null;
    } catch (error) {
      console.error('Error fetching store settings:', error);
      return null;
    }
  },

  async updateStoreSettings(settings: any) {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .upsert([settings])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating store settings:', error);
      throw error;
    }
  },

  async getEmailSettings() {
    try {
      const { data, error } = await supabase
        .from('email_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      return data || null;
    } catch (error) {
      console.error('Error fetching email settings:', error);
      return null;
    }
  },

  async updateEmailSettings(settings: any) {
    try {
      const { data, error } = await supabase
        .from('email_settings')
        .upsert([settings])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating email settings:', error);
      throw error;
    }
  }
};

// Export all services
export default {
  productsService,
  categoriesService,
  ordersService,
  reviewsService,
  usersService,
  analyticsService,
  settingsService
};