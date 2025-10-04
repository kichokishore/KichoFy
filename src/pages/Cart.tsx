// src/pages/Cart.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, X, ShoppingBag, ArrowRight } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../utils/supabaseClient';

export const Cart: React.FC = () => {
  const { state, dispatch } = useApp();
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load cart from database on component mount
  useEffect(() => {
    loadCartFromDatabase();
  }, [state.user]);

  const loadCartFromDatabase = async () => {
    if (!state.user) {
      setLoading(false);
      return;
    }

    try {
      console.log('Loading cart for user:', state.user.id);
      
      const { data: cartItems, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          size,
          color,
          product_id,
          products!inner(
            id,
            name,
            description,
            price,
            original_price,
            image_url,
            stock
          )
        `)
        .eq('user_id', state.user.id);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Cart items from database:', cartItems);

      if (cartItems && cartItems.length > 0) {
        // Transform database cart items to app cart format
        const formattedCart = cartItems.map(item => ({
          id: item.id,
          product_id: item.product_id,
          quantity: item.quantity,
          size: item.size || undefined,
          color: item.color || undefined,
          product: {
            id: item.products.id,
            name: item.products.name,
            description: item.products.description,
            price: item.products.price,
            originalPrice: item.products.original_price,
            image_url: item.products.image_url,
            stock: item.products.stock
          }
        }));

        console.log('Formatted cart:', formattedCart);
        dispatch({ type: 'SET_CART', payload: formattedCart });
      } else {
        console.log('No cart items found for user');
        dispatch({ type: 'SET_CART', payload: [] });
      }
    } catch (error) {
      console.error('Error loading cart from database:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncCartToDatabase = async (cartItem: any, operation: 'add' | 'update' | 'remove') => {
    if (!state.user) return;

    setSyncing(true);
    try {
      switch (operation) {
        case 'add':
          const { data: newItem, error: addError } = await supabase
            .from('cart_items')
            .upsert({
              user_id: state.user.id,
              product_id: cartItem.product_id,
              quantity: cartItem.quantity,
              size: cartItem.size || null,
              color: cartItem.color || null
            }, {
              onConflict: 'user_id,product_id,size,color'
            })
            .select()
            .single();

          if (addError) throw addError;
          console.log('Item added to database:', newItem);
          break;

        case 'update':
          const { error: updateError } = await supabase
            .from('cart_items')
            .update({ 
              quantity: cartItem.quantity,
              updated_at: new Date().toISOString()
            })
            .eq('id', cartItem.id)
            .eq('user_id', state.user.id);

          if (updateError) throw updateError;
          console.log('Item updated in database:', cartItem.id);
          break;

        case 'remove':
          const { error: deleteError } = await supabase
            .from('cart_items')
            .delete()
            .eq('id', cartItem.id)
            .eq('user_id', state.user.id);

          if (deleteError) throw deleteError;
          console.log('Item removed from database:', cartItem.id);
          break;
      }
    } catch (error) {
      console.error('Error syncing cart to database:', error);
    } finally {
      setSyncing(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    const item = state.cart.find(item => item.id === itemId);
    if (!item) return;

    if (newQuantity <= 0) {
      removeItem(itemId);
    } else {
      dispatch({ 
        type: 'UPDATE_CART_QUANTITY', 
        payload: { id: itemId, quantity: newQuantity } 
      });
      
      // Sync to database
      await syncCartToDatabase({ ...item, quantity: newQuantity }, 'update');
    }
  };

  const removeItem = async (itemId: string) => {
    const item = state.cart.find(item => item.id === itemId);
    if (!item) return;

    dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
    
    // Remove from database
    await syncCartToDatabase(item, 'remove');
  };

  const subtotal = state.cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const shipping = subtotal > 999 ? 0 : 50;
  const total = subtotal + shipping;

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (state.cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-xs w-full">
          <div className="text-gray-400 mb-4 sm:mb-6">
            <ShoppingBag size={60} className="mx-auto sm:w-20 sm:h-20" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-6 sm:mb-8">
            Looks like you haven't added any items to your cart yet. 
            Start exploring our beautiful collection!
          </p>
          <Link
            to="/collections"
            className="inline-flex items-center justify-center bg-primary hover:bg-primary-light text-white px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-full font-semibold transition-colors text-sm sm:text-base w-full sm:w-auto"
          >
            Continue Shopping
            <ArrowRight className="ml-2" size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-6 md:py-8">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-gray-900 dark:text-white mb-2">
            Shopping Cart
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            {state.cart.length} {state.cart.length === 1 ? 'item' : 'items'} in your cart
            {syncing && <span className="text-blue-500 ml-2">• Syncing...</span>}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {state.cart.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col xs:flex-row xs:items-center gap-3 sm:gap-4 md:gap-6">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.product?.image_url || '/assets/fallback.jpg'}
                      alt={item.product?.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-cover rounded-lg sm:rounded-xl"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/fallback.jpg';
                      }}
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                          {item.product?.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-2 line-clamp-2">
                          {item.product?.description}
                        </p>
                        
                        {/* Variant Details */}
                        <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          {item.size && (
                            <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Size: {item.size}</span>
                          )}
                          {item.color && (
                            <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Color: {item.color}</span>
                          )}
                        </div>
                      </div>

                      {/* Price - Mobile */}
                      <div className="xs:hidden flex items-center justify-between">
                        <div className="text-lg font-bold text-primary">
                          ₹{((item.product?.price || 0) * item.quantity).toLocaleString()}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Price - Desktop */}
                      <div className="hidden xs:block text-right">
                        <div className="text-lg sm:text-xl font-bold text-primary">
                          ₹{((item.product?.price || 0) * item.quantity).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          ₹{item.product?.price?.toLocaleString()} each
                        </div>
                      </div>
                    </div>

                    {/* Quantity Controls and Remove Button */}
                    <div className="flex items-center justify-between mt-3 sm:mt-4">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Minus size={12} className="sm:w-3.5 sm:h-3.5" />
                        </button>
                        <span className="w-8 sm:w-12 text-center font-semibold text-sm sm:text-base">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Plus size={12} className="sm:w-3.5 sm:h-3.5" />
                        </button>
                      </div>

                      {/* Remove Button - Desktop */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="hidden xs:block text-gray-400 hover:text-red-500 transition-colors p-1 sm:p-2"
                      >
                        <X size={18} className="sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg sticky top-4 sm:top-8">
              <h3 className="font-heading text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Order Summary
              </h3>

              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                  <span className="font-semibold">
                    {shipping === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `₹${shipping}`
                    )}
                  </span>
                </div>

                {subtotal < 999 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-2 sm:p-3 rounded-lg">
                    <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                      Add ₹{(999 - subtotal).toLocaleString()} more for FREE shipping!
                    </p>
                  </div>
                )}

                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4">
                  <div className="flex justify-between text-base sm:text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full bg-primary hover:bg-primary-light text-white py-2.5 sm:py-3 rounded-full font-semibold transition-colors text-center block mb-3 text-sm sm:text-base"
              >
                Proceed to Checkout
              </Link>

              <Link
                to="/collections"
                className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 py-2.5 sm:py-3 rounded-full font-semibold transition-colors text-center block text-sm sm:text-base"
              >
                Continue Shopping
              </Link>

              {/* Security Badges */}
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col xs:flex-row xs:items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center justify-center space-x-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
                    <span>Free Returns</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Products */}
        <div className="mt-8 sm:mt-12 md:mt-16">
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 md:mb-8">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {/* This would normally show recommended products */}
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg text-center">
              <div className="w-full h-32 sm:h-40 md:h-48 bg-gray-200 dark:bg-gray-700 rounded-lg sm:rounded-xl mb-3 sm:mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Recommended products coming soon...</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg text-center">
              <div className="w-full h-32 sm:h-40 md:h-48 bg-gray-200 dark:bg-gray-700 rounded-lg sm:rounded-xl mb-3 sm:mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Recommended products coming soon...</p>
            </div>
            <div className="hidden sm:block bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg text-center">
              <div className="w-full h-32 sm:h-40 md:h-48 bg-gray-200 dark:bg-gray-700 rounded-lg sm:rounded-xl mb-3 sm:mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Recommended products coming soon...</p>
            </div>
            <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg text-center">
              <div className="w-full h-32 sm:h-40 md:h-48 bg-gray-200 dark:bg-gray-700 rounded-lg sm:rounded-xl mb-3 sm:mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Recommended products coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;