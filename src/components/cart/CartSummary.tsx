// src/components/cart/CartSummary.tsx
import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface CartSummaryProps {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  totalItems: number;
}

const CartSummary: React.FC<CartSummaryProps> = ({
  subtotal,
  shipping,
  tax,
  total,
  totalItems
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        {t('cart.orderSummary') || 'Order Summary'}
      </h2>

      <dl className="space-y-4">
        {/* Items Count */}
        <div className="flex items-center justify-between">
          <dt className="text-sm text-gray-600 dark:text-gray-400">
            {totalItems} {totalItems === 1 ? t('cart.item') || 'item' : t('cart.items') || 'items'}
          </dt>
          <dd className="text-sm font-medium text-gray-900 dark:text-white">
            ₹{subtotal.toLocaleString()}
          </dd>
        </div>

        {/* Shipping */}
        <div className="flex items-center justify-between">
          <dt className="text-sm text-gray-600 dark:text-gray-400">
            {t('cart.shipping') || 'Shipping'}
          </dt>
          <dd className="text-sm font-medium text-gray-900 dark:text-white">
            {shipping === 0 ? (
              <span className="text-green-600 dark:text-green-400">
                {t('cart.free') || 'Free'}
              </span>
            ) : (
              `₹${shipping.toLocaleString()}`
            )}
          </dd>
        </div>

        {/* Tax */}
        <div className="flex items-center justify-between">
          <dt className="text-sm text-gray-600 dark:text-gray-400">
            {t('cart.tax') || 'Tax (GST)'}
          </dt>
          <dd className="text-sm font-medium text-gray-900 dark:text-white">
            ₹{tax.toLocaleString()}
          </dd>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4"></div>

        {/* Total */}
        <div className="flex items-center justify-between">
          <dt className="text-base font-medium text-gray-900 dark:text-white">
            {t('cart.total') || 'Total'}
          </dt>
          <dd className="text-base font-medium text-gray-900 dark:text-white">
            ₹{total.toLocaleString()}
          </dd>
        </div>
      </dl>

      {/* Shipping Note */}
      {subtotal < 999 && shipping > 0 && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
            {t('cart.freeShippingNote') || 'Add ₹'} {(999 - subtotal).toLocaleString()} {t('cart.moreForFreeShipping') || 'more for free shipping!'}
          </p>
        </div>
      )}

      {/* Estimated Delivery */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t('cart.estimatedDelivery') || 'Estimated delivery: 3-5 business days'}
        </div>
      </div>
    </div>
  );
};

export default CartSummary;