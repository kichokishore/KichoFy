// src/components/order/OrderCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Package, IndianRupee, MapPin, Eye } from 'lucide-react';
import { Order, OrderItem } from '../../types';
import { OrderStatusBadge } from './OrderStatusBadge';
import { formatDate, formatCurrency } from '../../utils/formatters';

interface OrderCardProps {
  order: Order;
  onViewDetails?: (orderId: string) => void;
  compact?: boolean;
}

export const OrderCard: React.FC<OrderCardProps> = ({ 
  order, 
  onViewDetails,
  compact = false 
}) => {
  const totalItems = order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(order.id);
    }
  };

  if (compact) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {/* Order ID */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <Package className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-white truncate">
                  Order #{order.id.slice(-8).toUpperCase()}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(order.created_at)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Package className="w-3 h-3" />
                  <span>{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>

            {/* Amount */}
            <div className="text-right">
              <div className="flex items-center space-x-1 text-lg font-semibold text-gray-900 dark:text-white">
                <IndianRupee className="w-4 h-4" />
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
              <OrderStatusBadge status={order.status} className="mt-1" />
            </div>
          </div>

          {/* Action Button */}
          <div className="ml-4">
            <Link
              to={`/order/${order.id}`}
              className="flex items-center space-x-1 px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
            >
              <Eye size={14} />
              <span>View</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Order #{order.id.slice(-8).toUpperCase()}
              </h3>
              <div className="flex items-center space-x-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Placed on {formatDate(order.created_at)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <OrderStatusBadge status={order.status} />
            <div className="text-right">
              <div className="flex items-center space-x-1 text-xl font-bold text-gray-900 dark:text-white">
                <IndianRupee className="w-5 h-5" />
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {totalItems} item{totalItems !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      {order.shipping_address && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Shipping Address
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {typeof order.shipping_address === 'string' 
                  ? order.shipping_address
                  : `${order.shipping_address.street}, ${order.shipping_address.city}, ${order.shipping_address.state} - ${order.shipping_address.postal_code}`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="px-6 py-4">
        <div className="space-y-4">
          {order.order_items?.slice(0, 3).map((item: OrderItem) => (
            <div key={item.id} className="flex items-center space-x-4">
              {/* Product Image */}
              <div className="flex-shrink-0">
                <img
                  src={item.product?.image_url || '/assets/fallback.jpg'}
                  alt={item.product?.name}
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/fallback.jpg';
                  }}
                />
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                  {item.product?.name}
                </h4>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {item.size && (
                    <span>Size: {item.size}</span>
                  )}
                  {item.color && (
                    <span>Color: {item.color}</span>
                  )}
                  <span>Qty: {item.quantity}</span>
                </div>
                <div className="flex items-center space-x-1 mt-1 text-gray-900 dark:text-white">
                  <IndianRupee className="w-3 h-3" />
                  <span className="font-medium">{formatCurrency(item.price)}</span>
                </div>
              </div>

              {/* Item Total */}
              <div className="text-right">
                <div className="flex items-center space-x-1 text-lg font-semibold text-gray-900 dark:text-white">
                  <IndianRupee className="w-4 h-4" />
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Show more items indicator */}
          {order.order_items && order.order_items.length > 3 && (
            <div className="text-center pt-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                +{order.order_items.length - 3} more item{order.order_items.length - 3 !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Package className="w-4 h-4" />
            <span>
              {order.payment_status === 'paid' ? 'Payment Completed' : 
               order.payment_status === 'pending' ? 'Payment Pending' : 
               'Payment Failed'}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Track Order Button */}
            {order.status !== 'delivered' && order.status !== 'cancelled' && (
              <Link
                to={`/track-order/${order.id}`}
                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Track Order
              </Link>
            )}

            {/* View Details Button */}
            <Link
              to={`/order/${order.id}`}
              className="flex items-center space-x-2 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
            >
              <Eye size={16} />
              <span>View Details</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;