// src/pages/order/Orders.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiPackage as Package,
  FiCalendar as Calendar,
  FiSearch as Search,
  FiFilter as Filter,
  FiRefreshCw as Refresh,
  FiArrowLeft as ArrowLeft,
  FiDollarSign as DollarSign
} from 'react-icons/fi';
import { useApp } from '../../contexts/AppContext';
import { useOrders } from '../../hooks/useOrders';
import { Order } from '../../types';
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

export const Orders: React.FC = () => {
  const { state } = useApp();
  const navigate = useNavigate();
  const {
    orders,
    loading,
    error,
    refreshOrders
  } = useOrders();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (state.user) {
      refreshOrders();
    }
  }, [state.user]);

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (statusFilter === 'all' || order.status === statusFilter)
  );

  const getProductNames = (order: Order) => {
    if (!order.order_items || order.order_items.length === 0) {
      return 'No products';
    }
    
    const names = order.order_items
      .slice(0, 2)
      .map(item => item.product?.name || 'Product')
      .join(', ');
    
    if (order.order_items.length > 2) {
      return `${names} and ${order.order_items.length - 2} more`;
    }
    
    return names;
  };

  const getTotalItems = (order: Order) => {
    return order.order_items?.reduce((total, item) => total + item.quantity, 0) || 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (!state.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center max-w-xs w-full">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600 dark:text-gray-300 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 px-3 sm:px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4 sm:space-y-6"
        >
          {/* Header */}
          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 sm:gap-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="p-1.5 sm:p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft size={16} className="sm:w-5 sm:h-5" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  My Orders
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  Track and manage your orders ({orders.length} orders)
                </p>
              </div>
            </div>
            
            <Button
              onClick={refreshOrders}
              variant="secondary"
              disabled={loading}
              size="sm"
              className="flex items-center text-xs sm:text-sm"
            >
              <Refresh className={`mr-1 sm:mr-2 ${loading ? 'animate-spin' : ''}`} size={14} />
              Refresh
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 sm:p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg dark:bg-red-900 dark:text-red-100 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Filters */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search orders by ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-primary focus:border-primary"
                />
              </div>
              
              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-primary focus:border-primary appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="payment_review">Payment Review</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-8 sm:py-12">
              <LoadingSpinner size="large" />
            </div>
          )}

          {/* Orders List */}
          {!loading && filteredOrders.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="text-center py-8 sm:py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
            >
              <Package className="mx-auto text-gray-400" size={48} />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                {searchTerm || statusFilter !== 'all' ? 'No orders found' : 'No orders yet'}
              </h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Start shopping to see your orders here'
                }
              </p>
              {(searchTerm || statusFilter !== 'all') ? (
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  variant="primary"
                  className="mt-4 text-sm"
                >
                  Clear Filters
                </Button>
              ) : (
                <Button
                  onClick={() => navigate('/collections')}
                  variant="primary"
                  className="mt-4 text-sm"
                >
                  Start Shopping
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredOrders.map((order) => (
                <motion.div
                  key={order.id}
                  variants={itemVariants}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  {/* Order Header */}
                  <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col xs:flex-row xs:items-center gap-2 mb-2">
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                            Order #
                          </h3>
                          <code className="text-xs sm:text-sm font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                            {order.id.slice(-8).toUpperCase()}
                          </code>
                        </div>
                        <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">
                          <Calendar size={14} />
                          <span>Placed on {formatDate(order.created_at)}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {getProductNames(order)}
                        </p>
                      </div>
                      <div className="flex flex-col xs:flex-row xs:items-center gap-2 sm:gap-4">
                        <OrderStatusBadge status={order.status} />
                        <div className="flex items-center space-x-1 text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                          <DollarSign size={16} className="sm:w-5 sm:h-5" />
                          <span>₹{order.total_amount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Footer */}
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                        <Package size={16} />
                        <span className="text-xs sm:text-sm">
                          {getTotalItems(order)} items
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => navigate(`/orders/${order.id}`)}
                          variant="secondary"
                          size="sm"
                          className="text-xs"
                        >
                          View Details
                        </Button>
                        {order.status === 'shipped' && (
                          <Button
                            onClick={() => navigate(`/track-order/${order.id}`)}
                            variant="primary"
                            size="sm"
                            className="text-xs"
                          >
                            Track Order
                          </Button>
                        )}
                        {order.status === 'payment_review' && (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                            Payment Under Review
                          </span>
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

export default Orders;