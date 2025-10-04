// src/hooks/useNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { Notification as NotificationType, ApiResponse } from '../types';
import { supabase } from '../services/supabaseService';
import { TABLE_NAMES } from '../utils/constants';

/**
 * Hook for managing user notifications
 */
export function useNotifications() {
  const { state, dispatch } = useApp();
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  /**
   * Load user notifications
   */
  const loadNotifications = useCallback(async (limit: number = 20) => {
    if (!state.user) {
      setNotifications([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.NOTIFICATIONS)
        .select('*')
        .eq('user_id', state.user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      const notificationsData = data as NotificationType[];
      setNotifications(notificationsData);

      // Calculate unread count
      const unread = notificationsData.filter(n => !n.is_read).length;
      setUnreadCount(unread);

    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [state.user]);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!state.user) return;

    try {
      const { error } = await supabase
        .from(TABLE_NAMES.NOTIFICATIONS)
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', state.user.id);

      if (error) {
        throw error;
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));

    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Failed to mark notification as read');
    }
  }, [state.user]);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    if (!state.user) return;

    try {
      const { error } = await supabase
        .from(TABLE_NAMES.NOTIFICATIONS)
        .update({ is_read: true })
        .eq('user_id', state.user.id)
        .eq('is_read', false);

      if (error) {
        throw error;
      }

      // Update local state
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, is_read: true }))
      );

      // Reset unread count
      setUnreadCount(0);

    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError('Failed to mark all notifications as read');
    }
  }, [state.user]);

  /**
   * Delete a notification
   */
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!state.user) return;

    try {
      const { error } = await supabase
        .from(TABLE_NAMES.NOTIFICATIONS)
        .delete()
        .eq('id', notificationId)
        .eq('user_id', state.user.id);

      if (error) {
        throw error;
      }

      // Update local state
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );

      // Update unread count if the deleted notification was unread
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

    } catch (err) {
      console.error('Error deleting notification:', err);
      setError('Failed to delete notification');
    }
  }, [state.user, notifications]);

  /**
   * Clear all notifications
   */
  const clearAllNotifications = useCallback(async () => {
    if (!state.user) return;

    try {
      const { error } = await supabase
        .from(TABLE_NAMES.NOTIFICATIONS)
        .delete()
        .eq('user_id', state.user.id);

      if (error) {
        throw error;
      }

      // Clear local state
      setNotifications([]);
      setUnreadCount(0);

    } catch (err) {
      console.error('Error clearing all notifications:', err);
      setError('Failed to clear all notifications');
    }
  }, [state.user]);

  /**
   * Create a new notification
   */
  const createNotification = useCallback(async (
    title: string,
    message: string,
    type: NotificationType['type'] = 'info',
    relatedEntityType?: string,
    relatedEntityId?: string
  ) => {
    if (!state.user) return;

    try {
      const newNotification = {
        user_id: state.user.id,
        title,
        message,
        type,
        related_entity_type: relatedEntityType || null,
        related_entity_id: relatedEntityId || null,
        is_read: false,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from(TABLE_NAMES.NOTIFICATIONS)
        .insert([newNotification])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Add to local state
      setNotifications(prev => [data as NotificationType, ...prev]);
      
      // Update unread count
      setUnreadCount(prev => prev + 1);

      return data as NotificationType;

    } catch (err) {
      console.error('Error creating notification:', err);
      setError('Failed to create notification');
      return null;
    }
  }, [state.user]);

  /**
   * Get notifications by type
   */
  const getNotificationsByType = useCallback((type: NotificationType['type']) => {
    return notifications.filter(notification => notification.type === type);
  }, [notifications]);

  /**
   * Get unread notifications
   */
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(notification => !notification.is_read);
  }, [notifications]);

  /**
   * Get notifications by related entity
   */
  const getNotificationsByEntity = useCallback((entityType: string, entityId: string) => {
    return notifications.filter(
      notification => 
        notification.related_entity_type === entityType && 
        notification.related_entity_id === entityId
    );
  }, [notifications]);

  /**
   * Subscribe to real-time notifications
   */
  useEffect(() => {
    if (!state.user) return;

    const subscription = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: TABLE_NAMES.NOTIFICATIONS,
          filter: `user_id=eq.${state.user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as NotificationType;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);

          // Show toast notification for new real-time notifications
          if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'granted') {
              new Notification(newNotification.title, {
                body: newNotification.message,
                icon: '/assets/kichofy-logo.png',
                tag: newNotification.id,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [state.user]);

  /**
   * Load notifications on mount and when user changes
   */
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  /**
   * Request browser notification permission
   */
  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      return false;
    }
  }, []);

  /**
   * Show browser notification
   */
  const showBrowserNotification = useCallback(async (
    title: string,
    options?: NotificationOptions
  ): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    if (Notification.permission !== 'granted') {
      const granted = await requestNotificationPermission();
      if (!granted) return false;
    }

    try {
      new Notification(title, {
        icon: '/assets/kichofy-logo.png',
        badge: '/assets/kichofy-logo.png',
        ...options,
      });
      return true;
    } catch (err) {
      console.error('Error showing browser notification:', err);
      return false;
    }
  }, [requestNotificationPermission]);

  /**
   * Create order-related notifications
   */
  const createOrderNotification = useCallback(async (
    orderId: string,
    status: string,
    additionalInfo?: string
  ) => {
    const title = `Order Update`;
    const message = `Your order #${orderId.slice(-8).toUpperCase()} is now ${status}.${additionalInfo ? ` ${additionalInfo}` : ''}`;
    
    return await createNotification(
      title,
      message,
      'info',
      'order',
      orderId
    );
  }, [createNotification]);

  /**
   * Create payment-related notifications
   */
  const createPaymentNotification = useCallback(async (
    orderId: string,
    status: string,
    amount?: number
  ) => {
    const title = `Payment ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    const message = amount 
      ? `Payment of ₹${amount} for order #${orderId.slice(-8).toUpperCase()} has been ${status}.`
      : `Payment for order #${orderId.slice(-8).toUpperCase()} has been ${status}.`;
    
    return await createNotification(
      title,
      message,
      status === 'failed' ? 'error' : 'success',
      'payment',
      orderId
    );
  }, [createNotification]);

  /**
   * Create product-related notifications
   */
  const createProductNotification = useCallback(async (
    productId: string,
    type: 'back_in_stock' | 'price_drop' | 'new_review',
    productName?: string
  ) => {
    let title = '';
    let message = '';

    switch (type) {
      case 'back_in_stock':
        title = 'Back in Stock';
        message = `${productName || 'A product'} is back in stock!`;
        break;
      case 'price_drop':
        title = 'Price Drop';
        message = `${productName || 'A product'} price has dropped!`;
        break;
      case 'new_review':
        title = 'New Review';
        message = `Your product ${productName || ''} has a new review.`;
        break;
    }

    return await createNotification(
      title,
      message,
      'info',
      'product',
      productId
    );
  }, [createNotification]);

  return {
    // State
    notifications,
    loading,
    error,
    unreadCount,

    // Actions
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    createNotification,

    // Filtered notifications
    getNotificationsByType,
    getUnreadNotifications,
    getNotificationsByEntity,

    // Browser notifications
    requestNotificationPermission,
    showBrowserNotification,

    // Specialized notification creators
    createOrderNotification,
    createPaymentNotification,
    createProductNotification,

    // Utility functions
    hasUnread: unreadCount > 0,
    totalCount: notifications.length,
  };
}

export default useNotifications;