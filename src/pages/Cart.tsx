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
  const shipping = subtotal > 999 ? 0 : 99;
  const total = subtotal + shipping;

  if (state.cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-6">
            <ShoppingBag size={80} className="mx-auto" />
          </div>
          <h2 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mb-4">
            {t('emptyCart')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
            Looks like you haven't added any items to your cart yet. 
            Start exploring our beautiful collection!
          </p>
          <Link
            to="/collections"
            className="inline-flex items-center bg-primary hover:bg-primary-light text-white px-8 py-3 rounded-full font-semibold transition-colors"
          >
            {t('continueShopping')}
            <ArrowRight className="ml-2" size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 dark:text-white mb-2">
            Shopping {t('cart')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {state.cart.length} {state.cart.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {state.cart.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center space-x-6">
                  {/* Product Image */}
                  <img
                    src={item.product?.image_url}
                    alt={item.product?.name}
                    className="w-24 h-24 object-cover rounded-xl"
                  />

                  {/* Product Details */}
                  <div className="flex-1">
                    <h3 className="font-heading text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {item.product?.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                      {item.product?.description}
                    </p>
                    
                    {/* Variant Details */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.color && <span>Color: {item.color}</span>}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">
                      ₹{item.product?.price?.toLocaleString()}
                    </div>
                    {item.product?.originalPrice && (
                      <div className="text-sm text-gray-400 line-through">
                        ₹{item.product.originalPrice.toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-12 text-center font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-2"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg sticky top-8">
              <h3 className="font-heading text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Order Summary
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t('subtotal')}</span>
                  <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
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
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Add ₹{(999 - subtotal).toLocaleString()} more for FREE shipping!
                    </p>
                  </div>
                )}

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>{t('total')}</span>
                    <span className="text-primary">₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full bg-primary hover:bg-primary-light text-white py-3 rounded-full font-semibold transition-colors text-center block mb-4"
              >
                {t('proceedToCheckout')}
              </Link>

              <Link
                to="/collections"
                className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 py-3 rounded-full font-semibold transition-colors text-center block"
              >
                {t('continueShopping')}
              </Link>

              {/* Security Badges */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Free Returns</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-8">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* This would normally show recommended products */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg text-center">
              <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Recommended products coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};