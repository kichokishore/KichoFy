// src/services/orderService.ts
import { supabase } from './supabaseService';
import { 
  Order, 
  OrderItem, 
  OrderStatusHistory, 
  Payment, 
  ShippingAddress, 
  CartItem,
  ApiResponse, 
  PaginatedResponse,
  User 
} from '../types';
import { TABLE_NAMES, ORDER_STATUS, PAYMENT_STATUS, ERROR_MESSAGES } from '../utils/constants';

export class OrderService {
  private tableName = TABLE_NAMES.ORDERS;
  private orderItemsTable = TABLE_NAMES.ORDER_ITEMS;
  private orderStatusHistoryTable = TABLE_NAMES.ORDER_STATUS_HISTORY;
  private paymentsTable = TABLE_NAMES.PAYMENTS;

  /**
   * Get all orders for a user
   */
  async getUserOrders(userId: string, options: { 
    page?: number; 
    limit?: number;
    status?: string;
  } = {}): Promise<ApiResponse<PaginatedResponse<Order>>> {
    try {
      const { page = 1, limit = 10, status } = options;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from(this.tableName)
        .select(`
          *,
          order_items (
            *,
            products (*)
          ),
          payments (*)
        `, { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching user orders:', error);
        return {
          data: null,
          success: false,
          error: error.message,
          message: ERROR_MESSAGES.FETCH_FAILED
        };
      }

      const response: PaginatedResponse<Order> = {
        data: data as Order[],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };

      return {
        data: response,
        success: true,
        message: 'Orders fetched successfully'
      };
    } catch (error) {
      console.error('Error in getUserOrders:', error);
      return {
        data: null,
        success: false,
        error: ERROR_MESSAGES.SERVER_ERROR,
        message: ERROR_MESSAGES.SERVER_ERROR
      };
    }
  }

  /**
   * Get order by ID with full details
   */
  async getOrderById(orderId: string): Promise<ApiResponse<Order>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          order_items (
            *,
            products (*)
          ),
          payments (*),
          order_status_history (*)
        `)
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('Error fetching order:', error);
        return {
          data: null,
          success: false,
          error: error.message,
          message: ERROR_MESSAGES.NOT_FOUND
        };
      }

      return {
        data: data as Order,
        success: true,
        message: 'Order fetched successfully'
      };
    } catch (error) {
      console.error('Error in getOrderById:', error);
      return {
        data: null,
        success: false,
        error: ERROR_MESSAGES.SERVER_ERROR,
        message: ERROR_MESSAGES.SERVER_ERROR
      };
    }
  }

  /**
   * Create a new order from cart items
   */
  async createOrder(
    userId: string,
    cartItems: CartItem[],
    shippingAddress: ShippingAddress,
    paymentData: {
      payment_method: string;
      payment_id?: string;
      amount: number;
    }
  ): Promise<ApiResponse<Order>> {
    try {
      // Calculate total amount
      const totalAmount = cartItems.reduce((total, item) => {
        return total + (item.product?.price || 0) * item.quantity;
      }, 0);

      // Create order
      const { data: order, error: orderError } = await supabase
        .from(this.tableName)
        .insert([{
          user_id: userId,
          total_amount: totalAmount,
          status: ORDER_STATUS.PENDING,
          payment_status: PAYMENT_STATUS.PENDING,
          shipping_address: shippingAddress,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        return {
          data: null,
          success: false,
          error: orderError.message,
          message: ERROR_MESSAGES.CREATE_FAILED
        };
      }

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product?.price || 0,
        size: item.size || null,
        color: item.color || null
      }));

      const { error: itemsError } = await supabase
        .from(this.orderItemsTable)
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        // Rollback order creation
        await supabase.from(this.tableName).delete().eq('id', order.id);
        return {
          data: null,
          success: false,
          error: itemsError.message,
          message: 'Failed to create order items'
        };
      }

      // Create payment record
      const { error: paymentError } = await supabase
        .from(this.paymentsTable)
        .insert([{
          order_id: order.id,
          payment_id: paymentData.payment_id,
          amount: paymentData.amount,
          currency: 'INR',
          status: PAYMENT_STATUS.PENDING,
          method: paymentData.payment_method,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (paymentError) {
        console.error('Error creating payment:', paymentError);
        // Rollback order and items
        await supabase.from(this.orderItemsTable).delete().eq('order_id', order.id);
        await supabase.from(this.tableName).delete().eq('id', order.id);
        return {
          data: null,
          success: false,
          error: paymentError.message,
          message: 'Failed to create payment record'
        };
      }

      // Add to order status history
      await this.addOrderStatusHistory(order.id, ORDER_STATUS.PENDING, 'Order created');

      return {
        data: order as Order,
        success: true,
        message: 'Order created successfully'
      };
    } catch (error) {
      console.error('Error in createOrder:', error);
      return {
        data: null,
        success: false,
        error: ERROR_MESSAGES.SERVER_ERROR,
        message: ERROR_MESSAGES.SERVER_ERROR
      };
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: string, 
    status: string, 
    note?: string
  ): Promise<ApiResponse<Order>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        console.error('Error updating order status:', error);
        return {
          data: null,
          success: false,
          error: error.message,
          message: ERROR_MESSAGES.UPDATE_FAILED
        };
      }

      // Add to order status history
      await this.addOrderStatusHistory(orderId, status, note);

      return {
        data: data as Order,
        success: true,
        message: 'Order status updated successfully'
      };
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      return {
        data: null,
        success: false,
        error: ERROR_MESSAGES.SERVER_ERROR,
        message: ERROR_MESSAGES.SERVER_ERROR
      };
    }
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    orderId: string, 
    paymentStatus: string,
    paymentId?: string
  ): Promise<ApiResponse<Order>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          payment_status: paymentStatus,
          payment_id: paymentId,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        console.error('Error updating payment status:', error);
        return {
          data: null,
          success: false,
          error: error.message,
          message: ERROR_MESSAGES.UPDATE_FAILED
        };
      }

      // Update payment record if payment ID is provided
      if (paymentId) {
        await supabase
          .from(this.paymentsTable)
          .update({
            status: paymentStatus,
            payment_id: paymentId,
            updated_at: new Date().toISOString()
          })
          .eq('order_id', orderId);
      }

      return {
        data: data as Order,
        success: true,
        message: 'Payment status updated successfully'
      };
    } catch (error) {
      console.error('Error in updatePaymentStatus:', error);
      return {
        data: null,
        success: false,
        error: ERROR_MESSAGES.SERVER_ERROR,
        message: ERROR_MESSAGES.SERVER_ERROR
      };
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string, reason?: string): Promise<ApiResponse<Order>> {
    try {
      const order = await this.getOrderById(orderId);
      if (!order.data) {
        return order;
      }

      // Check if order can be cancelled
      if (!this.canCancelOrder(order.data)) {
        return {
          data: null,
          success: false,
          error: 'Order cannot be cancelled at this stage',
          message: 'This order cannot be cancelled as it has already been shipped or delivered'
        };
      }

      return await this.updateOrderStatus(
        orderId, 
        ORDER_STATUS.CANCELLED, 
        reason || 'Order cancelled by user'
      );
    } catch (error) {
      console.error('Error in cancelOrder:', error);
      return {
        data: null,
        success: false,
        error: ERROR_MESSAGES.SERVER_ERROR,
        message: ERROR_MESSAGES.SERVER_ERROR
      };
    }
  }

  /**
   * Get order status history
   */
  async getOrderStatusHistory(orderId: string): Promise<ApiResponse<OrderStatusHistory[]>> {
    try {
      const { data, error } = await supabase
        .from(this.orderStatusHistoryTable)
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching order status history:', error);
        return {
          data: [],
          success: false,
          error: error.message,
          message: ERROR_MESSAGES.FETCH_FAILED
        };
      }

      return {
        data: data as OrderStatusHistory[],
        success: true,
        message: 'Order status history fetched successfully'
      };
    } catch (error) {
      console.error('Error in getOrderStatusHistory:', error);
      return {
        data: [],
        success: false,
        error: ERROR_MESSAGES.SERVER_ERROR,
        message: ERROR_MESSAGES.SERVER_ERROR
      };
    }
  }

  /**
   * Get orders by status (for admin)
   */
  async getOrdersByStatus(
    status: string, 
    options: { page?: number; limit?: number } = {}
  ): Promise<ApiResponse<PaginatedResponse<Order>>> {
    try {
      const { page = 1, limit = 20 } = options;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from(this.tableName)
        .select(`
          *,
          order_items (
            *,
            products (*)
          ),
          profiles!inner(*)
        `, { count: 'exact' })
        .eq('status', status)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching orders by status:', error);
        return {
          data: null,
          success: false,
          error: error.message,
          message: ERROR_MESSAGES.FETCH_FAILED
        };
      }

      const response: PaginatedResponse<Order> = {
        data: data as Order[],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };

      return {
        data: response,
        success: true,
        message: 'Orders fetched successfully'
      };
    } catch (error) {
      console.error('Error in getOrdersByStatus:', error);
      return {
        data: null,
        success: false,
        error: ERROR_MESSAGES.SERVER_ERROR,
        message: ERROR_MESSAGES.SERVER_ERROR
      };
    }
  }

  /**
   * Get recent orders (for admin dashboard)
   */
  async getRecentOrders(limit: number = 10): Promise<ApiResponse<Order[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          order_items (
            *,
            products (*)
          ),
          profiles!inner(*)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent orders:', error);
        return {
          data: [],
          success: false,
          error: error.message,
          message: ERROR_MESSAGES.FETCH_FAILED
        };
      }

      return {
        data: data as Order[],
        success: true,
        message: 'Recent orders fetched successfully'
      };
    } catch (error) {
      console.error('Error in getRecentOrders:', error);
      return {
        data: [],
        success: false,
        error: ERROR_MESSAGES.SERVER_ERROR,
        message: ERROR_MESSAGES.SERVER_ERROR
      };
    }
  }

  /**
   * Calculate order statistics
   */
  async getOrderStatistics(userId?: string): Promise<ApiResponse<{
    total_orders: number;
    pending_orders: number;
    completed_orders: number;
    total_revenue: number;
  }>> {
    try {
      let query = supabase.from(this.tableName).select('*');

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching order statistics:', error);
        return {
          data: null,
          success: false,
          error: error.message,
          message: ERROR_MESSAGES.FETCH_FAILED
        };
      }

      const orders = data as Order[];
      const statistics = {
        total_orders: orders.length,
        pending_orders: orders.filter(o => o.status === ORDER_STATUS.PENDING).length,
        completed_orders: orders.filter(o => 
          [ORDER_STATUS.DELIVERED, ORDER_STATUS.COMPLETED].includes(o.status as any)
        ).length,
        total_revenue: orders
          .filter(o => o.payment_status === PAYMENT_STATUS.PAID)
          .reduce((sum, order) => sum + order.total_amount, 0)
      };

      return {
        data: statistics,
        success: true,
        message: 'Order statistics fetched successfully'
      };
    } catch (error) {
      console.error('Error in getOrderStatistics:', error);
      return {
        data: null,
        success: false,
        error: ERROR_MESSAGES.SERVER_ERROR,
        message: ERROR_MESSAGES.SERVER_ERROR
      };
    }
  }

  /**
   * Private method to add order status history
   */
  private async addOrderStatusHistory(
    orderId: string, 
    status: string, 
    note?: string
  ): Promise<void> {
    try {
      await supabase
        .from(this.orderStatusHistoryTable)
        .insert([{
          order_id: orderId,
          status,
          note: note || null,
          created_at: new Date().toISOString()
        }]);
    } catch (error) {
      console.error('Error adding order status history:', error);
    }
  }

  /**
   * Check if order can be cancelled
   */
  private canCancelOrder(order: Order): boolean {
    const nonCancellableStatuses = [
      ORDER_STATUS.SHIPPED,
      ORDER_STATUS.DELIVERED,
      ORDER_STATUS.COMPLETED
    ];
    return !nonCancellableStatuses.includes(order.status as any);
  }

  /**
   * Validate order data
   */
  validateOrderData(orderData: Partial<Order>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!orderData.user_id) {
      errors.push('User ID is required');
    }

    if (!orderData.total_amount || orderData.total_amount <= 0) {
      errors.push('Valid total amount is required');
    }

    if (!orderData.shipping_address) {
      errors.push('Shipping address is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export service instance
export const orderService = new OrderService();

export default orderService;