import { supabase } from './supabaseClient';

export interface PendingPayment {
  id: string;
  session_id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'verified' | 'expired';
  order_data: any;
  created_at: string;
  expires_at: string;
}

export const paymentRecoveryService = {
  // Store pending payment session
  async createPendingPayment(sessionData: {
    session_id: string;
    user_id: string;
    amount: number;
    order_data: any;
  }): Promise<PendingPayment> {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry
    
    const { data, error } = await supabase
      .from('pending_payments')
      .insert([{
        ...sessionData,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Find pending payment by session ID
  async getPendingPayment(sessionId: string): Promise<PendingPayment | null> {
    const { data, error } = await supabase
      .from('pending_payments')
      .select('*')
      .eq('session_id', sessionId)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error) return null;
    return data;
  },

  // Mark payment as verified and create order
  async verifyPaymentAndCreateOrder(sessionId: string): Promise<any> {
    const pendingPayment = await this.getPendingPayment(sessionId);
    
    if (!pendingPayment) {
      throw new Error('Payment session not found or expired');
    }

    // Create the actual order - MATCHING YOUR SCHEMA
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: pendingPayment.user_id,
        total_amount: pendingPayment.amount,
        status: 'confirmed',
        payment_status: 'paid',
        payment_session_id: sessionId,
        shipping_address: pendingPayment.order_data.shipping_address,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items - MATCHING YOUR ORDER_ITEMS SCHEMA
    const orderItems = pendingPayment.order_data.items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
      size: item.size || null,
      color: item.color || null
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Mark pending payment as verified
    await supabase
      .from('pending_payments')
      .update({ status: 'verified' })
      .eq('session_id', sessionId);

    return order;
  },

  // Get all pending payments for a user (for admin)
  async getUserPendingPayments(userId: string): Promise<PendingPayment[]> {
    const { data, error } = await supabase
      .from('pending_payments')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) return [];
    return data;
  }
};