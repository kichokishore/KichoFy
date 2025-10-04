// src/hooks/useAddresses.ts
import { useState, useEffect } from 'react';
import { Address } from '../types';
import { supabase } from '../services/supabaseService';
import { useApp } from '../contexts/AppContext';

export const useAddresses = () => {
  const { state } = useApp();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshAddresses = async () => {
    if (!state.user) return;

    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', state.user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addAddress = async (addressData: Omit<Address, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    if (!state.user) return false;

    setLoading(true);
    setError(null);

    try {
      // If setting as default, unset other defaults
      if (addressData.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', state.user.id);
      }

      const { error } = await supabase
        .from('addresses')
        .insert([addressData]);

      if (error) throw error;

      await refreshAddresses();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateAddress = async (addressId: string, updates: Partial<Address>): Promise<boolean> => {
    if (!state.user) return false;

    setLoading(true);
    setError(null);

    try {
      // If setting as default, unset other defaults
      if (updates.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', state.user.id);
      }

      const { error } = await supabase
        .from('addresses')
        .update(updates)
        .eq('id', addressId)
        .eq('user_id', state.user.id);

      if (error) throw error;

      await refreshAddresses();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (addressId: string): Promise<boolean> => {
    if (!state.user) return false;

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', state.user.id);

      if (error) throw error;

      await refreshAddresses();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const setDefaultAddress = async (addressId: string): Promise<boolean> => {
    if (!state.user) return false;

    setLoading(true);
    setError(null);

    try {
      // Unset all other defaults
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', state.user.id);

      // Set new default
      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId)
        .eq('user_id', state.user.id);

      if (error) throw error;

      await refreshAddresses();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (state.user) {
      refreshAddresses();
    }
  }, [state.user]);

  return {
    addresses,
    loading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    refreshAddresses
  };
};