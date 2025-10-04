// src/hooks/useCart.ts
import { useContext, useCallback, useMemo } from 'react';
import CartContext from '../contexts/CartContext';
import { useAuth } from './useAuth';
import type { Product, CartItem } from '../types';
import { CART_CONFIG, SHIPPING_CONFIG } from '../utils/constants';

/**
 * Main cart hook with all cart functionality
 */
export const useCart = () => {
  const context = useContext(CartContext);
  
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
};

/**
 * Hook for cart item operations
 */
export const useCartItems = () => {
  const { 
    items, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    getCartItem,
    isLoading,
    isSyncing 
  } = useCart();

  // Check if product is in cart
  const isInCart = useCallback((productId: string, size?: string, color?: string): boolean => {
    return !!getCartItem(productId, size, color);
  }, [getCartItem]);

  // Get quantity of specific product in cart
  const getProductQuantity = useCallback((productId: string, size?: string, color?: string): number => {
    const item = getCartItem(productId, size, color);
    return item ? item.quantity : 0;
  }, [getCartItem]);

  // Get available quantity that can be added to cart
  const getAvailableQuantity = useCallback((product: Product, size?: string, color?: string): number => {
    const currentQuantity = getProductQuantity(product.id, size, color);
    // FIX: Use consistent stock property names
    const availableStock = product.stock_quantity || product.stock || product.quantity || 0;
    return Math.max(0, availableStock - currentQuantity);
  }, [getProductQuantity]);

  // Check if product can be added to cart (stock check)
  const canAddToCart = useCallback((product: Product, quantity: number = 1, size?: string, color?: string): boolean => {
    const availableQuantity = getAvailableQuantity(product, size, color);
    return availableQuantity >= quantity;
  }, [getAvailableQuantity]);

  // Quick add to cart with validation
  const quickAddToCart = useCallback(async (product: Product, size?: string, color?: string) => {
    if (!canAddToCart(product, 1, size, color)) {
      const available = getAvailableQuantity(product, size, color);
      throw new Error(`Cannot add to cart. Only ${available} available.`);
    }
    
    return addToCart(product, 1, size, color);
  }, [addToCart, canAddToCart, getAvailableQuantity]);

  // Bulk add multiple items
  const bulkAddToCart = useCallback(async (items: Array<{
    product: Product;
    quantity: number;
    size?: string;
    color?: string;
  }>) => {
    const results = [];
    for (const item of items) {
      try {
        const result = await addToCart(item.product, item.quantity, item.size, item.color);
        results.push({ success: true, product: item.product, data: result });
      } catch (error) {
        results.push({ 
          success: false, 
          product: item.product, 
          error: error instanceof Error ? error.message : 'Failed to add to cart'
        });
      }
    }
    return results;
  }, [addToCart]);

  // Remove item by product ID
  const removeItem = useCallback(async (productId: string, size?: string, color?: string) => {
    const item = getCartItem(productId, size, color);
    if (item) {
      await removeFromCart(item.id);
    }
  }, [getCartItem, removeFromCart]);

  // Update item quantity with validation
  const updateItemQuantity = useCallback(async (productId: string, quantity: number, size?: string, color?: string) => {
    const item = getCartItem(productId, size, color);
    if (item && quantity > 0) {
      // FIX: Check stock availability
      const availableStock = item.product?.stock_quantity || item.product?.stock || 0;
      if (quantity > availableStock) {
        throw new Error(`Only ${availableStock} available in stock`);
      }
      await updateQuantity(item.id, quantity);
    }
  }, [getCartItem, updateQuantity]);

  return {
    items,
    addToCart,
    removeFromCart: removeItem, // Provide simpler API
    updateQuantity: updateItemQuantity, // Provide simpler API
    getCartItem,
    isInCart,
    getProductQuantity,
    getAvailableQuantity,
    canAddToCart,
    quickAddToCart,
    bulkAddToCart,
    isLoading,
    isSyncing,
    isEmpty: items.length === 0,
    hasItems: items.length > 0,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0)
  };
};

/**
 * Hook for cart calculations and totals
 */
