import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CartItem } from './types';

interface OrderSummaryProps {
  cart: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  loading: boolean;
  orderSubmitted: boolean;
  paymentMethod: string;
  onSubmit: () => void;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  cart,
  subtotal,
  shipping,
  total,
  loading,
  orderSubmitted,
  paymentMethod,
  onSubmit
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg sticky top-4 sm:top-8">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
        Order Summary
      </h2>

      {/* Cart Items */}
      <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 max-h-60 sm:max-h-80 overflow-y-auto">
        {cart.map((item) => (
          <div key={item.id} className="flex items-center space-x-3 sm:space-x-4 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <img
              src={item.product?.image_url}
              alt={item.product?.name}
              className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                {item.product?.name}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Qty: {item.quantity} • {item.size} • {item.color}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                ₹{((item.product?.price || 0) * item.quantity).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-2 sm:space-y-3 border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Subtotal</span>
          <span className="font-semibold text-sm sm:text-base">₹{subtotal.toLocaleString()}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Shipping</span>
          <span className="font-semibold text-sm sm:text-base">
            {shipping === 0 ? (
              <span className="text-green-600">FREE</span>
            ) : (
              `₹${shipping}`
            )}
          </span>
        </div>

        {subtotal < 999 && (
          <div className="text-xs sm:text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded">
            Add ₹{(999 - subtotal).toLocaleString()} more for FREE shipping!
          </div>
        )}

        <div className="border-t border-gray-200 dark:border-gray-700 pt-2 sm:pt-3">
          <div className="flex justify-between text-base sm:text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">₹{total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Place Order Button */}
      <button
        onClick={onSubmit}
        disabled={loading || orderSubmitted}
        className="w-full bg-primary hover:bg-primary-light text-white py-3 sm:py-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 sm:mt-6 flex items-center justify-center space-x-2 text-sm sm:text-base"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Processing Order...</span>
          </>
        ) : paymentMethod === 'cod' ? (
          <span>Place Order (Cash on Delivery)</span>
        ) : (
          <span>Proceed to UPI Payment</span>
        )}
      </button>

      {/* Security Notice */}
      <div className="mt-3 sm:mt-4 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center space-x-1">
          <span>🔒</span>
          <span>Your information is secure and protected</span>
        </p>
      </div>

      {/* Continue Shopping */}
      <button
        type="button"
        onClick={() => navigate('/collections')}
        className="w-full mt-2 sm:mt-3 px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base"
      >
        Continue Shopping
      </button>
    </div>
  );
};