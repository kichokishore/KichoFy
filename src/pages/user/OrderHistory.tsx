// src/pages/user/OrderHistory.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FiPackage as Package,
  FiTruck as Truck,
  FiCheckCircle as CheckCircle,
  FiClock as Clock,
  FiXCircle as XCircle,
  FiEye as Eye,
  FiRefreshCw as Refresh
} from 'react-icons/fi';
import { useApp } from '../../contexts/AppContext';
import { useOrders } from '../../hooks/useOrders';
import { Order, OrderStatus } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { Button } from '../../components/UI/Button';
import { LoadingSpinner } from '../../components/UI/LoadingSpinner';
import { OrderStatusBadge } from '../../components/order/OrderStatusBadge';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export const OrderHistory: React.FC = () => {
  const { state } = useApp();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    orders,
    loading,
    error,
    refreshOrders
  } = useOrders();

  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (state.user) {
      refreshOrders();
    }
  }, [state.user]);

  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'all') return true;
    return order.status === filterStatus;
  });

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
      case 'completed':
        return <CheckCircle className="text-green-500" />;
      case 'shipped':
        return <Truck className="text-blue-500" />;
      case 'pending':
      case 'confirmed':
      case 'processing':
        return <Clock className="text-yellow-500" />;
      case 'cancelled':
      case 'refunded':
        return <XCircle className="text-red-500" />;
      default:
        return <Package className="text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewOrder = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  const getOrderItemsCount = (order: Order) => {
    return order.order_items?.reduce((total, item) => total + item.quantity, 0) || 0;
  };

  if (!state.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('orderHistory')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {t('viewYourOrderHistory')}
              </p>
            </div>
            <Button
              onClick={refreshOrders}
              variant="secondary"
              disabled={loading}
              className="flex items-center"
            >
              <Refresh className={`mr-2 ${loading ? 'animate-spin' : ''}`} size={18} />
              {t('refresh')}
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg dark:bg-red-900 dark:text-red-100"
            >
              {error}
            </motion.div>
          )}

          {/* Filters */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {t('allOrders')}
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filterStatus === 'pending'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {t('pending')}
              </button>
              <button
                onClick={() => setFilterStatus('processing')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filterStatus === 'processing'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {t('processing')}
              </button>
              <button
                onClick={() => setFilterStatus('shipped')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filterStatus === 'shipped'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {t('shipped')}
              </button>
              <button
                onClick={() => setFilterStatus('delivered')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filterStatus === 'delivered'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {t('delivered')}
              </button>
              <button
                onClick={() => setFilterStatus('cancelled')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filterStatus === 'cancelled'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {t('cancelled')}
              </button>
            </div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          )}

          {/* Orders List */}
          {!loading && filteredOrders.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
            >
              <Package className="mx-auto text-gray-400" size={48} />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                {filterStatus === 'all' ? t('noOrders') : t('noOrdersWithFilter')}
              </h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                {filterStatus === 'all' ? t('noOrdersDescription') : t('noOrdersWithFilterDescription')}
              </p>
              {filterStatus !== 'all' && (
                <Button
                  onClick={() => setFilterStatus('all')}
                  variant="primary"
                  className="mt-4"
                >
                  {t('viewAllOrders')}
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <motion.div
                  key={order.id}
                  variants={itemVariants}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-primary bg-opacity-10 rounded-full">
                          {getStatusIcon(order.status)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {t('order')} #{order.id.slice(-8).toUpperCase()}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <OrderStatusBadge status={order.status} />
                        <Button
                          onClick={() => handleViewOrder(order.id)}
                          variant="secondary"
                          size="sm"
                          className="flex items-center"
                        >
                          <Eye className="mr-2" size={16} />
                          {t('viewDetails')}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Order Content */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Order Items */}
                      <div className="md:col-span-2">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                          {t('items')} ({getOrderItemsCount(order)})
                        </h4>
                        <div className="space-y-3">
                          {order.order_items?.slice(0, 3).map((item, index) => (
                            <div key={item.id} className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden flex-shrink-0">
                                {item.product?.image_url ? (
                                  <img
                                    src={item.product.image_url}
                                    alt={item.product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                    <Package className="text-gray-500" size={20} />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {item.product?.name || t('productNotAvailable')}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {t('quantity')}: {item.quantity}
                                  {item.size && ` • ${t('size')}: ${item.size}`}
                                  {item.color && ` • ${t('color')}: ${item.color}`}
                                </p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  ₹{item.price.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                          {order.order_items && order.order_items.length > 3 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              +{order.order_items.length - 3} {t('moreItems')}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            {t('orderSummary')}
                          </h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">{t('subtotal')}</span>
                              <span className="text-gray-900 dark:text-white">
                                ₹{order.total_amount.toLocaleString()}
                              </span>
                            </div>
                            {order.discount_amount && order.discount_amount > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">{t('discount')}</span>
                                <span className="text-green-600 dark:text-green-400">
                                  -₹{order.discount_amount.toLocaleString()}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2">
                              <span className="font-medium text-gray-900 dark:text-white">{t('total')}</span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                ₹{order.total_amount.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Shipping Address */}
                        {order.shipping_address && (
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                              {t('shippingAddress')}
                            </h4>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <p>{order.shipping_address.name}</p>
                              <p>{order.shipping_address.street}</p>
                              <p>
                                {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                              </p>
                              {order.shipping_address.phone && (
                                <p>{order.shipping_address.phone}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default OrderHistory;