export const useCartTotals = () => {
  const { items, totalPrice, discount, shipping } = useCart();

  // Calculate subtotal (before discounts and shipping)
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const itemPrice = item.product?.price || item.price || 0; // FIX: Handle both product and direct price
      return sum + (itemPrice * item.quantity);
    }, 0);
  }, [items]);

  // Calculate total after discount but before shipping
  const totalAfterDiscount = useMemo(() => {
    return Math.max(0, subtotal - discount);
  }, [subtotal, discount]);

  // Calculate final total (after discount and shipping)
  const finalTotal = useMemo(() => {
    return totalAfterDiscount + shipping;
  }, [totalAfterDiscount, shipping]);

  // Calculate item count by product (not quantity)
  const uniqueProductCount = useMemo(() => {
    return items.length;
  }, [items]);

  // Calculate savings if products have original_price
  const totalSavings = useMemo(() => {
    return items.reduce((savings, item) => {
      const originalPrice = item.product?.original_price;
      const currentPrice = item.product?.price || item.price || 0;
      
      if (originalPrice && originalPrice > currentPrice) {
        return savings + ((originalPrice - currentPrice) * item.quantity);
      }
      return savings;
    }, 0);
  }, [items]);

  // Check if cart qualifies for free shipping
  const qualifiesForFreeShipping = useMemo(() => {
    return subtotal >= (SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD || 999);
  }, [subtotal]);

  // Get recommended shipping cost (for display)
  const recommendedShipping = useMemo(() => {
    if (qualifiesForFreeShipping) {
      return 0;
    }
    return SHIPPING_CONFIG.STANDARD_SHIPPING_COST || 49;
  }, [qualifiesForFreeShipping]);

  return {
    subtotal,
    totalAfterDiscount,
    finalTotal,
    discount,
    shipping,
    totalSavings,
    qualifiesForFreeShipping,
    recommendedShipping,
    uniqueProductCount,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    hasDiscount: discount > 0,
    hasShipping: shipping > 0,
    // Add percentage calculations
    discountPercentage: subtotal > 0 ? (discount / subtotal) * 100 : 0,
    savingsPercentage: subtotal > 0 ? (totalSavings / subtotal) * 100 : 0
  };
};

/**
 * Hook for cart validation and checks
 */
export const useCartValidation = () => {
  const { items } = useCart();
  const { getAvailableQuantity } = useCartItems();

  // Check if all items are in stock
  const allItemsInStock = useMemo(() => {
    return items.every(item => {
      // FIX: Use consistent stock property names
      const availableStock = item.product?.stock_quantity || item.product?.stock || 0;
      return availableStock >= item.quantity;
    });
  }, [items]);

  // Check if any items are out of stock
  const outOfStockItems = useMemo(() => {
    return items.filter(item => {
      const availableStock = item.product?.stock_quantity || item.product?.stock || 0;
      return availableStock < item.quantity;
    });
  }, [items]);

  // Check if any items have low stock
  const lowStockItems = useMemo(() => {
    return items.filter(item => {
      const availableStock = item.product?.stock_quantity || item.product?.stock || 0;
      return availableStock > 0 && availableStock <= (CART_CONFIG.LOW_STOCK_THRESHOLD || 5);
    });
  }, [items]);

  // Check if cart is valid for checkout
  const isValidForCheckout = useMemo(() => {
    return items.length > 0 && allItemsInStock;
  }, [items, allItemsInStock]);

  // Get validation errors
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    
    if (items.length === 0) {
      errors.push('Cart is empty');
    }
    
    if (!allItemsInStock) {
      errors.push('Some items are out of stock');
    }
    
    if (outOfStockItems.length > 0) {
      errors.push(`${outOfStockItems.length} item(s) out of stock`);
    }

    return errors;
  }, [items, allItemsInStock, outOfStockItems]);

  // Get item-specific validation
  const getItemValidation = useCallback((item: CartItem) => {
    // FIX: Use consistent stock property names
    const availableStock = item.product?.stock_quantity || item.product?.stock || 0;
    const errors: string[] = [];

    if (availableStock === 0) {
      errors.push('Out of stock');
    } else if (item.quantity > availableStock) {
      errors.push(`Only ${availableStock} available`);
    } else if (availableStock <= (CART_CONFIG.LOW_STOCK_THRESHOLD || 5)) {
      errors.push('Low stock');
    }

    return {
      isValid: errors.length === 0,
      errors,
      availableStock,
      isLowStock: availableStock <= (CART_CONFIG.LOW_STOCK_THRESHOLD || 5) && availableStock > 0,
      maxQuantity: availableStock
    };
  }, []);

  return {
    allItemsInStock,
    outOfStockItems,
    lowStockItems,
    isValidForCheckout,
    validationErrors,
    getItemValidation,
    hasValidationErrors: validationErrors.length > 0,
    outOfStockCount: outOfStockItems.length,
    lowStockCount: lowStockItems.length
  };
};

/**
 * Hook for cart persistence and sync operations
 */
