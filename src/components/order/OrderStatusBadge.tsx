// src/components/order/OrderStatusBadge.tsx
import React from 'react';
import { OrderStatus } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  const { t } = useTranslation();

  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          darkBg: 'dark:bg-yellow-900',
          darkText: 'dark:text-yellow-100',
          label: t('pending')
        };
      case 'confirmed':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          darkBg: 'dark:bg-blue-900',
          darkText: 'dark:text-blue-100',
          label: t('confirmed')
        };
      case 'processing':
        return {
          bg: 'bg-indigo-100',
          text: 'text-indigo-800',
          darkBg: 'dark:bg-indigo-900',
          darkText: 'dark:text-indigo-100',
          label: t('processing')
        };
      case 'shipped':
        return {
          bg: 'bg-purple-100',
          text: 'text-purple-800',
          darkBg: 'dark:bg-purple-900',
          darkText: 'dark:text-purple-100',
          label: t('shipped')
        };
      case 'delivered':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          darkBg: 'dark:bg-green-900',
          darkText: 'dark:text-green-100',
          label: t('delivered')
        };
      case 'completed':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          darkBg: 'dark:bg-green-900',
          darkText: 'dark:text-green-100',
          label: t('completed')
        };
      case 'cancelled':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          darkBg: 'dark:bg-red-900',
          darkText: 'dark:text-red-100',
          label: t('cancelled')
        };
      case 'refunded':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          darkBg: 'dark:bg-gray-900',
          darkText: 'dark:text-gray-100',
          label: t('refunded')
        };
      case 'payment_review':
        return {
          bg: 'bg-orange-100',
          text: 'text-orange-800',
          darkBg: 'dark:bg-orange-900',
          darkText: 'dark:text-orange-100',
          label: t('paymentReview')
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          darkBg: 'dark:bg-gray-900',
          darkText: 'dark:text-gray-100',
          label: status
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} ${config.darkBg} ${config.darkText}`}>
      {config.label}
    </span>
  );
};