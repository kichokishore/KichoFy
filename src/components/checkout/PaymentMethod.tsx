import React from 'react';

interface PaymentMethodProps {
  paymentMethod: string;
  onChange: (method: string) => void;
  total: number;
}

export const PaymentMethod: React.FC<PaymentMethodProps> = ({ 
  paymentMethod, 
  onChange, 
  total 
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
        Payment Method
      </h2>

      <div className="space-y-3 sm:space-y-4">
        <label className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 border-2 border-primary bg-primary/5 rounded-lg cursor-pointer transition-all">
          <input
            type="radio"
            name="payment"
            value="cod"
            checked={paymentMethod === 'cod'}
            onChange={(e) => onChange(e.target.value)}
            className="text-primary focus:ring-primary"
          />
          <div className="flex-1">
            <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
              Cash on Delivery
            </span>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Pay when you receive your order
            </p>
          </div>
        </label>

        <label className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary/50 transition-all">
          <input
            type="radio"
            name="payment"
            value="upi"
            checked={paymentMethod === 'upi'}
            onChange={(e) => onChange(e.target.value)}
            className="text-primary focus:ring-primary"
          />
          <div className="flex-1">
            <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
              UPI Payment
            </span>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Pay using UPI apps, QR code, or phone
            </p>
          </div>
        </label>
      </div>

      {paymentMethod === 'cod' && (
        <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
            💡 You'll pay ₹{total.toLocaleString()} when your order is delivered.
          </p>
        </div>
      )}

      {paymentMethod === 'upi' && (
        <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-xs sm:text-sm text-green-700 dark:text-green-300">
            ✅ Multiple payment options available. Order confirmed after payment verification.
          </p>
        </div>
      )}
    </div>
  );
};