export const useCartPersistence = () => {
  const { syncCartWithServer, loadCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();

  // Force reload cart from source
  const reloadCart = useCallback(async () => {
    await loadCart();
  }, [loadCart]);

  // Clear cart with confirmation
  const clearCartWithConfirmation = useCallback(async (confirmMessage: string = 'Are you sure you want to clear your cart?') => {
    if (window.confirm(confirmMessage)) {
      await clearCart();
      return true;
    }
    return false;
  }, [clearCart]);

  // Export cart data for backup or sharing
  const exportCartData = useCallback(() => {
    const { items } = useCart();
    const cartData = {
      items: items.map(item => ({
        product_id: item.product_id,
        product_name: item.product?.name,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.product?.price || item.price
      })),
      exported_at: new Date().toISOString(),
      total_items: items.reduce((sum, item) => sum + item.quantity, 0),
      total_value: items.reduce((sum, item) => sum + ((item.product?.price || item.price || 0) * item.quantity), 0)
    };
    
    return JSON.stringify(cartData, null, 2);
  }, []);

  // Check if cart needs sync (guest to authenticated)
  const needsSync = useCallback(() => {
    if (!isAuthenticated) return false;
    
    const guestCart = localStorage.getItem('kichofy_guest_cart');
    return !!guestCart;
  }, [isAuthenticated]);

  // Import cart data (for guest cart restoration)
  const importCartData = useCallback(async (cartData: string) => {
    try {
      const parsedData = JSON.parse(cartData);
      // Implementation would depend on your cart structure
      console.log('Importing cart data:', parsedData);
      // You would need to implement the actual import logic here
      return { success: true, items: parsedData.items };
    } catch (error) {
      return { success: false, error: 'Invalid cart data format' };
    }
  }, []);

  return {
    reloadCart,
    syncCartWithServer,
    clearCartWithConfirmation,
    exportCartData,
    importCartData,
    needsSync: needsSync(),
    isAuthenticated
  };
};

/**
 * Hook for cart UI state and interactions
 */
export const useCartUI = () => {
  const { items, isLoading, isSyncing, error } = useCart();
  
  // Check if cart is empty
  const isEmpty = useMemo(() => items.length === 0, [items]);
  
  // Check if cart is loading or syncing
  const isBusy = useMemo(() => isLoading || isSyncing, [isLoading, isSyncing]);
  
  // Get cart summary for display
  const cartSummary = useMemo(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalUniqueItems = items.length;
    
    return {
      totalItems,
      totalUniqueItems,
      isEmpty,
      hasError: !!error,
      isBusy,
      // Add quick status for UI components
      status: isBusy ? 'loading' : isEmpty ? 'empty' : 'ready'
    };
  }, [items, isEmpty, error, isBusy]);

  // Get recent additions (last 3 items added)
  const recentAdditions = useMemo(() => {
    // Since we don't track add time, return last 3 items
    return items.slice(-3).reverse();
  }, [items]);

  // Check if cart is being modified
  const isModifying = useMemo(() => {
    return isSyncing; // You might want to track individual item modifications
  }, [isSyncing]);

  return {
    isEmpty,
    isBusy,
    isModifying,
    error,
    cartSummary,
    recentAdditions,
    hasError: !!error,
    canCheckout: !isEmpty && !isBusy && !error,
    // UI states for different components
    states: {
      isEmpty,
      isBusy,
      hasError: !!error,
      hasItems: !isEmpty,
      isReady: !isEmpty && !isBusy && !error
    }
  };
};

/**
 * Hook for cart analytics and tracking
 */
export const useCartAnalytics = () => {
  const { items } = useCart();
  const { isAuthenticated } = useAuth();

  // Get cart value by category
  const cartValueByCategory = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    
    items.forEach(item => {
      const category = item.product?.category_id || item.product?.category || 'uncategorized';
      const value = (item.product?.price || item.price || 0) * item.quantity;
      
      categoryMap[category] = (categoryMap[category] || 0) + value;
    });
    
    return categoryMap;
  }, [items]);

  // Get most expensive item
  const mostExpensiveItem = useMemo(() => {
    if (items.length === 0) return null;
    
    return items.reduce((max, item) => {
      const itemValue = (item.product?.price || item.price || 0) * item.quantity;
      const maxValue = (max.product?.price || max.price || 0) * max.quantity;
      return itemValue > maxValue ? item : max;
    }, items[0]);
  }, [items]);

  // Get cart statistics
  const cartStats = useMemo(() => {
    const totalValue = items.reduce((sum, item) => {
      return sum + ((item.product?.price || item.price || 0) * item.quantity);
    }, 0);
    
    const averageItemValue = items.length > 0 ? totalValue / items.length : 0;
    
    return {
      totalValue,
      averageItemValue,
      categoryBreakdown: cartValueByCategory,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      uniqueProductCount: items.length,
      userType: isAuthenticated ? 'authenticated' : 'guest',
      // Additional metrics
      highestValueCategory: Object.keys(cartValueByCategory).reduce((a, b) => 
        cartValueByCategory[a] > cartValueByCategory[b] ? a : b, 'uncategorized'
      )
    };
  }, [items, cartValueByCategory, isAuthenticated]);

  // Prepare data for analytics events
  const getAnalyticsData = useCallback(() => {
    return {
      total_value: cartStats.totalValue,
      item_count: cartStats.itemCount,
      product_count: cartStats.uniqueProductCount,
      categories: Object.keys(cartValueByCategory),
      user_type: cartStats.userType,
      has_premium_items: cartStats.averageItemValue > 500
    };
  }, [cartStats, cartValueByCategory]);

  return {
    cartValueByCategory,
    mostExpensiveItem,
    cartStats,
    getAnalyticsData,
    hasHighValueItems: cartStats.totalValue > 1000, // ₹1000 threshold
    isPremiumCart: cartStats.averageItemValue > 500, // ₹500 average item value
    // Quick metrics for display
    metrics: {
      totalValue: cartStats.totalValue,
      itemCount: cartStats.itemCount,
      categoryCount: Object.keys(cartValueByCategory).length
    }
  };
};

// Re-export the main useCart hook as default
export default useCart;