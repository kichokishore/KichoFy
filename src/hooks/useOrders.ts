// src/hooks/useOrders.ts
import { useState, useEffect } from 'react';
import { Order } from '../types';
import { supabase } from '../services/supabaseService';
import { useApp } from '../contexts/AppContext';

export const useOrders = () => {
  const { state } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshOrders = async () => {
    if (!state.user) return;

    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (
              id,
              name,
              image_url,
              price
            )
          )
        `)
        .eq('user_id', state.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getOrderById = async (orderId: string): Promise<Order | null> => {
    if (!state.user) return null;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (
              id,
              name,
              image_url,
              price,
              original_price
            )
          ),
          payments (*)
        `)
        .eq('id', orderId)
        .eq('user_id', state.user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Error fetching order:', err);
      return null;
    }
  };

  useEffect(() => {
    if (state.user) {
      refreshOrders();
    }
  }, [state.user]);

  return {
    orders,
    loading,
    error,
    refreshOrders,
    getOrderById
  };
};