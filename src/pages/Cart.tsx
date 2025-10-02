import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, X, ShoppingBag, ArrowRight } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useTranslation } from '../hooks/useTranslation';

export const Cart: React.FC = () => {
  const { state, dispatch } = useApp();
  const { t } = useTranslation();

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
    } else {
      dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { id: itemId, quantity: newQuantity } });
    }
  };

  const removeItem = (itemId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
  };

  const subtotal = state.cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const shipping = subtotal > 999 ? 0 : 1;
  const total = subtotal + shipping;

  if (state.cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-xs w-full">
          <div className="text-gray-400 mb-4 sm:mb-6">
            <ShoppingBag size={60} className="mx-auto sm:w-20 sm:h-20" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            {t('emptyCart')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-6 sm:mb-8">
            Looks like you haven't added any items to your cart yet. 
            Start exploring our beautiful collection!
          </p>
          <Link
            to="/collections"
            className="inline-flex items-center justify-center bg-primary hover:bg-primary-light text-white px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-full font-semibold transition-colors text-sm sm:text-base w-full sm:w-auto"
          >
            {t('continueShopping')}
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
            Shopping {t('cart')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            {state.cart.length} {state.cart.length === 1 ? 'item' : 'items'} in your cart
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
                      src={item.product?.image_url}
                      alt={item.product?.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-cover rounded-lg sm:rounded-xl"
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
                          ₹{item.product?.price?.toLocaleString()}
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
                          ₹{item.product?.price?.toLocaleString()}
                        </div>
                        {item.product?.originalPrice && (
                          <div className="text-sm text-gray-400 line-through">
                            ₹{item.product.originalPrice.toLocaleString()}
                          </div>
                        )}
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
                  <span className="text-gray-600 dark:text-gray-400">{t('subtotal')}</span>
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
                    <span>{t('total')}</span>
                    <span className="text-primary">₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full bg-primary hover:bg-primary-light text-white py-2.5 sm:py-3 rounded-full font-semibold transition-colors text-center block mb-3 text-sm sm:text-base"
              >
                {t('proceedToCheckout')}
              </Link>

              <Link
                to="/collections"
                className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 py-2.5 sm:py-3 rounded-full font-semibold transition-colors text-center block text-sm sm:text-base"
              >
                {t('continueShopping')}
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